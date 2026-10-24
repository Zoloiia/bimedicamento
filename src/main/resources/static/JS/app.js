const API = "/api/medicamentos";   // Definida en MedicamentoController.java

// Elementos del HTML
const formulario  = document.getElementById("formulario");
const tabla       = document.getElementById("tabla-medicamentos");
const mensaje     = document.getElementById("mensaje");
const btnGuardar  = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");
const titulo      = document.getElementById("titulo-formulario");

let medicamentos = [];   // Lista que llegó de la base de datos


// 1. CARGAR: pide la lista al backend y la dibuja
async function cargarMedicamentos() {
    try {
        const respuesta = await fetch(API);                  // GET
        if (!respuesta.ok) throw new Error("Error " + respuesta.status);
        medicamentos = await respuesta.json();
        dibujarTabla();
    } catch (error) {
        mostrarMensaje("No se pudo conectar con el servidor: " + error.message, true);
    }
}


// 2. DIBUJAR: una fila <tr> por cada medicamento
function dibujarTabla() {
    tabla.innerHTML = "";

    if (medicamentos.length === 0) {
        tabla.innerHTML = '<tr><td colspan="8">No hay medicamentos registrados.</td></tr>';
        return;
    }

    medicamentos.forEach(m => {
        const fila = document.createElement("tr");

        // textContent evita que se inyecte HTML malicioso
        fila.appendChild(celda(m.id));
        fila.appendChild(celda(m.nombre));
        fila.appendChild(celda(m.laboratorio));
        fila.appendChild(celda(m.stock));
        fila.appendChild(celda(m.stockMinimo));
        fila.appendChild(celda("S/ " + Number(m.precio).toFixed(2)));

        // Estado con color según lo que calculó PostgreSQL
        const celdaEstado = celda(m.estado);
        celdaEstado.className = "estado " + m.estado.toLowerCase().replace(" ", "-");
        fila.appendChild(celdaEstado);

        // Botones Editar y Eliminar
        const celdaAcciones = document.createElement("td");

        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", () => prepararEdicion(m));

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener("click", () => eliminarMedicamento(m));

        celdaAcciones.append(btnEditar, " ", btnEliminar);
        fila.appendChild(celdaAcciones);

        tabla.appendChild(fila);
    });
}

// Crea una celda <td> con un texto
function celda(texto) {
    const td = document.createElement("td");
    td.textContent = texto;
    return td;
}


// 3. GUARDAR: crea (POST) o actualiza (PUT) según haya un ID
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();   // Evita recargar la página

    const id = document.getElementById("id").value;

    // Nombres que espera Medicamento.java
    const datos = {
        nombre:       document.getElementById("nombre").value.trim(),
        laboratorio:  document.getElementById("laboratorio").value.trim(),
        stock:        parseInt(document.getElementById("stock").value, 10),
        stockMinimo:  parseInt(document.getElementById("stockMinimo").value, 10),
        precio:       parseFloat(document.getElementById("precio").value)
    };

    const url    = id ? `${API}/${id}` : API;
    const metodo = id ? "PUT" : "POST";

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            throw new Error(await respuesta.text());   // Motivo del error
        }

        mostrarMensaje(id ? "Medicamento actualizado." : "Medicamento registrado.", false);
        salirModoEdicion();
        cargarMedicamentos();                          // Refresca la tabla
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
});


// 4. EDITAR: pasa los datos de la fila al formulario
function prepararEdicion(m) {
    document.getElementById("id").value           = m.id;
    document.getElementById("nombre").value       = m.nombre;
    document.getElementById("laboratorio").value  = m.laboratorio;
    document.getElementById("stock").value        = m.stock;
    document.getElementById("stockMinimo").value  = m.stockMinimo;
    document.getElementById("precio").value       = m.precio;

    titulo.textContent      = "Editar Medicamento (ID " + m.id + ")";
    btnGuardar.textContent  = "Actualizar Medicamento";
    btnCancelar.hidden      = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Vuelve al modo "registrar nuevo"
function salirModoEdicion() {
    formulario.reset();
    document.getElementById("id").value = "";
    document.getElementById("stockMinimo").value = 10;
    titulo.textContent     = "Registrar Nuevo Medicamento";
    btnGuardar.textContent = "Guardar Medicamento";
    btnCancelar.hidden     = true;
}

btnCancelar.addEventListener("click", () => {
    salirModoEdicion();
    mostrarMensaje("", false);
});


// 5. ELIMINAR: pide confirmación y llama a DELETE
async function eliminarMedicamento(m) {
    if (!confirm(`¿Eliminar "${m.nombre}"? Esta acción quedará registrada en la auditoría.`)) {
        return;
    }
    try {
        const respuesta = await fetch(`${API}/${m.id}`, { method: "DELETE" });
        if (!respuesta.ok) throw new Error("No se pudo eliminar (error " + respuesta.status + ").");
        mostrarMensaje("Medicamento eliminado.", false);
        cargarMedicamentos();
    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}


// 6. MENSAJES debajo del formulario
function mostrarMensaje(texto, esError) {
    mensaje.textContent = texto;
    mensaje.className   = esError ? "error" : "ok";
}


// 7. INICIO: al abrir la página se cargan los datos de PostgreSQL
cargarMedicamentos();