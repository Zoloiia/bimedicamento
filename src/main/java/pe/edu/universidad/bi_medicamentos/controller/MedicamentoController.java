
//   GET    /api/medicamentos        -> lista todos
//   POST   /api/medicamentos        -> crea uno
//   PUT    /api/medicamentos/{id}   -> edita uno
//   DELETE /api/medicamentos/{id}   -> elimina uno
package pe.edu.universidad.bi_medicamentos.controller;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pe.edu.universidad.bi_medicamentos.model.Medicamento;
import pe.edu.universidad.bi_medicamentos.repository.MedicamentoRepository;

@RestController                          // Devuelve JSON
@RequestMapping("/api/medicamentos")     // Prefijo de todas las rutas
public class MedicamentoController {

    private final MedicamentoRepository repo;

    public MedicamentoController(MedicamentoRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Medicamento> listar() {
        return repo.listar();
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Medicamento m) {
        String error = validar(m);
        if (error != null) {
            return ResponseEntity.badRequest().body(error);            // 400
        }
        int id = repo.crear(m);
        return ResponseEntity.status(HttpStatus.CREATED)                // 201
                .body(repo.buscarPorId(id).orElseThrow());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable int id, @RequestBody Medicamento m) {
        String error = validar(m);
        if (error != null) {
            return ResponseEntity.badRequest().body(error);            // 400
        }
        if (repo.actualizar(id, m) == 0) {
            return ResponseEntity.notFound().build();                   // 404
        }
        return ResponseEntity.ok(repo.buscarPorId(id).orElseThrow());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable int id) {
        if (repo.eliminar(id) == 0) {
            return ResponseEntity.notFound().build();                   // 404
        }
        return ResponseEntity.noContent().build();                      // 204
    }

    // Si PostgreSQL rechaza el dato (ej. duplicado), se responde 409
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> conflicto(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Ese medicamento ya existe para ese laboratorio o los datos no son válidos.");
    }

    // Validación básica antes de tocar la base de datos (null = correcto)
    private String validar(Medicamento m) {
        if (m.nombre() == null || m.nombre().isBlank())           return "El nombre es obligatorio.";
        if (m.laboratorio() == null || m.laboratorio().isBlank()) return "El laboratorio es obligatorio.";
        if (m.stock() == null || m.stock() < 0)                   return "El stock no puede ser negativo.";
        if (m.stockMinimo() == null || m.stockMinimo() < 0)       return "El stock mínimo no puede ser negativo.";
        if (m.precio() == null || m.precio().signum() < 0)        return "El precio no puede ser negativo.";
        return null;
    }
}