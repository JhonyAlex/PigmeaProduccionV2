// Inicialización y variables globales
let maquinas = [];
let registros = [];
let configApp = {
    titulo: 'Registro de Producción',
    descripcion: 'Ingrese la información de producción para la máquina seleccionada.'
};
let maquinaEditando = null;
let campoEditando = null;
let accionConfirmacion = null;
let chartProduccion = null;

// Modales de Bootstrap
const modalMaquina = new bootstrap.Modal(document.getElementById('modalMaquina'));
const modalCampo = new bootstrap.Modal(document.getElementById('modalCampo'));
const modalVerRegistro = new bootstrap.Modal(document.getElementById('modalVerRegistro'));
const modalConfirmacion = new bootstrap.Modal(document.getElementById('modalConfirmacion'));

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos desde localStorage
    cargarDatos();
    
    // Actualizar fecha y hora
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 1000);
    
    // Inicializar eventos
    inicializarEventos();
    
    // Actualizar UI
    actualizarInterfaz();
});

// Funciones de carga de datos
function cargarDatos() {
    try {
        // Cargar maquinas
        const maquinasGuardadas = localStorage.getItem('maquinas');
        if (maquinasGuardadas) {
            maquinas = JSON.parse(maquinasGuardadas);
        }
        
        // Cargar registros
        const registrosGuardados = localStorage.getItem('registros');
        if (registrosGuardados) {
            registros = JSON.parse(registrosGuardados);
        }
        
        // Cargar configuración
        const configGuardada = localStorage.getItem('configApp');
        if (configGuardada) {
            configApp = JSON.parse(configGuardada);
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
        mostrarAlerta('Error al cargar datos. Se utilizarán los valores por defecto.', 'danger');
    }
}

// Guardado de datos
function guardarDatos() {
    try {
        localStorage.setItem('maquinas', JSON.stringify(maquinas));
        localStorage.setItem('registros', JSON.stringify(registros));
        localStorage.setItem('configApp', JSON.stringify(configApp));
    } catch (error) {
        console.error('Error al guardar datos:', error);
        mostrarAlerta('Error al guardar datos en localStorage.', 'danger');
    }
}

// Actualizar fecha y hora
function actualizarFechaHora() {
    const ahora = new Date();
    const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('datetime-display').textContent = ahora.toLocaleDateString('es-ES', opciones);
}

// Inicialización de eventos
function inicializarEventos() {
    // Navegación
    document.getElementById('nav-registro').addEventListener('click', (e) => {
        e.preventDefault();
        cambiarSeccion('registro');
    });
    
    document.getElementById('nav-admin').addEventListener('click', (e) => {
        e.preventDefault();
        cambiarSeccion('admin');
    });
    
    document.getElementById('nav-reportes').addEventListener('click', (e) => {
        e.preventDefault();
        cambiarSeccion('reportes');
    });
    
    // Formulario de registro
    document.getElementById('form-registro').addEventListener('submit', guardarRegistro);
    document.getElementById('seleccionMaquina').addEventListener('change', cargarCamposMaquina);
    
    // Formulario de configuración general
    document.getElementById('form-config-general').addEventListener('submit', guardarConfiguracion);
    
    // Botones de administración
    document.getElementById('btn-agregar-campo').addEventListener('click', mostrarModalCampo);
    document.getElementById('btn-guardar-maquina').addEventListener('click', guardarMaquina);
    document.getElementById('btn-guardar-campo').addEventListener('click', guardarCampo);
    
    // Gestión del tipo de campo
    document.getElementById('campo-tipo').addEventListener('change', function() {
        const tipoSeleccionado = this.value;
        const opcionesContenedor = document.getElementById('opciones-contenedor');
        
        if (tipoSeleccionado === 'seleccion') {
            opcionesContenedor.classList.remove('d-none');
        } else {
            opcionesContenedor.classList.add('d-none');
        }
    });
    
    // Botones para opciones
    document.getElementById('btn-agregar-opcion').addEventListener('click', agregarOpcion);
    
    // Botones de importar/exportar
    document.getElementById('btn-exportar-registros').addEventListener('click', exportarRegistros);
    document.getElementById('btn-importar-registros').addEventListener('click', () => {
        document.getElementById('importar-registros-file').click();
    });
    document.getElementById('importar-registros-file').addEventListener('change', importarRegistros);
    
    document.getElementById('btn-exportar-todo').addEventListener('click', exportarTodo);
    document.getElementById('btn-importar-todo').addEventListener('click', () => {
        document.getElementById('importar-todo-file').click();
    });
    document.getElementById('importar-todo-file').addEventListener('change', importarTodo);
    
    // Botones de reset
    document.getElementById('btn-limpiar-registros').addEventListener('click', () => {
        confirmarAccion('limpiarRegistros', '¿Está seguro que desea eliminar todos los registros de producción?');
    });
    
    document.getElementById('btn-reset-sistema').addEventListener('click', () => {
        confirmarAccion('resetSistema', '¿Está seguro que desea restablecer todo el sistema? Esta acción eliminará todas las máquinas, campos y registros.');
    });
    
    document.getElementById('btn-confirmar').addEventListener('click', ejecutarAccionConfirmada);
    
    // Filtros de reporte
    document.getElementById('form-filtros').addEventListener('submit', (e) => {
        e.preventDefault();
        generarReporte();
    });
}

// Actualización de interfaz
function actualizarInterfaz() {
    // Actualizar título y descripción
    document.getElementById('titulo-formulario').textContent = configApp.titulo;
    document.getElementById('descripcion-formulario').textContent = configApp.descripcion;
    
    // Actualizar campos del formulario de configuración
    document.getElementById('titulo-app').value = configApp.titulo;
    document.getElementById('descripcion-app').value = configApp.descripcion;
    
    // Actualizar selectores de máquinas
    actualizarSelectoresMaquinas();
    
    // Actualizar tabla de máquinas
    actualizarTablaMaquinas();
    
    // Actualizar tabla de registros
    actualizarTablaRegistros();
    
    // Actualizar selectores de campos para reportes
    actualizarSelectoresCamposReporte();
}

// Cambio de sección
function cambiarSeccion(seccion) {
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(s => s.classList.add('d-none'));
    
    const navItems = document.querySelectorAll('.nav-link');
    navItems.forEach(item => item.classList.remove('active'));
    
    document.getElementById(`seccion-${seccion}`).classList.remove('d-none');
    document.getElementById(`nav-${seccion}`).classList.add('active');
    
    if (seccion === 'reportes') {
        // Pre-configurar filtros de fecha para el último mes
        const hoy = new Date();
        const haceMes = new Date();
        haceMes.setMonth(haceMes.getMonth() - 1);
        
        document.getElementById('filtro-desde').valueAsDate = haceMes;
        document.getElementById('filtro-hasta').valueAsDate = hoy;
    }
}

// GESTIÓN DE MAQUINAS Y CAMPOS

// Mostrar modal de nueva máquina
function mostrarModalMaquina() {
    maquinaEditando = null;
    document.getElementById('tituloModalMaquina').textContent = 'Nueva Máquina';
    document.getElementById('form-maquina').reset();
    document.getElementById('lista-campos').innerHTML = '';
    document.getElementById('sin-campos').classList.remove('d-none');
    modalMaquina.show();
}

// Mostrar modal para editar máquina
function editarMaquina(id) {
    const maquina = maquinas.find(m => m.id === id);
    if (!maquina) return;
    
    maquinaEditando = maquina;
    
    document.getElementById('tituloModalMaquina').textContent = 'Editar Máquina';
    document.getElementById('maquina-id').value = maquina.id;
    document.getElementById('maquina-nombre').value = maquina.nombre;
    document.getElementById('maquina-descripcion').value = maquina.descripcion || '';
    
    // Cargar campos
    const listaCampos = document.getElementById('lista-campos');
    listaCampos.innerHTML = '';
    
    if (maquina.campos && maquina.campos.length > 0) {
        document.getElementById('sin-campos').classList.add('d-none');
        
        maquina.campos.forEach(campo => {
            const itemCampo = document.createElement('div');
            itemCampo.className = 'list-group-item d-flex justify-content-between align-items-center';
            itemCampo.dataset.id = campo.id;
            
            const infoCampo = document.createElement('div');
            infoCampo.innerHTML = `
                <h6 class="mb-0">${campo.nombre} <span class="badge bg-${campo.obligatorio ? 'danger' : 'secondary'} ms-2">${campo.obligatorio ? 'Obligatorio' : 'Opcional'}</span></h6>
                <small class="text-muted">Tipo: ${capitalizarPrimeraLetra(campo.tipo)}</small>
            `;
            
            const botonesAccion = document.createElement('div');
            botonesAccion.innerHTML = `
                <button class="btn btn-sm btn-outline-primary me-1 btn-editar-campo" data-id="${campo.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-eliminar-campo" data-id="${campo.id}">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            
            itemCampo.appendChild(infoCampo);
            itemCampo.appendChild(botonesAccion);
            listaCampos.appendChild(itemCampo);
        });
        
        // Eventos para editar y eliminar campos
        document.querySelectorAll('.btn-editar-campo').forEach(btn => {
            btn.addEventListener('click', () => {
                const campoId = btn.dataset.id;
                const campo = maquina.campos.find(c => c.id === campoId);
                if (campo) editarCampo(campo);
            });
        });
        
        document.querySelectorAll('.btn-eliminar-campo').forEach(btn => {
            btn.addEventListener('click', () => {
                const campoId = btn.dataset.id;
                eliminarCampo(campoId);
            });
        });
    } else {
        document.getElementById('sin-campos').classList.remove('d-none');
    }
    
    modalMaquina.show();
}

// Guardar máquina
function guardarMaquina() {
    const nombre = document.getElementById('maquina-nombre').value.trim();
    if (!nombre) {
        mostrarAlerta('El nombre de la máquina es obligatorio', 'danger');
        return;
    }
    
    const descripcion = document.getElementById('maquina-descripcion').value.trim();
    
    if (maquinaEditando) {
        // Actualizar máquina existente
        maquinaEditando.nombre = nombre;
        maquinaEditando.descripcion = descripcion;
        
        // Actualizar índice en el array
        const index = maquinas.findIndex(m => m.id === maquinaEditando.id);
        if (index !== -1) {
            maquinas[index] = maquinaEditando;
        }
    } else {
        // Crear nueva máquina
        const nuevaMaquina = {
            id: generarId(),
            nombre: nombre,
            descripcion: descripcion,
            campos: []
        };
        
        maquinas.push(nuevaMaquina);
    }
    
    guardarDatos();
    actualizarInterfaz();
    modalMaquina.hide();
    mostrarAlerta('Máquina guardada correctamente', 'success');
}

// Eliminar máquina
function eliminarMaquina(id) {
    confirmarAccion('eliminarMaquina', '¿Está seguro que desea eliminar esta máquina? Esta acción también eliminará todos los registros asociados.', id);
}

function ejecutarEliminarMaquina(id) {
    // Eliminar registros de la máquina
    registros = registros.filter(r => r.maquinaId !== id);
    
    // Eliminar la máquina
    maquinas = maquinas.filter(m => m.id !== id);
    
    guardarDatos();
    actualizarInterfaz();
    mostrarAlerta('Máquina eliminada correctamente', 'success');
}

// Mostrar modal de nuevo campo
function mostrarModalCampo() {
    campoEditando = null;
    document.getElementById('tituloModalCampo').textContent = 'Nuevo Campo';
    document.getElementById('form-campo').reset();
    document.getElementById('opciones-contenedor').classList.add('d-none');
    document.getElementById('lista-opciones').innerHTML = '';
    agregarOpcion(); // Agregar una opción por defecto para selección
    modalCampo.show();
}

// Editar campo
function editarCampo(campo) {
    campoEditando = campo;
    
    document.getElementById('tituloModalCampo').textContent = 'Editar Campo';
    document.getElementById('campo-id').value = campo.id;
    document.getElementById('campo-nombre').value = campo.nombre;
    document.getElementById('campo-tipo').value = campo.tipo;
    document.getElementById('campo-obligatorio').checked = campo.obligatorio;
    
    // Mostrar opciones si es tipo selección
    const opcionesContenedor = document.getElementById('opciones-contenedor');
    const listaOpciones = document.getElementById('lista-opciones');
    listaOpciones.innerHTML = '';
    
    if (campo.tipo === 'seleccion') {
        opcionesContenedor.classList.remove('d-none');
        
        if (campo.opciones && campo.opciones.length > 0) {
            campo.opciones.forEach(opcion => {
                agregarOpcionConValor(opcion);
            });
        } else {
            agregarOpcion();
        }
    } else {
        opcionesContenedor.classList.add('d-none');
    }
    
    modalCampo.show();
}

// Guardar campo
function guardarCampo() {
    const nombre = document.getElementById('campo-nombre').value.trim();
    const tipo = document.getElementById('campo-tipo').value;
    const obligatorio = document.getElementById('campo-obligatorio').checked;
    
    if (!nombre || !tipo) {
        mostrarAlerta('Nombre y tipo de campo son obligatorios', 'danger');
        return;
    }
    
    // Obtener opciones si es tipo selección
    let opciones = [];
    if (tipo === 'seleccion') {
        const opcionesInputs = document.querySelectorAll('.opcion-valor');
        
        opcionesInputs.forEach(input => {
            const valor = input.value.trim();
            if (valor) {
                opciones.push(valor);
            }
        });
        
        if (opciones.length === 0) {
            mostrarAlerta('Debe agregar al menos una opción para el campo de selección', 'danger');
            return;
        }
    }
    
    const nuevoCampo = {
        id: campoEditando ? campoEditando.id : generarId(),
        nombre: nombre,
        tipo: tipo,
        obligatorio: obligatorio
    };
    
    if (tipo === 'seleccion') {
        nuevoCampo.opciones = opciones;
    }
    
    if (campoEditando) {
        // Actualizar campo existente
        const index = maquinaEditando.campos.findIndex(c => c.id === campoEditando.id);
        if (index !== -1) {
            maquinaEditando.campos[index] = nuevoCampo;
        }
    } else {
        // Agregar nuevo campo
        if (!maquinaEditando.campos) {
            maquinaEditando.campos = [];
        }
        maquinaEditando.campos.push(nuevoCampo);
    }
    
    // Actualizar la lista de campos en el modal de máquina
    editarMaquina(maquinaEditando.id);
    
    modalCampo.hide();
    mostrarAlerta('Campo guardado correctamente', 'success');
}

// Eliminar campo
function eliminarCampo(id) {
    if (!maquinaEditando || !maquinaEditando.campos) return;
    
    maquinaEditando.campos = maquinaEditando.campos.filter(c => c.id !== id);
    
    // Actualizar la lista de campos en el modal
    editarMaquina(maquinaEditando.id);
    
    mostrarAlerta('Campo eliminado correctamente', 'success');
}

// Agregar opción para campo tipo selección
function agregarOpcion() {
    const listaOpciones = document.getElementById('lista-opciones');
    
    const opcionContainer = document.createElement('div');
    opcionContainer.className = 'input-group mb-2';
    
    opcionContainer.innerHTML = `
        <input type="text" class="form-control opcion-valor" placeholder="Valor">
        <button class="btn btn-outline-danger btn-eliminar-opcion" type="button">
            <i class="bi bi-trash"></i>
        </button>
    `;
    
    listaOpciones.appendChild(opcionContainer);
    
    // Asignar evento para eliminar opción
    opcionContainer.querySelector('.btn-eliminar-opcion').addEventListener('click', function() {
        opcionContainer.remove();
    });
}

// Agregar opción con valor
function agregarOpcionConValor(valor) {
    const listaOpciones = document.getElementById('lista-opciones');
    
    const opcionContainer = document.createElement('div');
    opcionContainer.className = 'input-group mb-2';
    
    opcionContainer.innerHTML = `
        <input type="text" class="form-control opcion-valor" placeholder="Valor" value="${valor}">
        <button class="btn btn-outline-danger btn-eliminar-opcion" type="button">
            <i class="bi bi-trash"></i>
        </button>
    `;
    
    listaOpciones.appendChild(opcionContainer);
    
    // Asignar evento para eliminar opción
    opcionContainer.querySelector('.btn-eliminar-opcion').addEventListener('click', function() {
        opcionContainer.remove();
    });
}

// GESTIÓN DE REGISTROS

// Cargar campos de la máquina seleccionada
function cargarCamposMaquina() {
    const maquinaId = document.getElementById('seleccionMaquina').value;
    const camposDinamicos = document.getElementById('campos-dinamicos');
    camposDinamicos.innerHTML = '';
    
    if (!maquinaId) return;
    
    const maquina = maquinas.find(m => m.id === maquinaId);
    if (!maquina || !maquina.campos || maquina.campos.length === 0) {
        camposDinamicos.innerHTML = '<div class="alert alert-info">Esta máquina no tiene campos configurados.</div>';
        return;
    }
    
    maquina.campos.forEach(campo => {
        const campoContainer = document.createElement('div');
        campoContainer.className = 'mb-3';
        
        const label = document.createElement('label');
        label.className = 'form-label';
        label.setAttribute('for', `campo_${campo.id}`);
        label.textContent = campo.nombre;
        
        if (campo.obligatorio) {
            label.innerHTML += ' <span class="text-danger">*</span>';
        }
        
        campoContainer.appendChild(label);
        
        let input;
        
        switch (campo.tipo) {
            case 'texto':
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control';
                input.id = `campo_${campo.id}`;
                input.name = `campo_${campo.id}`;
                if (campo.obligatorio) input.required = true;
                break;
                
            case 'numero':
                input = document.createElement('input');
                input.type = 'number';
                input.className = 'form-control';
                input.id = `campo_${campo.id}`;
                input.name = `campo_${campo.id}`;
                if (campo.obligatorio) input.required = true;
                break;
                
            case 'seleccion':
                input = document.createElement('select');
                input.className = 'form-select';
                input.id = `campo_${campo.id}`;
                input.name = `campo_${campo.id}`;
                
                // Opción por defecto
                const opcionDefault = document.createElement('option');
                opcionDefault.value = '';
                opcionDefault.textContent = '-- Seleccione una opción --';
                opcionDefault.selected = true;
                opcionDefault.disabled = true;
                input.appendChild(opcionDefault);
                
                // Agregar opciones
                if (campo.opciones && campo.opciones.length > 0) {
                    campo.opciones.forEach(opcion => {
                        const opcionElement = document.createElement('option');
                        opcionElement.value = opcion;
                        opcionElement.textContent = opcion;
                        input.appendChild(opcionElement);
                    });
                }
                
                if (campo.obligatorio) input.required = true;
                break;
        }
        
        const invalidFeedback = document.createElement('div');
        invalidFeedback.className = 'invalid-feedback';
        invalidFeedback.textContent = `Por favor, complete el campo ${campo.nombre.toLowerCase()}.`;
        
        campoContainer.appendChild(input);
        campoContainer.appendChild(invalidFeedback);
        camposDinamicos.appendChild(campoContainer);
    });
}

// Guardar registro
function guardarRegistro(e) {
    e.preventDefault();
    
    const form = document.getElementById('form-registro');
    
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
    }
    
    const maquinaId = document.getElementById('seleccionMaquina').value;
    const maquina = maquinas.find(m => m.id === maquinaId);
    
    if (!maquina) {
        mostrarAlerta('Máquina no encontrada', 'danger');
        return;
    }
    
    // Recopilar valores de los campos
    const valores = {};
    
    maquina.campos.forEach(campo => {
        const input = document.getElementById(`campo_${campo.id}`);
        if (input) {
            valores[campo.id] = {
                nombre: campo.nombre,
                tipo: campo.tipo,
                valor: campo.tipo === 'numero' ? parseFloat(input.value) : input.value
            };
        }
    });
    
    // Crear nuevo registro
    const nuevoRegistro = {
        id: generarId(),
        maquinaId: maquinaId,
        maquinaNombre: maquina.nombre,
        fecha: new Date().toISOString(),
        valores: valores
    };
    
    // Agregar al inicio del array para que los más recientes aparezcan primero
    registros.unshift(nuevoRegistro);
    
    guardarDatos();
    actualizarTablaRegistros();
    
    // Resetear formulario
    form.classList.remove('was-validated');
    form.reset();
    document.getElementById('campos-dinamicos').innerHTML = '';
    
    mostrarAlerta('Registro guardado correctamente', 'success');
}

// Ver detalles de registro
function verRegistro(id) {
    const registro = registros.find(r => r.id === id);
    if (!registro) return;
    
    const detalles = document.getElementById('detalles-registro');
    detalles.innerHTML = '';
    
    // Crear los detalles básicos
    let html = `
        <dt class="col-sm-4">Máquina</dt>
        <dd class="col-sm-8">${registro.maquinaNombre}</dd>
        
        <dt class="col-sm-4">Fecha y Hora</dt>
        <dd class="col-sm-8">${formatearFecha(registro.fecha)}</dd>
    `;
    
    // Agregar valores de campos
    for (const key in registro.valores) {
        const campo = registro.valores[key];
        html += `
            <dt class="col-sm-4">${campo.nombre}</dt>
            <dd class="col-sm-8">${campo.valor}</dd>
        `;
    }
    
    detalles.innerHTML = html;
    modalVerRegistro.show();
}

// Eliminar registro
function eliminarRegistro(id) {
    confirmarAccion('eliminarRegistro', '¿Está seguro que desea eliminar este registro?', id);
}

function ejecutarEliminarRegistro(id) {
    registros = registros.filter(r => r.id !== id);
    guardarDatos();
    actualizarTablaRegistros();
    mostrarAlerta('Registro eliminado correctamente', 'success');
}

// REPORTES Y ESTADÍSTICAS

// Generar reporte
function generarReporte() {
    const maquinaId = document.getElementById('filtro-maquina').value;
    const desde = document.getElementById('filtro-desde').value ? new Date(document.getElementById('filtro-desde').value) : null;
    const hasta = document.getElementById('filtro-hasta').value ? new Date(document.getElementById('filtro-hasta').value + 'T23:59:59') : null;
    const agrupacion = document.getElementById('filtro-agrupacion').value;
    const campoId = document.getElementById('filtro-campo').value;
    const tipoGrafico = document.getElementById('filtro-tipo-grafico').value;
    
    // Filtrar registros
    let registrosFiltrados = [...registros];
    
    if (maquinaId !== 'todas') {
        registrosFiltrados = registrosFiltrados.filter(r => r.maquinaId === maquinaId);
    }
    
    if (desde) {
        registrosFiltrados = registrosFiltrados.filter(r => new Date(r.fecha) >= desde);
    }
    
    if (hasta) {
        registrosFiltrados = registrosFiltrados.filter(r => new Date(r.fecha) <= hasta);
    }
    
    if (registrosFiltrados.length === 0) {
        document.getElementById('sin-datos-grafico').classList.remove('d-none');
        if (chartProduccion) {
            chartProduccion.destroy();
            chartProduccion = null;
        }
        document.getElementById('estadisticas-contenedor').innerHTML = '<div class="alert alert-info">No hay datos disponibles para los filtros seleccionados.</div>';
        return;
    }
    
    document.getElementById('sin-datos-grafico').classList.add('d-none');
    
    // Agrupar datos para el gráfico
    const datosAgrupados = agruparDatos(registrosFiltrados, agrupacion, campoId);
    
    // Actualizar título del gráfico
    let tituloGrafico = 'Producción';
    
    if (maquinaId !== 'todas') {
        const maquina = maquinas.find(m => m.id === maquinaId);
        if (maquina) {
            tituloGrafico += ` - ${maquina.nombre}`;
        }
    }
    
    if (campoId) {
        // Buscar el nombre del campo
        let nombreCampo = '';
        for (const maquina of maquinas) {
            const campo = maquina.campos.find(c => c.id === campoId);
            if (campo) {
                nombreCampo = campo.nombre;
                break;
            }
        }
        
        if (nombreCampo) {
            tituloGrafico += ` - ${nombreCampo}`;
        }
    }
    
    document.getElementById('titulo-grafico').textContent = tituloGrafico;
    
    // Generar gráfico
    generarGrafico(datosAgrupados, tipoGrafico);
    
    // Generar estadísticas
    generarEstadisticas(registrosFiltrados, campoId);
}

// Agrupar datos para gráfico
function agruparDatos(registros, agrupacion, campoId) {
    const datos = {};
    
    registros.forEach(registro => {
        // Verificar si el registro tiene el campo seleccionado
        if (!campoId || (registro.valores && registro.valores[campoId])) {
            let valor = 1; // Por defecto, contar registros
            
            // Si hay un campo numérico seleccionado, usar ese valor
            if (campoId && registro.valores[campoId] && registro.valores[campoId].tipo === 'numero') {
                valor = registro.valores[campoId].valor || 0;
            }
            
            // Obtener la fecha para agrupar
            const fecha = new Date(registro.fecha);
            let clave = '';
            
            switch (agrupacion) {
                case 'dia':
                    clave = fecha.toISOString().split('T')[0];
                    break;
                    
                case 'semana':
                    // Obtener el primer día de la semana (lunes)
                    const primerDia = new Date(fecha);
                    const diaSemana = fecha.getDay() || 7; // 0 es domingo, convertir a 7
                    primerDia.setDate(fecha.getDate() - diaSemana + 1);
                    clave = primerDia.toISOString().split('T')[0];
                    break;
                    
                case 'mes':
                    clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
                    break;
            }
            
            if (!datos[clave]) {
                datos[clave] = 0;
            }
            
            datos[clave] += valor;
        }
    });
    
    // Ordenar por fecha
    const datosOrdenados = {};
    Object.keys(datos).sort().forEach(key => {
        datosOrdenados[key] = datos[key];
    });
    
    return datosOrdenados;
}

// Generar gráfico
function generarGrafico(datos, tipo) {
    const etiquetas = [];
    const valores = [];
    
    for (const [clave, valor] of Object.entries(datos)) {
        // Formatear la etiqueta según el tipo de agrupación
        let etiqueta = clave;
        if (clave.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Es una fecha en formato YYYY-MM-DD
            const fecha = new Date(clave);
            etiqueta = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        } else if (clave.match(/^\d{4}-\d{2}$/)) {
            // Es un mes en formato YYYY-MM
            const [año, mes] = clave.split('-');
            const fecha = new Date(parseInt(año), parseInt(mes) - 1, 1);
            etiqueta = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
        }
        
        etiquetas.push(etiqueta);
        valores.push(valor);
    }
    
    // Configurar el gráfico
    const ctx = document.getElementById('chart-produccion').getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (chartProduccion) {
        chartProduccion.destroy();
    }
    
    // Configurar colores
    const colores = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];
    
    // Configuración según tipo de gráfico
    let config = {
        type: tipo,
        data: {
            labels: etiquetas,
            datasets: [{
                label: 'Producción',
                data: valores,
                backgroundColor: tipo === 'line' ? colores[0] : colores,
                borderColor: tipo === 'line' ? colores[0] : colores.map(c => c.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: tipo === 'pie'
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    };
    
    // Opciones específicas según tipo de gráfico
    if (tipo === 'bar' || tipo === 'line') {
        config.options.scales = {
            y: {
                beginAtZero: true
            }
        };
    }
    
    // Crear gráfico
    chartProduccion = new Chart(ctx, config);
}

// Generar estadísticas
function generarEstadisticas(registros, campoId) {
    const estadisticasContenedor = document.getElementById('estadisticas-contenedor');
    estadisticasContenedor.innerHTML = '';
    
    // Si no hay un campo numérico seleccionado, mostrar solo cantidad de registros
    if (!campoId) {
        estadisticasContenedor.innerHTML = `
            <div class="stats-card">
                <h4>Total de Registros</h4>
                <div class="value">${registros.length}</div>
            </div>
            <div class="alert alert-info">
                Seleccione un campo numérico para ver estadísticas avanzadas.
            </div>
        `;
        return;
    }
    
    // Verificar si el campo seleccionado es numérico
    let esNumerico = false;
    let valores = [];
    
    registros.forEach(registro => {
        if (registro.valores && registro.valores[campoId] && registro.valores[campoId].tipo === 'numero') {
            esNumerico = true;
            const valor = registro.valores[campoId].valor;
            if (!isNaN(valor)) {
                valores.push(valor);
            }
        }
    });
    
    if (!esNumerico || valores.length === 0) {
        estadisticasContenedor.innerHTML = `
            <div class="stats-card">
                <h4>Total de Registros</h4>
                <div class="value">${registros.length}</div>
            </div>
            <div class="alert alert-info">
                No hay datos numéricos disponibles para el campo seleccionado.
            </div>
        `;
        return;
    }
    
    // Calcular estadísticas
    const sum = valores.reduce((a, b) => a + b, 0);
    const avg = sum / valores.length;
    const max = Math.max(...valores);
    const min = Math.min(...valores);
    
    // Añadir estadísticas
    estadisticasContenedor.innerHTML = `
        <div class="stats-card">
            <h4>Total de Registros</h4>
            <div class="value">${registros.length}</div>
        </div>
        <div class="stats-card">
            <h4>Total</h4>
            <div class="value">${sum.toFixed(2)}</div>
        </div>
        <div class="stats-card">
            <h4>Promedio</h4>
            <div class="value">${avg.toFixed(2)}</div>
        </div>
        <div class="stats-card">
            <h4>Máximo</h4>
            <div class="value">${max.toFixed(2)}</div>
        </div>
        <div class="stats-card">
            <h4>Mínimo</h4>
            <div class="value">${min.toFixed(2)}</div>
        </div>
    `;
}

// CONFIGURACIÓN

// Guardar configuración general
function guardarConfiguracion(e) {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo-app').value.trim();
    const descripcion = document.getElementById('descripcion-app').value.trim();
    
    if (!titulo) {
        mostrarAlerta('El título es obligatorio', 'danger');
        return;
    }
    
    configApp.titulo = titulo;
    configApp.descripcion = descripcion;
    
    guardarDatos();
    actualizarInterfaz();
    
    mostrarAlerta('Configuración guardada correctamente', 'success');
}

// UTILIDADES

// Actualizar selectores de máquinas
function actualizarSelectoresMaquinas() {
    // Selector para el formulario de registro
    const selectorMaquinas = document.getElementById('seleccionMaquina');
    selectorMaquinas.innerHTML = '<option value="" selected disabled>-- Seleccione una máquina --</option>';
    
    // Selector para filtros de reportes
    const filtroMaquina = document.getElementById('filtro-maquina');
    filtroMaquina.innerHTML = '<option value="todas" selected>Todas las máquinas</option>';
    
    if (maquinas.length > 0) {
        maquinas.forEach(maquina => {
            // Agregar al selector de registro
            const optionRegistro = document.createElement('option');
            optionRegistro.value = maquina.id;
            optionRegistro.textContent = maquina.nombre;
            selectorMaquinas.appendChild(optionRegistro);
            
            // Agregar al selector de filtros
            const optionFiltro = document.createElement('option');
            optionFiltro.value = maquina.id;
            optionFiltro.textContent = maquina.nombre;
            filtroMaquina.appendChild(optionFiltro);
        });
    }
}

// Actualizar selectores de campos para reportes
function actualizarSelectoresCamposReporte() {
    const filtroCampo = document.getElementById('filtro-campo');
    filtroCampo.innerHTML = '<option value="" selected disabled>Seleccione un campo</option>';
    
    // Recopilar todos los campos numéricos de todas las máquinas
    const camposNumericos = [];
    
    maquinas.forEach(maquina => {
        if (maquina.campos && maquina.campos.length > 0) {
            maquina.campos.forEach(campo => {
                if (campo.tipo === 'numero') {
                    camposNumericos.push({
                        id: campo.id,
                        nombre: `${campo.nombre} (${maquina.nombre})`
                    });
                }
            });
        }
    });
    
    if (camposNumericos.length > 0) {
        camposNumericos.forEach(campo => {
            const option = document.createElement('option');
            option.value = campo.id;
            option.textContent = campo.nombre;
            filtroCampo.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No hay campos numéricos disponibles";
        option.disabled = true;
        filtroCampo.appendChild(option);
    }
}

// Actualizar tabla de máquinas
function actualizarTablaMaquinas() {
    const tablaMaquinas = document.getElementById('tabla-maquinas');
    const sinMaquinas = document.getElementById('sin-maquinas');
    
    if (maquinas.length === 0) {
        tablaMaquinas.innerHTML = '';
        sinMaquinas.classList.remove('d-none');
        return;
    }
    
    sinMaquinas.classList.add('d-none');
    
    let html = '';
    
    maquinas.forEach(maquina => {
        const cantidadCampos = maquina.campos ? maquina.campos.length : 0;
        
        html += `
            <tr>
                <td>${maquina.nombre}</td>
                <td>${maquina.descripcion || '-'}</td>
                <td>${cantidadCampos}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="editarMaquina('${maquina.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="eliminarMaquina('${maquina.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tablaMaquinas.innerHTML = html;
}

// Actualizar tabla de registros
function actualizarTablaRegistros() {
    const tablaRegistros = document.getElementById('tabla-registros');
    const sinRegistros = document.getElementById('sin-registros');
    
    if (registros.length === 0) {
        tablaRegistros.innerHTML = '';
        sinRegistros.classList.remove('d-none');
        return;
    }
    
    sinRegistros.classList.add('d-none');
    
    let html = '';
    
    // Mostrar solo los últimos 20 registros para no sobrecargar la tabla
    const registrosMostrar = registros.slice(0, 20);
    
    registrosMostrar.forEach(registro => {
        html += `
            <tr>
                <td>${formatearFecha(registro.fecha)}</td>
                <td>${registro.maquinaNombre}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="verRegistro('${registro.id}')">
                        <i class="bi bi-eye"></i> Ver Detalles
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarRegistro('${registro.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tablaRegistros.innerHTML = html;
}

// IMPORTACIÓN Y EXPORTACIÓN

// Exportar registros
function exportarRegistros() {
    if (registros.length === 0) {
        mostrarAlerta('No hay registros para exportar', 'warning');
        return;
    }
    
    exportarJSON(registros, 'registros_produccion');
}

// Importar registros
function importarRegistros(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    
    importarJSON(archivo, (datos) => {
        if (Array.isArray(datos)) {
            // Validar estructura básica de los registros
            const validos = datos.filter(registro => 
                registro.id && 
                registro.maquinaId && 
                registro.maquinaNombre && 
                registro.fecha &&
                registro.valores
            );
            
            if (validos.length === 0) {
                mostrarAlerta('El archivo no contiene registros válidos', 'danger');
                return;
            }
            
            registros = [...validos, ...registros];
            guardarDatos();
            actualizarTablaRegistros();
            
            mostrarAlerta(`Se importaron ${validos.length} registros correctamente`, 'success');
        } else {
            mostrarAlerta('El archivo no contiene un formato válido', 'danger');
        }
    });
    
    // Limpiar input file
    event.target.value = '';
}

// Exportar todo el sistema
function exportarTodo() {
    const datosSistema = {
        maquinas: maquinas,
        registros: registros,
        configApp: configApp,
        version: '1.0',
        fecha: new Date().toISOString()
    };
    
    exportarJSON(datosSistema, 'sistema_produccion_completo');
}

// Importar todo el sistema
function importarTodo(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    
    confirmarAccion('importarTodo', '¿Está seguro que desea importar todos los datos del sistema? Esta acción reemplazará toda la configuración actual.', archivo);
    
    // Limpiar input file
    event.target.value = '';
}

function ejecutarImportarTodo(archivo) {
    importarJSON(archivo, (datos) => {
        if (datos && datos.maquinas && datos.registros && datos.configApp) {
            maquinas = datos.maquinas;
            registros = datos.registros;
            configApp = datos.configApp;
            
            guardarDatos();
            actualizarInterfaz();
            
            mostrarAlerta('Sistema importado correctamente', 'success');
        } else {
            mostrarAlerta('El archivo no contiene un formato válido para el sistema', 'danger');
        }
    });
}

// Exportar datos a JSON
function exportarJSON(datos, nombreArchivo) {
    try {
        const contenido = JSON.stringify(datos, null, 2);
        const blob = new Blob([contenido], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `${nombreArchivo}_${formatearFechaArchivo(new Date())}.json`;
        
        document.body.appendChild(enlace);
        enlace.click();
        
        document.body.removeChild(enlace);
        URL.revokeObjectURL(url);
        
        mostrarAlerta('Datos exportados correctamente', 'success');
    } catch (error) {
        console.error('Error al exportar datos:', error);
        mostrarAlerta('Error al exportar datos', 'danger');
    }
}

// Importar datos desde JSON
function importarJSON(archivo, callback) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            callback(datos);
        } catch (error) {
            console.error('Error al importar datos:', error);
            mostrarAlerta('Error al importar datos. El archivo no es válido.', 'danger');
        }
    };
    
    reader.onerror = function() {
        mostrarAlerta('Error al leer el archivo', 'danger');
    };
    
    reader.readAsText(archivo);
}

// FUNCIONES DE UTILIDAD

// Generar ID único
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Formatear fecha para mostrar
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Formatear fecha para nombre de archivo
function formatearFechaArchivo(fecha) {
    return fecha.toISOString().split('T')[0].replace(/-/g, '');
}

// Capitalizar primera letra
function capitalizarPrimeraLetra(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Mostrar alerta
function mostrarAlerta(mensaje, tipo) {
    // Crear alerta
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show animate-fade-in`;
    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Crear contenedor si no existe
    let contenedor = document.querySelector('.alertas-container');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.className = 'alertas-container position-fixed top-0 end-0 p-3';
        contenedor.style.zIndex = '1050';
        document.body.appendChild(contenedor);
    }
    
    // Añadir alerta al contenedor
    contenedor.appendChild(alerta);
    
    // Auto-cerrar después de 4 segundos
    setTimeout(() => {
        alerta.classList.replace('animate-fade-in', 'animate-fade-out');
        setTimeout(() => {
            alerta.remove();
            
            // Eliminar el contenedor si no hay más alertas
            if (contenedor.children.length === 0) {
                contenedor.remove();
            }
        }, 300);
    }, 4000);
}

// Confirmar acción
function confirmarAccion(accion, mensaje, parametro = null) {
    accionConfirmacion = { accion, parametro };
    
    document.getElementById('mensaje-confirmacion').textContent = mensaje;
    
    // Configurar título y botón según el tipo de acción
    let titulo = 'Confirmar acción';
    let claseBoton = 'danger';
    
    switch (accion) {
        case 'eliminarMaquina':
            titulo = 'Eliminar Máquina';
            break;
        case 'eliminarRegistro':
            titulo = 'Eliminar Registro';
            break;
        case 'limpiarRegistros':
            titulo = 'Limpiar Registros';
            break;
        case 'resetSistema':
            titulo = 'Restablecer Sistema';
            break;
        case 'importarTodo':
            titulo = 'Importar Sistema';
            claseBoton = 'primary';
            break;
    }
    
    document.getElementById('titulo-confirmacion').textContent = titulo;
    document.getElementById('btn-confirmar').className = `btn btn-${claseBoton}`;
    
    modalConfirmacion.show();
}

// Ejecutar acción confirmada
function ejecutarAccionConfirmada() {
    if (!accionConfirmacion) return;
    
    modalConfirmacion.hide();
    
    switch (accionConfirmacion.accion) {
        case 'eliminarMaquina':
            ejecutarEliminarMaquina(accionConfirmacion.parametro);
            break;
        case 'eliminarRegistro':
            ejecutarEliminarRegistro(accionConfirmacion.parametro);
            break;
        case 'limpiarRegistros':
            registros = [];
            guardarDatos();
            actualizarTablaRegistros();
            mostrarAlerta('Todos los registros han sido eliminados', 'success');
            break;
        case 'resetSistema':
            maquinas = [];
            registros = [];
            configApp = {
                titulo: 'Registro de Producción',
                descripcion: 'Ingrese la información de producción para la máquina seleccionada.'
            };
            guardarDatos();
            actualizarInterfaz();
            mostrarAlerta('El sistema ha sido restablecido completamente', 'success');
            break;
        case 'importarTodo':
            ejecutarImportarTodo(accionConfirmacion.parametro);
            break;
    }
    
    accionConfirmacion = null;
}

// Evento de carga inicial
document.addEventListener('DOMContentLoaded', function() {
    // Añadir evento para nueva máquina en la tabla de administración
    document.querySelector('.card-header .btn-primary').addEventListener('click', mostrarModalMaquina);
    
    // Iniciar en la sección de registro
    cambiarSeccion('registro');
});