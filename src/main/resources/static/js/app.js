const API = "/api/medicamentos";   // Definida en MedicamentoController.java

// Elementos del HTML
const formulario  = document.getElementById("formulario");
const panelForm   = document.querySelector(".panel-form");
const tabla       = document.getElementById("tabla-medicamentos");
const mensaje     = document.getElementById("mensaje");
const btnGuardar  = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");
const titulo      = document.getElementById("titulo-formulario");
const ayuda       = document.getElementById("ayuda-formulario");
const buscador    = document.getElementById("buscar");
const pieLista    = document.getElementById("pie-lista");
const dialogo     = document.getElementById("dialogo");
const vpChip      = document.getElementById("vp-chip");

const campo = id => document.getElementById(id);

let medicamentos = [];        // Lista que llegó de la base de datos
let filtroEstado = "TODOS";   // Filtro activo
let idEditando   = null;

const soles = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const entero = new Intl.NumberFormat("es-PE");

// Clase CSS según el estado que calcula PostgreSQL
const claseEstado = e => ({ "NORMAL": "normal", "STOCK BAJO": "bajo", "AGOTADO": "agotado" }[e] || "");

// Misma regla que la vista v_medicamento_estado, solo para la vista previa
function estadoDe(stock, minimo) {
    if (stock === 0) return "AGOTADO";
    if (stock <= minimo) return "STOCK BAJO";
    return "NORMAL";
}


// 1. CARGAR: pide la lista al backend y la dibuja
async function cargarMedicamentos() {
    try {
        const respuesta = await fetch(API);
        if (!respuesta.ok) throw new Error("Error " + respuesta.status);
        medicamentos = await respuesta.json();
        dibujarResumen();
        dibujarTabla();
    } catch (error) {
        tabla.innerHTML = `<tr class="vacio"><td colspan="6"><strong>No se pudo cargar el inventario</strong>
            Revisa que el servidor y la base de datos estén en línea. (${error.message})</td></tr>`;
    }
}


// 2. RESUMEN superior
function dibujarResumen() {
    const bajo    = medicamentos.filter(m => m.estado === "STOCK BAJO").length;
    const agotado = medicamentos.filter(m => m.estado === "AGOTADO").length;
    const unidades = medicamentos.reduce((s, m) => s + m.stock, 0);
    const valor    = medicamentos.reduce((s, m) => s + m.stock * Number(m.precio), 0);

    campo("r-total").textContent    = entero.format(medicamentos.length);
    campo("r-unidades").textContent = entero.format(unidades);
    campo("r-bajo").textContent     = bajo;
    campo("r-agotado").textContent  = agotado;
    campo("r-valor").textContent    = soles.format(valor);
    campo("r-bajo").classList.toggle("hay", bajo > 0);
    campo("r-agotado").classList.toggle("hay", agotado > 0);
}


// 3. TABLA con búsqueda y filtro
function dibujarTabla() {
    const texto = buscador.value.trim().toLowerCase();
    const visibles = medicamentos.filter(m =>
        (filtroEstado === "TODOS" || m.estado === filtroEstado) &&
        (m.nombre.toLowerCase().includes(texto) || m.laboratorio.toLowerCase().includes(texto))
    );

    tabla.innerHTML = "";

    if (visibles.length === 0) {
        const fila = document.createElement("tr");
        fila.className = "vacio";
        fila.innerHTML = medicamentos.length === 0
            ? `<td colspan="6"><strong>Aún no hay medicamentos</strong>Registra el primero con el formulario.</td>`
            : `<td colspan="6"><strong>Sin resultados</strong>Prueba con otra búsqueda o cambia el filtro.</td>`;
        tabla.appendChild(fila);
    }

    visibles.forEach((m, i) => {
        const fila = document.createElement("tr");
        fila.style.animationDelay = Math.min(i * 25, 300) + "ms";
        if (m.id === idEditando) fila.classList.add("fila-editando");

        fila.append(
            celda(texto => texto.className = "id", "#" + m.id),
            celdaMedicamento(m),
            celdaNivel(m),
            celda(td => td.className = "num precio", soles.format(Number(m.precio))),
            celdaEstado(m.estado),
            celdaAcciones(m)
        );
        tabla.appendChild(fila);
    });

    pieLista.textContent = medicamentos.length
        ? `Mostrando ${visibles.length} de ${medicamentos.length} medicamentos`
        : "";
}

