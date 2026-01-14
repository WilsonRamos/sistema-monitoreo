/**
 * ==================================
 * CASO DE USO - OBTENER KPIS OPERACIONES
 * ==================================
 * Orquesta el cálculo de KPIs de operaciones
 * Patrón: Use Case (Clean Architecture)
 */

import { OperacionesServiciosDominio } from '../../dominio/servicios/OperacionesServiciosDominio';
import { IOperacionRepositorio } from '../../dominio/repositorios/IOperacionRepositorio';

export class ObtenerKPIsOperaciones {
    private serviciosDominio: OperacionesServiciosDominio;

    constructor(operacionRepositorio: IOperacionRepositorio) {
        this.serviciosDominio = new OperacionesServiciosDominio(operacionRepositorio);
    }

    async ejecutar(): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            // Calcular KPIs usando servicios de dominio
            const [
                productividad,
                tiempoCicloPromedio,
                equiposEnOperacion,
                duracionTotal,
                tasaCompletitud
            ] = await Promise.all([
                this.serviciosDominio.calcularProductividad(),
                this.serviciosDominio.calcularTiempoCicloPromedio(),
                this.serviciosDominio.calcularEquiposEnOperacion(),
                this.serviciosDominio.calcularDuracionTotalOperaciones(),
                this.serviciosDominio.calcularTasaCompletitud()
            ]);

            return {
                success: true,
                data: {
                    operacionesCompletadas: productividad,
                    tiempoCicloPromedioMinutos: tiempoCicloPromedio,
                    equiposEnOperacion,
                    duracionTotalMinutos: duracionTotal,
                    tasaCompletitud: `${tasaCompletitud}%`
                }
            };
        } catch (error: any) {
            console.error('❌ Error en ObtenerKPIsOperaciones:', error);
            return {
                success: false,
                error: error.message || 'Error desconocido al obtener KPIs'
            };
        }
    }
}
