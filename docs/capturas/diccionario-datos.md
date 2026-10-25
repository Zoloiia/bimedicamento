# Diccionario de Datos

## Tabla: medicamento
| Columna        | Tipo          | Restricción             | Descripción                 |
|----------------|---------------|------------------------- -----------------------------|
| id             | SERIAL        | PK                      | Identificador autogenerado  |
| nombre         | VARCHAR(100)  | NOT NULL                | Nombre del medicamento      |
| laboratorio    | VARCHAR(100)  | NOT NULL                | Fabricante o marca          |
| stock          | INT           | NOT NULL, >= 0          | Unidades disponibles        |
| stock_minimo   | INT           | NOT NULL, >= 0          | Umbral de alerta            |
| precio         | NUMERIC(10,2) | NOT NULL, >= 0          | Precio en soles             |
| fecha_registro | TIMESTAMP     | NOT NULL, default NOW() | Fecha de ingreso al sistema |

## Índice único
ux_medicamento_nombre_lab — evita duplicar (nombre, laboratorio) sin importar mayúsculas.