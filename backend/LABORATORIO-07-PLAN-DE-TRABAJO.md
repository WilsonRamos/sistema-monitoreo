# 📋 LABORATORIO 07 - PLAN DE TRABAJO

**Proyecto**: Sistema de Monitoreo Minero
**Equipo**: [Nombre del equipo]
**Fecha inicio**: 2025-01-XX
**Duración**: 4 horas (laboratorio) + trabajo continuo

---

## 🎯 DISTRIBUCIÓN DE TAREAS

### ITERACIÓN 1: Issues Críticos (Prioridad Alta) - 2 horas

#### TAREA #1: Corregir Security Hotspot
- **Responsable**: [Nombre]
- **Issue GitHub**: #1
- **Prioridad**: 🔴 CRÍTICA
- **Esfuerzo**: 30 minutos
- **Descripción**: Reemplazar `Math.random()` por `crypto.randomUUID()`
- **Archivos**:
  - `aplicacion/casos-uso/equipos/CrearEquipo.ts:142`
- **Pasos**:
  1. Crear rama: `git checkout -b fix/security-hotspot-math-random`
  2. Escribir prueba unitaria (TDD - Red)
  3. Implementar cambio
  4. Ejecutar pruebas (TDD - Green)
  5. Commit: `fix: replace Math.random with crypto.randomUUID. Fix #1`
  6. Push y crear PR
- **Criterios de aceptación**:
  - [ ] Security Hotspot eliminado en SonarQube
  - [ ] Pruebas unitarias para formato UUID
  - [ ] Todos los tests pasan
  - [ ] No hay regresiones

---

#### TAREA #2: Completar TODOs en código de producción
- **Responsable**: [Nombre]
- **Issue GitHub**: #2
- **Prioridad**: 🔴 ALTA
- **Esfuerzo**: 1.5 horas
- **Descripción**: Implementar o eliminar comentarios TODO
- **Archivos afectados** (11 TODOs):
  - `Dominio/mina/InterfacesRepositorio/iFrenteRepositorio.ts` (1 TODO)
  - `Dominio/mina/InterfacesRepositorio/iMinaRepositorio.ts` (1 TODO)
  - `Dominio/mina/minaFabrica.ts` (4 TODOs)
  - `Dominio/operaciones/iOperacionRepositorio.ts` (4 TODOs)
  - `Dominio/operaciones/modelo/operacion.ts` (1 TODO)
- **Estrategia**:
  - **Opción A**: Implementar funcionalidad pendiente
  - **Opción B**: Eliminar TODO si no es necesario
- **Pasos**:
  1. Crear rama: `git checkout -b feature/implement-pending-todos`
  2. Analizar cada TODO individualmente
  3. Implementar o eliminar según corresponda
  4. Crear pruebas unitarias para nuevo código
  5. Commit por grupo de TODOs relacionados
  6. Push y crear PR
- **Criterios de aceptación**:
  - [ ] 0 comentarios TODO en SonarQube
  - [ ] Funcionalidad implementada con tests
  - [ ] Code Smells reducidos en ~15

---

### ITERACIÓN 2: Code Smells (Prioridad Media) - 1.5 horas

#### TAREA #3: Eliminar interfaces/clases vacías
- **Responsable**: [Nombre]
- **Issue GitHub**: #3
- **Prioridad**: 🟡 MEDIA
- **Esfuerzo**: 1 hora
- **Descripción**: Agregar métodos a interfaces vacías
- **Archivos afectados** (6 clases):
  - `Dominio/mina/InterfacesRepositorio/iFrenteRepositorio.ts`
  - `Dominio/mina/InterfacesRepositorio/iMinaRepositorio.ts`
  - `Dominio/servicios-dominio/iMinaServicio.ts`
  - `Dominio/servicios-dominio/iMonitoreoServicio.ts`
  - `Dominio/servicios-dominio/iOperacionesServicio.ts`
  - `Dominio/monitoreo/servicios/monitoreoServiciosDominio.ts`
- **Refactoring**: Extract Interface
- **Pasos**:
  1. Crear rama: `git checkout -b refactor/add-methods-to-empty-interfaces`
  2. Por cada interfaz:
     - Definir métodos del patrón Repository (CRUD + específicos)
     - Documentar con JSDoc
     - Actualizar implementaciones si existen
  3. Ejecutar pruebas
  4. Commit: `refactor: add repository methods to empty interfaces. Fix #3`
  5. Push y crear PR
- **Ejemplo** (iFrenteRepositorio):
  ```typescript
  export interface IFrenteRepositorio {
      crear(frente: Frente): Promise<void>;
      obtenerPorId(id: string): Promise<Frente | null>;
      obtenerPorMina(minaId: string): Promise<Frente[]>;
      actualizar(frente: Frente): Promise<void>;
      eliminar(id: string): Promise<void>;
      existeConCodigo(codigo: string): Promise<boolean>;
  }
  ```
