-- ============================================================
-- 3. FUNCIÓN + TRIGGER
-- ============================================================
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