// Celda simple. textContent evita que se inyecte HTML malicioso
function celda(configurar, texto) {
    const td = document.createElement("td");
    td.textContent = texto;
    configurar(td);
    return td;
}

function celdaMedicamento(m) {
    const td = document.createElement("td");
    const nombre = document.createElement("div");
    nombre.className = "med-nombre";
    nombre.textContent = m.nombre;
    const lab = document.createElement("div");
    lab.className = "med-lab";
    lab.textContent = m.laboratorio;
    td.append(nombre, lab);
    return td;
}

// Blíster de 10 alvéolos: se llenan según el stock frente a una capacidad
// de referencia (3 veces el mínimo). El alvéolo marcado es el umbral de alerta.
function celdaNivel(m) {
    const td = document.createElement("td");
    const capacidad = Math.max(m.stockMinimo * 3, 10);
    const llenos = m.stock === 0 ? 0 : Math.max(1, Math.min(10, Math.round(m.stock / capacidad * 10)));
    const marca  = Math.max(1, Math.min(10, Math.round(m.stockMinimo / capacidad * 10)));

    const nivel = document.createElement("div");
    nivel.className = "nivel";

    const blister = document.createElement("div");
    blister.className = "blister " + claseEstado(m.estado);
    blister.setAttribute("role", "img");
    blister.setAttribute("aria-label", `${m.stock} unidades, mínimo ${m.stockMinimo}`);
    for (let i = 1; i <= 10; i++) {
        const a = document.createElement("span");
        a.className = "alveolo" + (i <= llenos ? " lleno" : "") + (i === marca ? " minimo" : "");
        blister.appendChild(a);
    }

    const txt = document.createElement("div");
    txt.className = "nivel-texto";
    txt.textContent = entero.format(m.stock) + " u.";
    const min = document.createElement("small");
    min.textContent = "mín. " + m.stockMinimo;
    txt.appendChild(min);

    nivel.append(blister, txt);
    td.appendChild(nivel);
    return td;
}

function celdaEstado(estado) {
    const td = document.createElement("td");
    const chip = document.createElement("span");
    chip.className = "chip " + claseEstado(estado);
    chip.textContent = estado.charAt(0) + estado.slice(1).toLowerCase();
    td.appendChild(chip);
    return td;
}

const ICONO_EDITAR = '<svg viewBox="0 0 24 24"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M14 8l2 2"/></svg>';
const ICONO_BORRAR = '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';

function celdaAcciones(m) {
    const td = document.createElement("td");
    const caja = document.createElement("div");
    caja.className = "acciones";

    const editar = document.createElement("button");
    editar.type = "button";
    editar.className = "icono-btn";
    editar.title = "Editar";
    editar.setAttribute("aria-label", "Editar " + m.nombre);
    editar.innerHTML = ICONO_EDITAR;
    editar.addEventListener("click", () => prepararEdicion(m));

    const borrar = document.createElement("button");
    borrar.type = "button";
    borrar.className = "icono-btn borrar";
    borrar.title = "Eliminar";
    borrar.setAttribute("aria-label", "Eliminar " + m.nombre);
    borrar.innerHTML = ICONO_BORRAR;
    borrar.addEventListener("click", () => eliminarMedicamento(m));

    caja.append(editar, borrar);
    td.appendChild(caja);
    return td;
}


// 4. GUARDAR: crea (POST) o actualiza (PUT) según haya un ID
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
        mostrarMensaje("Completa todos los campos con valores válidos (sin negativos).", true);
        formulario.reportValidity();
        return;
    }

    const id = campo("id").value;
    const datos = {
        nombre:      campo("nombre").value.trim(),
        laboratorio: campo("laboratorio").value.trim(),
        stock:       parseInt(campo("stock").value, 10),
        stockMinimo: parseInt(campo("stockMinimo").value, 10),
        precio:      parseFloat(campo("precio").value)
    };

    btnGuardar.disabled = true;
    try {
        const respuesta = await fetch(id ? `${API}/${id}` : API, {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        if (!respuesta.ok) throw new Error(await respuesta.text() || "Error " + respuesta.status);

        mostrarMensaje(id ? `«${datos.nombre}» actualizado.` : `«${datos.nombre}» registrado.`, false);
        salirModoEdicion();
        cargarMedicamentos();
    } catch (error) {
        mostrarMensaje(error.message, true);
    } finally {
        btnGuardar.disabled = false;
    }
});


