/**
 * SERVICIO DE AUTENTICACIÓN - Frontend
 *
 * Responsabilidades:
 * - Gestionar tokens JWT en localStorage
 * - Comunicarse con el backend de autenticación
 * - Proporcionar métodos para login, logout, y verificación de estado
 */

const AuthService = {
    // ═══════════════════════════════════════
    // CONSTANTES
    // ═══════════════════════════════════════
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'auth_user',

    // ═══════════════════════════════════════
    // AUTENTICACIÓN
    // ═══════════════════════════════════════

    /**
     * Realizar login con credenciales
     * @param {string} username - Nombre de usuario
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} Resultado del login
     */
    async login(username, password) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }

            if (data.success && data.token) {
                // Guardar token y datos de usuario
                this.setToken(data.token);
                this.setUser(data.usuario);

                console.log('✅ Login exitoso, token guardado');

                return data;
            } else {
                throw new Error(data.message || 'Respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
            throw error;
        }
    },

    /**
     * Registrar nuevo usuario
     * @param {Object} userData - Datos del usuario (username, email, password, rol)
     * @returns {Promise<Object>} Resultado del registro
     */
    async register(userData) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al registrar usuario');
            }

            if (data.success && data.token) {
                // Guardar token y datos de usuario
                this.setToken(data.token);
                this.setUser(data.usuario);

                console.log('✅ Registro exitoso, token guardado');

                return data;
            } else {
                throw new Error(data.message || 'Respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('❌ Error en registro:', error);
            throw error;
        }
    },

    /**
     * Cerrar sesión
     */
    logout() {
        try {
            // Intentar notificar al backend (opcional, no esperamos respuesta)
            const token = this.getToken();
            if (token) {
                fetch(`${CONFIG.API_BASE_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).catch(() => {
                    // Ignorar errores en logout del backend
                });
            }
        } finally {
            // Limpiar datos locales
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY);

            console.log('🚪 Sesión cerrada');

            // Redirigir a login
            window.location.href = '/login.html';
        }
    },

    // ═══════════════════════════════════════
    // GESTIÓN DE TOKEN
    // ═══════════════════════════════════════

    /**
     * Guardar token en localStorage
     * @param {string} token - Token JWT
     */
    setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    },

    /**
     * Obtener token de localStorage
     * @returns {string|null} Token JWT o null si no existe
     */
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    /**
     * Obtener token con formato Bearer para headers
     * @returns {string|null} "Bearer <token>" o null
     */
    getAuthHeader() {
        const token = this.getToken();
        return token ? `Bearer ${token}` : null;
    },

    // ═══════════════════════════════════════
    // GESTIÓN DE USUARIO
    // ═══════════════════════════════════════

    /**
     * Guardar datos de usuario en localStorage
     * @param {Object} usuario - Datos del usuario
     */
    setUser(usuario) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
    },

    /**
     * Obtener datos de usuario de localStorage
     * @returns {Object|null} Datos del usuario o null
     */
    getUser() {
        const userData = localStorage.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    },

    /**
     * Obtener datos actualizados del usuario desde el backend
     * @returns {Promise<Object>} Datos del usuario
     */
    async fetchCurrentUser() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': this.getAuthHeader()
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener usuario');
            }

            if (data.success && data.usuario) {
                // Actualizar datos locales
                this.setUser(data.usuario);
                return data.usuario;
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('❌ Error al obtener usuario:', error);

            // Si el token es inválido, cerrar sesión
            if (error.message.includes('Token') || error.message.includes('autenticación')) {
                this.logout();
            }

            throw error;
        }
    },

    // ═══════════════════════════════════════
    // VERIFICACIÓN DE ESTADO
    // ═══════════════════════════════════════

    /**
     * Verificar si el usuario está autenticado
     * @returns {boolean} true si hay token válido
     */
    isAuthenticated() {
        const token = this.getToken();

        if (!token) {
            return false;
        }

        // Verificar si el token está expirado
        try {
            const payload = this.decodeToken(token);
            const now = Math.floor(Date.now() / 1000);

            if (payload.exp && payload.exp < now) {
                console.log('⚠️ Token expirado');
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ Error al decodificar token:', error);
            return false;
        }
    },

    /**
     * Verificar si el usuario tiene un rol específico
     * @param {string|string[]} roles - Rol o array de roles permitidos
     * @returns {boolean} true si el usuario tiene alguno de los roles
     */
    hasRole(roles) {
        const user = this.getUser();

        if (!user || !user.rol) {
            return false;
        }

        const rolesArray = Array.isArray(roles) ? roles : [roles];
        return rolesArray.includes(user.rol);
    },

    /**
     * Redirigir a login si no está autenticado
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            console.log('⚠️ No autenticado, redirigiendo a login...');
            window.location.href = '/login.html';
        }
    },

    /**
     * Redirigir a login si no tiene el rol requerido
     * @param {string|string[]} roles - Rol o array de roles requeridos
     */
    requireRole(roles) {
        this.requireAuth();

        if (!this.hasRole(roles)) {
            const user = this.getUser();
            console.error(`❌ Acceso denegado: rol ${user.rol} no autorizado`);
            alert('No tienes permisos para acceder a esta sección');
            window.location.href = '/';
        }
    },

    // ═══════════════════════════════════════
    // UTILIDADES
    // ═══════════════════════════════════════

    /**
     * Decodificar token JWT (solo payload, sin verificación)
     * @param {string} token - Token JWT
     * @returns {Object} Payload decodificado
     */
    decodeToken(token) {
        try {
            // JWT tiene formato: header.payload.signature
            const parts = token.split('.');

            if (parts.length !== 3) {
                throw new Error('Token inválido');
            }

            // Decodificar payload (base64url)
            const payload = parts[1];
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('❌ Error al decodificar token:', error);
            throw new Error('Token inválido');
        }
    },

    /**
     * Crear headers con autenticación para fetch
     * @param {Object} additionalHeaders - Headers adicionales
     * @returns {Object} Headers con Authorization
     */
    createAuthHeaders(additionalHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...additionalHeaders
        };

        const authHeader = this.getAuthHeader();
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        return headers;
    },

    /**
     * Realizar fetch autenticado
     * @param {string} url - URL del endpoint
     * @param {Object} options - Opciones de fetch
     * @returns {Promise<Response>} Response de fetch
     */
    async authenticatedFetch(url, options = {}) {
        const headers = this.createAuthHeaders(options.headers);

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Si el token es inválido, cerrar sesión
        if (response.status === 401) {
            console.error('❌ Token inválido o expirado');
            this.logout();
            throw new Error('Sesión expirada');
        }

        return response;
    }
};

// Hacer disponible globalmente
window.AuthService = AuthService;

console.log('✅ AuthService cargado');
