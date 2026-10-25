# Reglas de Negocio

## Estado del medicamento (calculado en v_medicamento_estado)
- stock = 0                  → AGOTADO
- stock <= stock_minimo      → STOCK BAJO
- en otro caso               → NORMAL

## Validaciones (MedicamentoService)
- nombre: obligatorio, no puede estar vacío
- laboratorio: obligatorio, no puede estar vacío
- stock: no puede ser negativo
- stock_minimo: no puede ser negativo
- precio: no puede ser negativo

## Unicidad
- La combinación (nombre, laboratorio) debe ser única (sin distinguir mayúsculas/minúsculas).