// 5. EDITAR: pasa los datos de la fila al formulario
function prepararEdicion(m) {
    idEditando = m.id;
    campo("id").value          = m.id;
    campo("nombre").value      = m.nombre;
    campo("laboratorio").value = m.laboratorio;
    campo("stock").value       = m.stock;
    campo("stockMinimo").value = m.stockMinimo;
    campo("precio").value      = m.precio;

    titulo.textContent     = "Editar medicamento #" + m.id;
    ayuda.textContent      = "Los cambios quedan registrados en la auditoría.";
    btnGuardar.textContent = "Guardar cambios";
    btnCancelar.hidden     = false;
    panelForm.classList.add("editando");
    mostrarMensaje("", false);
    actualizarVistaPrevia();
    dibujarTabla();
    panelForm.scrollIntoView({ behavior: "smooth", block: "start" });
    campo("nombre").focus({ preventScroll: true });
}

function salirModoEdicion() {
    idEditando = null;
    formulario.reset();
    campo("id").value = "";
    campo("stockMinimo").value = 10;
    titulo.textContent     = "Registrar medicamento";
    ayuda.textContent      = "Completa los datos y guarda. El estado se calcula solo.";
    btnGuardar.textContent = "Guardar medicamento";
    btnCancelar.hidden     = true;
    panelForm.classList.remove("editando");
    actualizarVistaPrevia();
}

btnCancelar.addEventListener("click", () => {
    salirModoEdicion();
    mostrarMensaje("", false);
    dibujarTabla();
});


// 6. ELIMINAR con diálogo de confirmación
function eliminarMedicamento(m) {
    campo("dialogo-texto").textContent =
        `Se eliminará «${m.nombre}» de ${m.laboratorio}. La acción queda registrada en la auditoría.`;
    dialogo.returnValue = "";
    dialogo.showModal();
    dialogo.addEventListener("close", async () => {
        if (dialogo.returnValue !== "si") return;
        try {
            const respuesta = await fetch(`${API}/${m.id}`, { method: "DELETE" });
            if (!respuesta.ok) throw new Error("No se pudo eliminar (error " + respuesta.status + ").");
            if (idEditando === m.id) salirModoEdicion();
            mostrarMensaje(`«${m.nombre}» eliminado.`, false);
            cargarMedicamentos();
        } catch (error) {
            mostrarMensaje(error.message, true);
        }
    }, { once: true });
}


// 7. Vista previa del estado mientras se escribe
function actualizarVistaPrevia() {
    const s = campo("stock").value, min = campo("stockMinimo").value;
    if (s === "" || min === "") {
        vpChip.className = "chip";
        vpChip.textContent = "—";
        return;
    }
    const estado = estadoDe(parseInt(s, 10), parseInt(min, 10));
    vpChip.className = "chip " + claseEstado(estado);
    vpChip.textContent = estado.charAt(0) + estado.slice(1).toLowerCase();
}
["stock", "stockMinimo"].forEach(id => campo(id).addEventListener("input", actualizarVistaPrevia));


// 8. Búsqueda y filtros
buscador.addEventListener("input", dibujarTabla);
document.querySelectorAll(".filtro").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    filtroEstado = btn.dataset.estado;
    dibujarTabla();
}));


// 9. Mensajes
let temporizador;
function mostrarMensaje(texto, esError) {
    mensaje.textContent = texto;
    mensaje.className   = texto ? (esError ? "error" : "ok") : "";
    clearTimeout(temporizador);
    if (texto && !esError) temporizador = setTimeout(() => mostrarMensaje("", false), 4000);
}


// 10. INICIO
const hoy = new Date().toLocaleDateString("es-PE",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" });
campo("fecha").textContent = hoy.charAt(0).toUpperCase() + hoy.slice(1);
actualizarVistaPrevia();
cargarMedicamentos();