- **Criterios de aceptación**:
  - [ ] Todas las interfaces tienen ≥ 1 método
  - [ ] Code Smells "Empty class" eliminados (~6)
  - [ ] Documentación JSDoc completa

---

#### TAREA #4: Eliminar constructores inútiles
- **Responsable**: [Nombre]
- **Issue GitHub**: #4
- **Prioridad**: 🟡 MEDIA
- **Esfuerzo**: 20 minutos
- **Descripción**: Remover constructores vacíos sin lógica
- **Archivos afectados** (2):
  - `Dominio/mina/minaFabrica.ts:5`
  - `Dominio/monitoreo/modelo/frente.ts:4`
- **Refactoring**: Inline Method
- **Pasos**:
  1. Crear rama: `git checkout -b refactor/remove-useless-constructors`
  2. Eliminar constructores vacíos
  3. Ejecutar pruebas
  4. Commit: `refactor: remove useless constructors. Fix #4`
  5. Push y crear PR
- **Criterios de aceptación**:
  - [ ] Constructores vacíos eliminados
  - [ ] Code Smells "Useless constructor" eliminados (~2)
  - [ ] Tests pasan

---

### ITERACIÓN 3: Mejorar Cobertura de Código (Prioridad Alta) - 3 horas

#### TAREA #5: Agregar pruebas unitarias para casos de uso sin coverage
- **Responsable**: [Nombres - trabajo en parejas]
- **Issue GitHub**: #5
- **Prioridad**: 🔴 ALTA
- **Esfuerzo**: 3 horas
- **Descripción**: Crear pruebas unitarias para aumentar coverage de 43.5% a 80%
- **Archivos objetivo** (521 líneas sin cubrir):
  - `aplicacion/casos-uso/monitoreo/ActualizarEstadoEquipo.ts` ❌ 0%
  - `aplicacion/casos-uso/monitoreo/ObtenerUbicacionTiempoReal.ts` ❌ 0%
  - `aplicacion/casos-uso/operaciones/IniciarOperacionCargue.ts` ❌ 0%
  - `aplicacion/casos-uso/operaciones/CompletarCicloTransporte.ts` ❌ 0%
  - `aplicacion/casos-uso/equipos/ObtenerEquipos.ts` ⚠️ 60%
- **Enfoque**: TDD (Test-Driven Development)
- **Pasos por archivo**:
  1. Crear rama: `git checkout -b test/add-coverage-use-cases`
  2. Por cada caso de uso:
     - **RED**: Diseñar casos de prueba (tabla de valores)
     - **RED**: Escribir tests (patrón AAA)
     - **RED**: Ejecutar tests → FALLAN
     - **GREEN**: Implementar código mínimo
     - **GREEN**: Ejecutar tests → PASAN
     - **REFACTOR**: Mejorar código
  3. Verificar cobertura: `npm run test:coverage`
  4. Commit por archivo: `test: add unit tests for ActualizarEstadoEquipo. Fix #5`
  5. Push y crear PR cuando coverage ≥ 80%
- **Plantilla de casos de prueba**:
  ```markdown
  ## ActualizarEstadoEquipo - Casos de prueba

  | ID | Escenario | Entrada | Resultado Esperado |
  |----|-----------|---------|-------------------|
  | TC01 | Caso exitoso | equipoId válido, estado válido | Estado actualizado |
  | TC02 | Equipo no encontrado | ID inexistente | Error "no encontrado" |
  | TC03 | ID vacío | "", "OPERANDO" | Error "ID obligatorio" |
  | TC04 | Estado vacío | "eq-123", "" | Error "estado obligatorio" |
  | TC05 | Transición inválida | DISPONIBLE → INACTIVO | Error de dominio |
  ```
- **Criterios de aceptación**:
  - [ ] Coverage global ≥ 80%
  - [ ] Coverage por archivo ≥ 70%
  - [ ] Todos los tests pasan
  - [ ] Patrón AAA (Arrange-Act-Assert) aplicado
  - [ ] Mocks usados correctamente

---

### ITERACIÓN 4: Aplicar Principios SOLID (Prioridad Media) - 2 horas

#### TAREA #6: Refactorizar violaciones de SRP y DIP
- **Responsable**: [Nombre]
- **Issue GitHub**: #6
- **Prioridad**: 🟡 MEDIA
- **Esfuerzo**: 2 horas
- **Descripción**: Identificar y corregir violaciones de SOLID
- **Enfoque**:
  - **SRP**: Extract Class para clases con múltiples responsabilidades
  - **DIP**: Extract Interface + Constructor Injection
