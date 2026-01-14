/**
 * Configuración del Frontend Microservice
 *
 * Este archivo centraliza la configuración de la comunicación
 * entre el microservicio frontend y el microservicio backend.
 *
 * Decisiones de arquitectura:
 * - Separación de configuración del código de negocio
 * - Permite cambiar fácilmente el endpoint del backend
 * - Facilita el despliegue en diferentes entornos (dev, prod)
 */

const CONFIG = {
    // URL base del API Backend
    // En desarrollo: http://localhost:4000
    // En producción: se puede cambiar según el entorno
    API_BASE_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:4000'  // Backend en puerto 4000
        : '/api',  // En producción, usar proxy

    // Timeout para requests (en milisegundos)
    REQUEST_TIMEOUT: 5000,

    // Headers por defecto
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

console.log('⚙️ Configuración del Frontend cargada:', CONFIG);
