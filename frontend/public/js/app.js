/**
 * Aplicación Frontend del Sistema de Monitoreo Minero
 *
 * Este archivo contiene la lógica de negocio del frontend,
 * desacoplado del backend mediante comunicación API RESTful.
 *
 * Arquitectura:
 * - Comunicación asíncrona con fetch API
 * - Manejo de errores y estados de carga
 * - Actualización dinámica del DOM
 */

console.log('🚀 Sistema de Monitoreo Minero - Frontend Microservice iniciado');

/**
 * Función auxiliar para realizar peticiones al backend
 * Centraliza la lógica de comunicación con el API
 * INCLUYE AUTENTICACIÓN JWT EN TODAS LAS PETICIONES
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;

    // Combinar headers por defecto con headers personalizados
    const headers = {
        ...CONFIG.DEFAULT_HEADERS,
        ...(options.headers || {})
    };

    // Agregar token JWT si existe
    const token = AuthService.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const defaultOptions = {
        ...options,
        headers
    };

    console.log(`📡 API Request: ${options.method || 'GET'} ${url}`, token ? '🔒' : '🔓');

    try {
        const response = await fetch(url, defaultOptions);

        // Si el token es inválido o expiró, redirigir a login
        if (response.status === 401) {
            console.error('❌ Token inválido o expirado, redirigiendo a login...');
            AuthService.logout();
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('❌ Error en API Request:', error);
        throw error;
    }
}

/**
 * Evento: Enviar formulario para crear equipo
 */
document.getElementById('equipoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const codigo = document.getElementById('codigo').value;
    const tipo = document.getElementById('tipo').value;
    const mensaje = document.getElementById('mensaje');

    // Validación frontend
    if (!codigo || !tipo) {
        mensaje.innerHTML = '<p class="error">❌ Completa todos los campos</p>';
        return;
    }

    try {
        console.log('📝 Enviando equipo:', {codigo, tipo});

        const result = await apiRequest('/api/equipos', {
            method: 'POST',
            body: JSON.stringify({ codigo, tipo })
        });

        console.log('✅ Respuesta del servidor:', result);

        if (result.success) {
            mensaje.innerHTML = `<p class="success">✅ ${result.message}</p>`;
            document.getElementById('equipoForm').reset();
            cargarEquipos(); // Recargar lista
        } else {
            mensaje.innerHTML = `<p class="error">❌ ${result.message}</p>`;
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        mensaje.innerHTML = `<p class="error">❌ Error de conexión con el backend: ${error.message}</p>`;
    }
});

/**
 * Función para cargar lista de equipos desde el backend
 */
async function cargarEquipos() {
    try {
        console.log('📋 Cargando lista de equipos...');

        const result = await apiRequest('/api/equipos');

        console.log('📊 Equipos obtenidos:', result);

        const lista = document.getElementById('equiposList');

        if (result.success && result.data.length > 0) {
            lista.innerHTML = result.data.map(equipo => `
                <div class="equipo-item">
                    <strong>${equipo.codigo}</strong> - ${equipo.tipo}
                    <br>
                    <small>Estado: ${equipo.estado} | ID: ${equipo.id}</small>
                </div>
            `).join('');
        } else {
            lista.innerHTML = '<p>No hay equipos registrados aún. ¡Crea el primero!</p>';
        }
    } catch (error) {
        console.error('❌ Error cargando equipos:', error);
        document.getElementById('equiposList').innerHTML =
            `<p class="error">❌ Error cargando equipos: ${error.message}<br>Verifica que el backend esté funcionando en ${CONFIG.API_BASE_URL}</p>`;
    }
}

/**
 * Cargar equipos cuando se carga la página
 */
window.addEventListener('load', () => {
    console.log('🌐 Página cargada completamente');
    console.log('🔗 Backend configurado en:', CONFIG.API_BASE_URL);
    cargarEquipos();
});
