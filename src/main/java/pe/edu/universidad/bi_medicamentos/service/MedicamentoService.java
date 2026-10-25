package pe.edu.universidad.bi_medicamentos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import pe.edu.universidad.bi_medicamentos.model.Medicamento;
import pe.edu.universidad.bi_medicamentos.repository.MedicamentoRepository;

@Service
public class MedicamentoService {

    private final MedicamentoRepository repo;

    public MedicamentoService(MedicamentoRepository repo) {
        this.repo = repo;
    }

    public List<Medicamento> listar() {
        return repo.listar();
    }

    public Medicamento crear(Medicamento m) {
        validar(m);
        int id = repo.crear(m);
        return repo.buscarPorId(id).orElseThrow();
    }

    public Optional<Medicamento> actualizar(int id, Medicamento m) {
        validar(m);
        if (repo.actualizar(id, m) == 0) {
            return Optional.empty();
        }
        return repo.buscarPorId(id);
    }

    public boolean eliminar(int id) {
        return repo.eliminar(id) > 0;
    }

    private void validar(Medicamento m) {
        if (m.nombre() == null || m.nombre().isBlank())
            throw new IllegalArgumentException("El nombre es obligatorio.");
        if (m.laboratorio() == null || m.laboratorio().isBlank())
            throw new IllegalArgumentException("El laboratorio es obligatorio.");
        if (m.stock() == null || m.stock() < 0)
            throw new IllegalArgumentException("El stock no puede ser negativo.");
        if (m.stockMinimo() == null || m.stockMinimo() < 0)
            throw new IllegalArgumentException("El stock mínimo no puede ser negativo.");
        if (m.precio() == null || m.precio().signum() < 0)
            throw new IllegalArgumentException("El precio no puede ser negativo.");
    }
}