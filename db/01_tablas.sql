-- ============================================================
-- 1. TABLA PRINCIPAL
-- ============================================================
CREATE TABLE IF NOT EXISTS medicamento (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    laboratorio     VARCHAR(100) NOT NULL,
    stock           INT          NOT NULL DEFAULT 0
                    CHECK (stock >= 0),
    stock_minimo    INT          NOT NULL DEFAULT 10
                    CHECK (stock_minimo >= 0),
    precio          NUMERIC(10,2) NOT NULL
                    CHECK (precio >= 0),
    fecha_registro  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_medicamento_nombre_lab
    ON medicamento (LOWER(nombre), LOWER(laboratorio));

-- ============================================================
-- 2. TABLA DE AUDITORÍA (trazabilidad)
-- ============================================================
CREATE TABLE IF NOT EXISTS auditoria_medicamento (
    id_auditoria    BIGSERIAL PRIMARY KEY,
    id_medicamento  INT         NOT NULL,
    accion          VARCHAR(10) NOT NULL,
    detalle         TEXT,
    fecha_accion    TIMESTAMP   NOT NULL DEFAULT NOW(),
    usuario_bd      VARCHAR(60) NOT NULL DEFAULT CURRENT_USER
);