// ========================================
// DASHBOARD - LÓGICA DE NEGOCIO
// ========================================

// Verificar autenticación al cargar
window.addEventListener('DOMContentLoaded', () => {
    AuthService.requireAuth();
    
    const user = AuthService.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = user.rol;
    }
    
    // Configurar navegación del sidebar
    configurarNavegacion();
    
    // Cargar datos iniciales
    cargarEquipos();
    cargarOperaciones();
    cargarKPIs();
    cargarAlertas();
});

// ========================================
// NAVEGACIÓN
// ========================================
function configurarNavegacion() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover clase active de todos
            navItems.forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Activar el seleccionado
            item.classList.add('active');
            const sectionName = item.dataset.section;
            document.getElementById(`section-${sectionName}`).classList.add('active');
        });
    });
}

// ========================================
// CERRAR SESIÓN
// ========================================
function handleLogout() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        AuthService.logout();
    }
}

// ========================================
// GESTIÓN DE EQUIPOS
// ========================================
const equipoForm = document.getElementById('equipoForm');
if (equipoForm) {
    equipoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const codigo = document.getElementById('codigo').value.trim();
        const tipo = document.getElementById('tipo').value;
        
        if (!codigo || !tipo) {
            mostrarMensaje('mensaje', 'Complete todos los campos', 'error');
            return;
        }
        
        try {
            const token = AuthService.getToken();
            const response = await fetch(`${API_CONFIG.GATEWAY_URL}/api/equipos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ codigo, tipo })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                mostrarMensaje('mensaje', 'Equipo creado exitosamente', 'success');
                equipoForm.reset();
                cargarEquipos();
            } else {
                mostrarMensaje('mensaje', data.message || 'Error al crear equipo', 'error');
            }
        } catch (error) {
            console.error('[EQUIPOS] Error:', error);
            mostrarMensaje('mensaje', 'Error de conexión', 'error');
        }
    });
}

async function cargarEquipos() {
    const lista = document.getElementById('equiposList');
    if (!lista) return;
    
    lista.innerHTML = '<p class="loading-text">Cargando equipos...</p>';
    
    try {
        const token = AuthService.getToken();
        const response = await fetch(`${API_CONFIG.GATEWAY_URL}/api/equipos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.data) {
            if (data.data.length === 0) {
                lista.innerHTML = '<p class="loading-text">No hay equipos registrados</p>';
                return;
            }
            
            lista.innerHTML = data.data.map(equipo => `
                <div class="list-item">
                    <div class="item-header">
                        <span class="item-title">${equipo.codigo}</span>
                        <span class="item-badge badge-success">${equipo.tipo}</span>
                    </div>
                    <div class="item-details">
                        Estado: ${equipo.estado || 'OPERATIVO'} | 
                        ID: ${equipo.id.substring(0, 8)}
                    </div>
                </div>
            `).join('');
        } else {
            lista.innerHTML = '<p class="loading-text">Error al cargar equipos</p>';
        }
    } catch (error) {
        console.error('[EQUIPOS] Error:', error);
        lista.innerHTML = '<p class="loading-text">Error de conexión</p>';
    }
}

