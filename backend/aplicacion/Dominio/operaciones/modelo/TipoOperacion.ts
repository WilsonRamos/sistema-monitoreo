/**
 * TipoOperacion - Value Object (Enum)
 *
 * CONCEPTO: Value Object
 * =====================
 * Un Value Object es un objeto que:
 * 1. No tiene identidad propia (se identifica por su valor)
 * 2. Es inmutable (no cambia después de crearse)
 * 3. Se puede comparar por valor (no por referencia)
 *
 * En este caso, usamos un enum-like object para:
 * - Type Safety: TypeScript valida que solo se usen valores permitidos
 * - Autocomplete: El IDE sugiere valores válidos
 * - Refactoring seguro: Si cambias un valor, TypeScript marca errores
 *
 * EJEMPLO DEL DOMINIO MINERO:
 * En la mina hay 3 tipos de operaciones principales:
 * - CARGUE: Excavadora carga mineral al volquete
 * - TRANSPORTE: Volquete lleva mineral de frente a planta
 * - DESCARGA: Volquete descarga mineral en planta procesadora
 */

export const TIPOS_OPERACION = {
    CARGUE: 'CARGUE',
    TRANSPORTE: 'TRANSPORTE',
    DESCARGA: 'DESCARGA',
} as const;

/**
 * CONCEPTO: Type Alias vs Interface
 * ===================================
 * Usamos 'type' en lugar de 'interface' porque:
 * - Es más restrictivo (solo acepta valores del enum)
 * - TypeScript infiere mejor los tipos literales
 * - No se puede extender accidentalmente
 */
export type TipoOperacion = typeof TIPOS_OPERACION[keyof typeof TIPOS_OPERACION];

/**
 * CONCEPTO: Validación de Dominio
 * ================================
 * Esta función centraliza la validación del tipo de operación.
 * Siguiendo el principio "Tell, Don't Ask", la función LANZA un error
 * si el tipo es inválido, en lugar de retornar true/false.
 *
 * Ventajas:
 * - El código cliente no necesita verificar if/else
 * - El error se propaga automáticamente
 * - Mensaje de error descriptivo para debugging
 */
export function validarTipoOperacion(tipo: string): asserts tipo is TipoOperacion {
    const tiposValidos = Object.values(TIPOS_OPERACION);
    if (!tiposValidos.includes(tipo as TipoOperacion)) {
        throw new Error(
            `Tipo de operación inválido: "${tipo}". Tipos válidos: ${tiposValidos.join(', ')}`
        );
    }
}

/**
 * CONCEPTO: Utility Function
 * ===========================
 * Función helper para obtener todos los tipos como array.
 * Útil para generar dropdowns en el frontend o validaciones.
 */
export function obtenerTiposOperacion(): TipoOperacion[] {
    return Object.values(TIPOS_OPERACION);
}
