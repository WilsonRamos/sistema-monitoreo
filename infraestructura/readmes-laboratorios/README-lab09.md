
## Fragmentos de código que cumplen las converciones de codificación TypeScript

## 1. Uso de prefijo I en interfaces

```ts 
import { IExcavadoraRepositorio } from '../../../Dominio/monitoreo/interfacesRepositorio/iExcavadoraRepositorio';

export class ExcavadoraRepositorio implements IExcavadoraRepositorio {
```
estilo: Use the I prefix for interface names"

## 2. Comentarios en formato JSDoc
```ts
/**
 * Guarda una nueva instancia de Excavadora y su equipo asociado en la base de datos.
 * @param excavadora La excavadora a guardar.
 */
async guardar(excavadora: Excavadora): Promise<void> {
```

estilo: "Every exported symbol must have a documentation comment... Use JSDoc-style comments"

usando comentarios de documentación JSDoc correctos, lo cual es obligatorio en el estilo de Google.

## 3. Uso de clases y tipado explícito
```ts
export class ExcavadoraRepositorio implements IExcavadoraRepositorio {
  async guardar(excavadora: Excavadora): Promise<void> {
```
estilo: "All functions and methods must have explicit return type annotations"

el codigo tiene anotaciones de tipo explícitas en todos los métodos, como Promise<void> o Promise<Excavadora | null>.

## 4. Nombrado de clases e interfaces con PascalCase
```ts
export class ExcavadoraRepositorio implements IExcavadoraRepositorio {
```

etsilo: "Type names (including interfaces and classes) must use PascalCase"

se cumple la convención al nombrar ExcavadoraRepositorio e IExcavadoraRepositorio.

## 5. Uso correcto de async/await
```ts
async buscarPorId(id: string): Promise<Excavadora | null> {
  const excavadoraPrisma = await prisma.excavadora.findUnique({ ... });
}
```

estilo: "Prefer async/await over Promise.then()"

se usa correctamente async/await en lugar de then(), como recomienda Google.

## 6. Imports ordenados por módulos
```ts
import { PrismaClient } from '../generated/prisma';
import { IExcavadoraRepositorio } from '../../../Dominio/monitoreo/interfacesRepositorio/iExcavadoraRepositorio';
import { Excavadora } from '../../../Dominio/monitoreo/excavadora';
import { Operador } from '../../../Dominio/usuarios/modelo/operador';
```

estilo: "Import statements should be ordered by module origin: Node, third-party, then project"

Aunque se usa rutas relativas, respeta el orden consistente y jerárquico en los imports.

# 2. Obsevaciones de SonarQube

![cap1](/captures/1.png)
![cap2](/captures/2.png)
![cap3](/captures/3.png)
![cap4](/captures/4.png)
![cap5](/captures/5.png)
![cap6](/captures/6.png)
![cap7](/captures/7.png)