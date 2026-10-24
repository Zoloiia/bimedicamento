package pe.edu.universidad.bi_medicamentos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import pe.edu.universidad.bi_medicamentos.model.Medicamento;

@Repository
public class MedicamentoRepository {

    private final JdbcTemplate jdbc;   // Herramienta para ejecutar SQL

    public MedicamentoRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Convierte cada fila SQL en un objeto Medicamento
    private final RowMapper<Medicamento> mapper = (rs, fila) -> new Medicamento(
            rs.getInt("id"),
            rs.getString("nombre"),
            rs.getString("laboratorio"),
            rs.getInt("stock"),
            rs.getInt("stock_minimo"),
            rs.getBigDecimal("precio"),
            rs.getString("estado")
    );

    // LEER: todos
    public List<Medicamento> listar() {
        String sql = "SELECT id, nombre, laboratorio, stock, stock_minimo, precio, estado "
                   + "FROM v_medicamento_estado ORDER BY id";
        return jdbc.query(sql, mapper);
    }

    // LEER: uno por ID
    public Optional<Medicamento> buscarPorId(int id) {
        String sql = "SELECT id, nombre, laboratorio, stock, stock_minimo, precio, estado "
                   + "FROM v_medicamento_estado WHERE id = ?";
        return jdbc.query(sql, mapper, id).stream().findFirst();
    }

    // CREAR: los "?" evitan inyección SQL; RETURNING id devuelve el ID generado
    public int crear(Medicamento m) {
        String sql = "INSERT INTO medicamento (nombre, laboratorio, stock, stock_minimo, precio) "
                   + "VALUES (?, ?, ?, ?, ?) RETURNING id";
        return jdbc.queryForObject(sql, Integer.class,
                m.nombre(), m.laboratorio(), m.stock(), m.stockMinimo(), m.precio());
    }

    // ACTUALIZAR: devuelve cuántas filas cambió (0 = ese ID no existe)
    public int actualizar(int id, Medicamento m) {
        String sql = "UPDATE medicamento "
                   + "SET nombre = ?, laboratorio = ?, stock = ?, stock_minimo = ?, precio = ? "
                   + "WHERE id = ?";
        return jdbc.update(sql,
                m.nombre(), m.laboratorio(), m.stock(), m.stockMinimo(), m.precio(), id);
    }

    // ELIMINAR
    public int eliminar(int id) {
        return jdbc.update("DELETE FROM medicamento WHERE id = ?", id);
    }
}