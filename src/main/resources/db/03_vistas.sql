-- ============================================================
-- 4. VISTA DE ALERTAS
-- ============================================================
CREATE OR REPLACE VIEW v_medicamento_estado AS
SELECT
    id, nombre, laboratorio, stock, stock_minimo, precio,
    CASE
        WHEN stock = 0             THEN 'AGOTADO'
        WHEN stock <= stock_minimo THEN 'STOCK BAJO'
        ELSE                            'NORMAL'
    END AS estado
FROM medicamento;