- **Pasos**:
  1. Crear rama: `git checkout -b refactor/apply-solid-principles`
  2. Revisar código manualmente (SonarLint ayuda)
  3. Identificar violaciones:
     - Clases con >3 responsabilidades
     - Dependencias directas de implementaciones concretas
  4. Aplicar refactorings:
     - Extract Class
     - Extract Interface
     - Move Method
  5. Actualizar tests
  6. Commit por refactoring: `refactor: apply SRP to EquipoService. Fix #6`
  7. Push y crear PR
- **Ejemplo SRP**:
  ```typescript
  // ANTES: Una clase con 4 responsabilidades
  class EquipoService {
      crearEquipo() { }
      enviarNotificacion() { }
      generarReporte() { }
      calcularKPIs() { }
  }

  // DESPUÉS: 4 clases con 1 responsabilidad cada una
  class EquipoService { crearEquipo() { } }
  class NotificacionService { enviarNotificacion() { } }
  class ReporteService { generarReporte() { } }
  class KPIService { calcularKPIs() { } }
  ```
- **Criterios de aceptación**:
  - [ ] Cada clase tiene 1 responsabilidad clara
  - [ ] Dependencias inyectadas via constructor
  - [ ] Tests actualizados y pasando
  - [ ] Code Smells reducidos

---

## 📊 MATRIZ DE RESPONSABILIDADES (Ejemplo para equipo de 5)

| Miembro | Tarea Principal | Tarea Secundaria | Esfuerzo Total |
|---------|-----------------|------------------|----------------|
| Miembro 1 | #1 Security Hotspot | #4 Constructores inútiles | 1h |
| Miembro 2 | #2 TODOs | #3 Interfaces vacías | 2.5h |
| Miembro 3 | #5 Coverage - ActualizarEstado | #5 Coverage - ObtenerUbicacion | 2h |
| Miembro 4 | #5 Coverage - IniciarOperacion | #5 Coverage - CompletarCiclo | 2h |
| Miembro 5 | #6 SOLID - SRP | #6 SOLID - DIP | 2h |

**Total**: ~9.5 horas de trabajo distribuido

---

## 🔄 WORKFLOW DIARIO

### Día 1: Laboratorio (4 horas)
```
09:00-09:30  Setup + Análisis inicial
09:30-10:30  Iteración 1 - Issues Críticos
10:30-11:00  Code Review entre pares
11:00-12:00  Iteración 2 - Code Smells
12:00-13:00  Integración y merge a development
```

### Día 2-3: Trabajo asíncrono (coverage + SOLID)
```
Cada miembro:
  - Crea su rama personal
  - Implementa sus tareas asignadas
  - Hace commits frecuentes
  - Crea PR cuando termina
  - Revisa PRs de compañeros
```

### Día 4: Integración final
```
- Merge de todos los PRs aprobados
- Análisis final con SonarQube
- Validación de métricas
- Documentación de resultados
```

---

## 📝 PLANTILLA DE COMMITS

### Formato
```
<tipo>: <descripción corta>

<descripción detallada opcional>

Fix #<issue-number>
```

### Tipos válidos
- `fix`: Corrección de bugs o security hotspots
- `feat`: Nueva funcionalidad
- `refactor`: Refactoring sin cambiar comportamiento
- `test`: Agregar o modificar pruebas
- `docs`: Documentación
- `style`: Formato de código (no afecta lógica)

### Ejemplos
```bash
# Ejemplo 1
git commit -m "fix: replace Math.random with crypto.randomUUID

- Replaced insecure Math.random() with crypto.randomUUID()
- Added unit tests to verify UUID v4 format
- Security hotspot in SonarQube resolved

Fix #1"

# Ejemplo 2
git commit -m "refactor: add methods to IFrenteRepositorio interface

- Defined CRUD methods (crear, obtener, actualizar, eliminar)
- Added domain-specific methods (obtenerPorMina, existeConCodigo)
- Documented all methods with JSDoc

Fix #3"

# Ejemplo 3
git commit -m "test: add unit tests for ActualizarEstadoEquipo use case

- Added 15 test cases covering all scenarios
- Applied AAA pattern (Arrange-Act-Assert)
- Coverage increased from 0% to 100% for this file

Fix #5"
```

---

## ✅ CHECKLIST DE VALIDACIÓN

### Por cada tarea completada

- [ ] **Código**:
  - [ ] Cambios implementados según especificación
  - [ ] Clean Code aplicado (nombres descriptivos, métodos cortos)
  - [ ] Sin código comentado ni console.logs innecesarios

- [ ] **Pruebas**:
  - [ ] Pruebas unitarias creadas/actualizadas
  - [ ] Todos los tests pasan (`npm test`)
  - [ ] Coverage ≥ 70% en archivos modificados

