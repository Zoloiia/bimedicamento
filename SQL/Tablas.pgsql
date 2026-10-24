-- ============================================================
-- BASE DE DATOS: PostgreSQL
-- ============================================================

-- 1. TABLA PRINCIPAL
CREATE TABLE IF NOT EXISTS medicamento (
    id              SERIAL PRIMARY KEY,                 -- Autoincremental
    nombre          VARCHAR(100) NOT NULL,
    laboratorio     VARCHAR(100) NOT NULL,
    stock           INT          NOT NULL DEFAULT 0
                    CHECK (stock >= 0),                 -- Nunca negativo
    stock_minimo    INT          NOT NULL DEFAULT 10
                    CHECK (stock_minimo >= 0),          -- Debajo de esto hay alerta
    precio          NUMERIC(10,2) NOT NULL
                    CHECK (precio >= 0),
    fecha_registro  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Evita duplicar el mismo medicamento del mismo laboratorio
CREATE UNIQUE INDEX IF NOT EXISTS ux_medicamento_nombre_lab
    ON medicamento (LOWER(nombre), LOWER(laboratorio));

-- 2. TABLA DE AUDITORÍA (trazabilidad)
CREATE TABLE IF NOT EXISTS auditoria_medicamento (
    id_auditoria    BIGSERIAL PRIMARY KEY,
    id_medicamento  INT         NOT NULL,
    accion          VARCHAR(10) NOT NULL,               -- INSERT, UPDATE o DELETE
    detalle         TEXT,
    fecha_accion    TIMESTAMP   NOT NULL DEFAULT NOW(),
    usuario_bd      VARCHAR(60) NOT NULL DEFAULT CURRENT_USER
);

-- 3. FUNCIÓN + TRIGGER: se ejecuta sola en cada INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION fn_auditar_medicamento()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO auditoria_medicamento (id_medicamento, accion, detalle)
        VALUES (NEW.id, 'INSERT',
                'Nuevo: ' || NEW.nombre || ' | stock=' || NEW.stock || ' | precio=' || NEW.precio);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_medicamento (id_medicamento, accion, detalle)
        VALUES (NEW.id, 'UPDATE',
                'Stock ' || OLD.stock || ' -> ' || NEW.stock ||
                ' | Precio ' || OLD.precio || ' -> ' || NEW.precio);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_medicamento (id_medicamento, accion, detalle)
        VALUES (OLD.id, 'DELETE', 'Eliminado: ' || OLD.nombre);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auditar_medicamento ON medicamento;

CREATE TRIGGER trg_auditar_medicamento
AFTER INSERT OR UPDATE OR DELETE ON medicamento
FOR EACH ROW EXECUTE FUNCTION fn_auditar_medicamento();

-- 4. VISTA DE ALERTAS: calcula el estado de cada medicamento
CREATE OR REPLACE VIEW v_medicamento_estado AS
SELECT
    id, nombre, laboratorio, stock, stock_minimo, precio,
    CASE
        WHEN stock = 0             THEN 'AGOTADO'
        WHEN stock <= stock_minimo THEN 'STOCK BAJO'
        ELSE                            'NORMAL'
    END AS estado
FROM medicamento;

-- 5. DATOS DE EJEMPLO (solo si la tabla está vacía)
INSERT INTO medicamento (nombre, laboratorio, stock, stock_minimo, precio)
SELECT * FROM (VALUES
    ('Paracetamol 500mg', 'Farmindustria', 100, 20, 2.50),
    ('Ibuprofeno 400mg',  'Bayer',          45, 20, 5.00),
    ('Amoxicilina 500mg', 'Portugal',        8, 15, 7.80),
    ('Insulina NPH',      'Novo Nordisk',    0,  5, 18.00)
) AS v(nombre, laboratorio, stock, stock_minimo, precio)
WHERE NOT EXISTS (SELECT 1 FROM medicamento);

