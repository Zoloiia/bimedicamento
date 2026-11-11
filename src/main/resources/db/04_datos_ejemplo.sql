-- ============================================================
-- 5. DATOS DE EJEMPLO (solo si la tabla está vacía)
-- ============================================================
INSERT INTO medicamento (nombre, laboratorio, stock, stock_minimo, precio)
SELECT * FROM (VALUES
    ('Paracetamol 500mg', 'Farmindustria', 100, 20, 2.50),
    ('Ibuprofeno 400mg',  'Bayer',          45, 20, 5.00),
    ('Amoxicilina 500mg', 'Portugal',        8, 15, 7.80),
    ('Insulina NPH',      'Novo Nordisk',    0,  5, 18.00)
) AS v(nombre, laboratorio, stock, stock_minimo, precio)
WHERE NOT EXISTS (SELECT 1 FROM medicamento);