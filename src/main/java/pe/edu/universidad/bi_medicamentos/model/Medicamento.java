
package pe.edu.universidad.bi_medicamentos.model;

import java.math.BigDecimal;

public record Medicamento(
        Integer id,            // Lo genera PostgreSQL
        String nombre,
        String laboratorio,
        Integer stock,
        Integer stockMinimo,   // Umbral para la alerta
        BigDecimal precio,     // En soles
        String estado          // NORMAL / STOCK BAJO / AGOTADO (calculado por SQL)
) { }