- [ ] **Build**:
  - [ ] Proyecto compila sin errores (`npm run build`)
  - [ ] Sin warnings críticos

- [ ] **SonarQube**:
  - [ ] Análisis ejecutado (`npx sonar-scanner`)
  - [ ] Issues correspondientes eliminados
  - [ ] No se introdujeron nuevos code smells

- [ ] **Git**:
  - [ ] Commits con mensajes descriptivos
  - [ ] Commits asociados a issues (`Fix #N`)
  - [ ] Rama creada desde development actualizado

- [ ] **GitHub**:
  - [ ] Pull Request creado con descripción
  - [ ] Reviewers asignados
  - [ ] Labels correctos (refactoring, testing, etc.)
  - [ ] Issue actualizado en GitHub Project

---

## 📈 SEGUIMIENTO DE PROGRESO

### Actualización diaria en GitHub Project

**Mover tarjetas**:
```
TO-DO → CURRENT ITERATION (al empezar el sprint)
CURRENT ITERATION → IN PROGRESS (al empezar la tarea)
IN PROGRESS → FIX VALIDATION (al hacer PR)
FIX VALIDATION → DONE (al hacer merge)
```

### Actualización de Issues

**Estados posibles**:
- `Open` → Pendiente
- `In Progress` → En desarrollo (agregar label)
- `In Review` → En revisión (PR creado)
- `Closed` → Completado (merged)

**Labels útiles**:
- `bug` - Error funcional
- `code smell` - Problema de calidad
- `security hotspot` - Revisión de seguridad
- `enhancement` - Mejora
- `testing` - Relacionado con pruebas
- `refactoring` - Refactorización
- `lab07` - Etiqueta del laboratorio

---

## 🎓 ENTREGABLES FINALES

### 1. Repositorio GitHub
```
✅ Rama development con todos los cambios integrados
✅ Commits descriptivos y asociados a issues
✅ Pull Requests revisados y merged
```

### 2. GitHub Project
```
✅ Todas las tareas en estado DONE
✅ Evidencia de flujo de trabajo (capturas)
```

### 3. GitHub Issues
```
✅ Todos los issues cerrados
✅ Comentarios con evidencia de solución
```

### 4. Análisis SonarQube
```
✅ Reporte final con métricas mejoradas
✅ Quality Gate: PASSED
✅ Screenshot del dashboard
```

### 5. Documentación
```
✅ README actualizado con cambios
✅ Documento de lecciones aprendidas
✅ Tabla comparativa antes/después
```

---

## 📊 MÉTRICAS OBJETIVO

| Métrica | Valor Inicial | Valor Objetivo | Fórmula de Cálculo |
|---------|---------------|----------------|-------------------|
| Code Smells | 135 | < 50 | Reducción del 63% |
| Security Hotspots | 1 | 0 | 100% eliminados |
| Coverage | 43.5% | ≥ 80% | +36.5 puntos |
| Technical Debt | 3h 49min | < 2h | Reducción del 48% |
| Duplications | 0.0% | < 3% | Mantener |

---

## 🚀 TIPS PARA EL ÉXITO

### 1. Comunicación
- Daily stand-up de 10 minutos (presencial o virtual)
- Avisar cuando terminas una tarea
- Pedir ayuda si te atoras >30 minutos

### 2. Code Review
- Revisar PRs de compañeros en <24 horas
- Dar feedback constructivo
- Aprobar solo si todo está correcto

### 3. TDD Discipline
- **RED**: Escribir test que falla PRIMERO
- **GREEN**: Código mínimo para pasar
- **REFACTOR**: Mejorar sin romper tests

### 4. Git Best Practices
- Commits pequeños y frecuentes
- Pull antes de push
- No hacer force push a development

### 5. Time Management
- Usar Pomodoro (25 min trabajo / 5 min descanso)
- No optimizar prematuramente
- Terminar tareas antes de empezar nuevas

---

## 📞 SOPORTE

### Recursos de ayuda
- **Guía de Refactoring**: `LABORATORIO-07-GUIA-REFACTORING.md`
- **Documentación Jest**: https://jestjs.io/docs/getting-started
- **Refactoring Catalog**: https://refactoring.guru/refactoring
- **Compañeros de equipo**: [Canal de Slack/Discord]

### Preguntas frecuentes

**P: ¿Qué hago si un test falla después de refactorizar?**
R: Revierte el último cambio (`git checkout -- archivo.ts`), analiza qué rompió, y aplica el refactoring de forma más incremental.

**P: ¿Puedo hacer commits directos a development?**
R: No. Siempre usar Pull Requests para revisión.

**P: ¿Cuántos code smells debo corregir mínimo?**
R: El objetivo es reducir de 135 a <50. Aprox. 85 code smells.

---

*Plan de trabajo generado para Laboratorio 07 - UNSA 2025*
