/**
 * ==================================
 * VALUE OBJECT - UBICACION GPS
 * ==================================
 * Representa una ubicación geográfica con coordenadas GPS
 */

export class UbicacionGPS {
    constructor(
        public readonly longitud: number,
        public readonly latitud: number,
        public readonly velocidad: number = 0,
        public readonly timestamp: Date = new Date()
    ) {
        this.validar();
    }

    private validar(): void {
        if (this.longitud < -180 || this.longitud > 180) {
            throw new Error('Longitud inválida. Debe estar entre -180 y 180');
        }
        if (this.latitud < -90 || this.latitud > 90) {
            throw new Error('Latitud inválida. Debe estar entre -90 y 90');
        }
        if (this.velocidad < 0) {
            throw new Error('La velocidad no puede ser negativa');
        }
    }

    /**
     * Calcular distancia a otra ubicación (Fórmula de Haversine)
     * @param otra Otra ubicación GPS
     * @returns Distancia en kilómetros
     */
    calcularDistancia(otra: UbicacionGPS): number {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.toRad(otra.latitud - this.latitud);
        const dLon = this.toRad(otra.longitud - this.longitud);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(this.latitud)) *
            Math.cos(this.toRad(otra.latitud)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Verificar si está dentro de una zona (circular)
     */
    estaEnZona(centro: UbicacionGPS, radioKm: number): boolean {
        const distancia = this.calcularDistancia(centro);
        return distancia <= radioKm;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Value Objects son inmutables, se comparan por valor
     */
    equals(otra: UbicacionGPS): boolean {
        return (
            this.longitud === otra.longitud &&
            this.latitud === otra.latitud &&
            this.velocidad === otra.velocidad
        );
    }
}