// ========================================
// GESTIÓN DE OPERACIONES
// ========================================
const operacionForm = document.getElementById('operacionForm');
if (operacionForm) {
    operacionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const tipo = document.getElementById('tipoOperacion').value;
        const supervisorId = document.getElementById('supervisorId').value.trim();
        const frenteId = document.getElementById('frenteId').value.trim();
        
        if (!tipo || !supervisorId || !frenteId) {
            mostrarMensaje('mensajeOperacion', 'Complete todos los campos', 'error');
            return;
        }
        
        try {
            const token = AuthService.getToken();
            const response = await fetch(`${API_CONFIG.GATEWAY_URL}/api/operaciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tipo, supervisorId, frenteId })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                mostrarMensaje('mensajeOperacion', 'Operación iniciada exitosamente', 'success');
                operacionForm.reset();
                cargarOperaciones();
                cargarKPIs();
            } else {
                mostrarMensaje('mensajeOperacion', data.message || 'Error al iniciar operación', 'error');
            }
        } catch (error) {
            console.error('[OPERACIONES] Error:', error);
            mostrarMensaje('mensajeOperacion', 'Error de conexión', 'error');
        }
    });
}

async function cargarOperaciones() {
    const lista = document.getElementById('operacionesList');
    if (!lista) return;
    
    lista.innerHTML = '<p class="loading-text">Cargando operaciones...</p>';
    
    try {
        const token = AuthService.getToken();
        const response = await fetch(`${API_CONFIG.GATEWAY_URL}/api/operaciones`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.data) {
            if (data.data.length === 0) {
                lista.innerHTML = '<p class="loading-text">No hay operaciones registradas</p>';
                return;
            }
            
            lista.innerHTML = data.data.map(op => {
                const isActive = op.fechaFin === null;
                return `
                    <div class="list-item ${isActive ? 'active' : 'inactive'}">
                        <div class="item-header">
                            <span class="item-title">${op.tipo}</span>
                            <span class="item-badge ${isActive ? 'badge-success' : 'badge-warning'}">
                                ${isActive ? 'ACTIVA' : 'FINALIZADA'}
                            </span>
                        </div>
                        <div class="item-details">
                            Supervisor: ${op.supervisorId.substring(0, 8)} | 
                            Frente: ${op.frenteId.substring(0, 8)} |
                            Equipos: ${op.equiposAsignados?.length || 0}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            lista.innerHTML = '<p class="loading-text">Error al cargar operaciones</p>';
        }
    } catch (error) {
        console.error('[OPERACIONES] Error:', error);
        lista.innerHTML = '<p class="loading-text">Error de conexión</p>';
    }
}

// ========================================
// KPIs
// ========================================
async function cargarKPIs() {
    try {
        const token = AuthService.getToken();
        const response = await fetch(`${API_CONFIG.GATEWAY_URL}/api/kpis`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.data) {
            const kpis = data.data;
            
            document.getElementById('totalOperaciones').textContent = kpis.totalOperaciones || 0;
            document.getElementById('operacionesActivas').textContent = kpis.operacionesActivas || 0;
            document.getElementById('duracionPromedio').textContent = 
                `${kpis.duracionPromedioMinutos || 0} min`;
            
            const detailContainer = document.getElementById('kpisDetail');
            if (detailContainer) {
                detailContainer.innerHTML = `
                    <p><strong>Total de Operaciones:</strong> ${kpis.totalOperaciones || 0}</p>
                    <p><strong>Operaciones Activas:</strong> ${kpis.operacionesActivas || 0}</p>
                    <p><strong>Operaciones Finalizadas:</strong> ${kpis.operacionesFinalizadas || 0}</p>
                    <p><strong>Duración Promedio:</strong> ${kpis.duracionPromedioMinutos || 0} minutos</p>
                    <p><strong>Total de Equipos Asignados:</strong> ${kpis.totalEquiposAsignados || 0}</p>
                `;
            }
        }
    } catch (error) {
        console.error('[KPIs] Error:', error);
    }
}

// ========================================
// ALERTAS
// ========================================
async function cargarAlertas() {
    const lista = document.getElementById('alertasList');
    if (!lista) return;
    
    lista.innerHTML = '<p class="loading-text">Cargando alertas...</p>';
    
    try {
        const token = AuthService.getToken();
        const response = await fetch(`${API_CONFIG.GATEWAY_URL}/api/monitoreo/alertas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.data) {
            if (data.data.length === 0) {
                lista.innerHTML = '<p class="loading-text">No hay alertas activas</p>';
                return;
            }
            
            lista.innerHTML = data.data.map(alerta => `
                <div class="list-item">
                    <div class="item-header">
                        <span class="item-title">${alerta.equipoCodigo}</span>
                        <span class="item-badge badge-danger">ALERTA</span>
                    </div>
                    <div class="item-details">
                        ${alerta.mensaje} | 
                        Tipo: ${alerta.tipo}
                    </div>
                </div>
            `).join('');
        } else {
            lista.innerHTML = '<p class="loading-text">No hay alertas registradas</p>';
        }
    } catch (error) {
        console.error('[ALERTAS] Error:', error);
        lista.innerHTML = '<p class="loading-text">Error de conexión</p>';
    }
}

// ========================================
// UTILIDADES
// ========================================
function mostrarMensaje(elementId, texto, tipo) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = texto;
    element.className = `message ${tipo} show`;
    
    setTimeout(() => {
        element.classList.remove('show');
    }, 5000);
}
