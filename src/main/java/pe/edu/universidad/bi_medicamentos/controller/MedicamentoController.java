package pe.edu.universidad.bi_medicamentos.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pe.edu.universidad.bi_medicamentos.model.Medicamento;
import pe.edu.universidad.bi_medicamentos.service.MedicamentoService;

@RestController
@RequestMapping("/api/medicamentos")
public class MedicamentoController {

    private final MedicamentoService service;

    public MedicamentoController(MedicamentoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Medicamento> listar() {
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<Medicamento> crear(@RequestBody Medicamento m) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(m));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicamento> actualizar(@PathVariable int id, @RequestBody Medicamento m) {
        return service.actualizar(id, m)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable int id) {
        return service.eliminar(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}