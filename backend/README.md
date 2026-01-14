# 🏭 Sistema de Monitoreo Minero

**Universidad Nacional de San Agustín de Arequipa**  
**Ingeniería de Software II**

---

## 📋 Propósito

El Sistema de Monitoreo Minero es una plataforma web desarrollada para **gestionar y monitorear equipos de cargue y transporte** en operaciones mineras. El sistema está diseñado aplicando **Domain Driven Design (DDD)** con **Clean Architecture**, utilizando **TypeScript**, **Express.js** como framework MVC, y preparado para integración con **Prisma ORM**.

### Objetivos del Sistema:

- **Gestionar equipos mineros** (volquetes, excavadoras, bulldozers)
- **Monitorear operaciones** de cargue y transporte en tiempo real
- **Optimizar la eficiencia operacional** mediante seguimiento centralizado
- **Aplicar principios de arquitectura limpia** y buenas prácticas de desarrollo
- **Demostrar implementación práctica** de DDD y Clean Architecture

---

## 🚀 Funcionalidades

### **Funcionalidades de Alto Nivel**

#### **Diagrama de Casos de Uso UML**

```
                    SISTEMA DE MONITOREO MINERO

    Supervisor                    Sistema                    Operador
        │                                                       │
        │─────► Registrar Equipo                                │
        │                                                       │
        │─────► Consultar Equipos ◄─────────────────────────────│
        │                                                       │
        │─────► Actualizar Estado                               │
        │                                                       │
        │─────► Monitorear Operaciones                          │
        │                                                       │
        │─────► Generar Reportes                                │

    Casos de Uso Implementados:
    • UC-001: Registrar Nuevo Equipo
    • UC-002: Consultar Lista de Equipos
    • UC-003: Filtrar Equipos por Tipo
    • UC-004: Filtrar Equipos por Estado
    • UC-005: Obtener Equipo Específico
```

#### **Funcionalidades Implementadas:**

##### **RF-001: Gestión de Equipos**

- **Actor**: Supervisor de Operaciones
- **Descripción**: CRUD completo de equipos mineros
- **Criterios de Aceptación**:
  - ✅ Crear equipo con código único y tipo válido
  - ✅ Listar todos los equipos registrados
  - ✅ Buscar equipos por tipo (VOLQUETE, EXCAVADORA, BULLDOZER)
  - ✅ Buscar equipos por estado (DISPONIBLE, OPERANDO, MANTENIMIENTO)
  - ✅ Validación de datos de entrada
  - ✅ Manejo de errores y respuestas consistentes

##### **RF-002: API REST**

- **Actor**: Sistema Externo / Frontend
- **Descripción**: Endpoints REST para integración
- **Criterios de Aceptación**:
  - ✅ POST /api/equipos - Crear nuevo equipo
  - ✅ GET /api/equipos - Listar equipos con filtros opcionales
  - ✅ GET /api/equipos/:id - Obtener equipo específico
  - ✅ Respuestas en formato JSON estandarizado
  - ✅ Códigos de estado HTTP apropiados

##### **RF-003: Interfaz Web**

- **Actor**: Usuario Final
- **Descripción**: Página web para interacción directa
- **Criterios de Aceptación**:
  - ✅ Formulario de registro de equipos
  - ✅ Lista dinámica de equipos registrados
  - ✅ Integración en tiempo real con API
  - ✅ Interfaz responsive y amigable
  - ✅ Validación de formularios

### **Configuración del Proyecto:**

#### **TypeScript Configuration (`tsconfig.json`):**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

## 🔗 API REST Endpoints

### **Especificación de la API:**

#### **Base URL:** `http://localhost:3000/api`

### **Endpoints Implementados:**

#### **1. Crear Equipo**

```http
POST /api/equipos
Content-Type: application/json

{
  "codigo": "VOL-001",
  "tipo": "VOLQUETE"
}
```

**Respuesta Exitosa (201):**

```json
{
  "success": true,
  "message": "Equipo creado exitosamente",
  "timestamp": "2025-07-06T23:30:00.000Z",
  "data": {
    "id": "equipo-1720303800000-123",
    "codigo": "VOL-001",
    "tipo": "VOLQUETE",
    "estado": "DISPONIBLE"
  }
}
```

#### **2. Listar Equipos**

```http
GET /api/equipos
```

**Query Parameters (Opcionales):**

- `tipo`: Filtrar por tipo (VOLQUETE, EXCAVADORA, BULLDOZER)
- `estado`: Filtrar por estado (DISPONIBLE, OPERANDO, MANTENIMIENTO)

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Equipos obtenidos exitosamente",
  "timestamp": "2025-07-06T23:30:00.000Z",
  "data": [
    {
      "id": "demo-001",
      "codigo": "VOL-DEMO",
      "tipo": "VOLQUETE",
      "estado": "DISPONIBLE",
      "fechaConsulta": "2025-07-06T23:30:00.000Z"
    }
  ],
  "metadata": {
    "total": 1,
    "filtros": { "tipo": null, "estado": null }
  }
}
```

#### **3. Obtener Equipo por ID**

```http
GET /api/equipos/{id}
```

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "message": "Equipo encontrado exitosamente",
  "timestamp": "2025-07-06T23:30:00.000Z",
  "data": {
    "id": "demo-001",
    "codigo": "VOL-DEMO",
    "tipo": "VOLQUETE",
    "estado": "DISPONIBLE",
    "fechaConsulta": "2025-07-06T23:30:00.000Z"
  }
}
```

#### **4. Health Check**

```http
GET /health
```

**Respuesta (200):**

```json
{
  "status": "OK",
  "message": "Sistema de Monitoreo funcionando correctamente",
  "timestamp": "2025-07-06T23:30:00.000Z",
  "arquitectura": {
    "patron": "Clean Architecture + DDD",
    "lenguaje": "TypeScript",
    "framework": "Express.js",
    "capas": ["Presentación", "Aplicación", "Dominio", "Infraestructura"]
  }
}
```

### **Códigos de Estado HTTP:**

| **Código** | **Significado**       | **Cuándo se usa**            |
| ---------- | --------------------- | ---------------------------- |
| 200        | OK                    | Consultas exitosas           |
| 201        | Created               | Creación exitosa de recursos |
| 400        | Bad Request           | Datos de entrada inválidos   |
| 404        | Not Found             | Recurso no encontrado        |
| 409        | Conflict              | Código duplicado             |
| 500        | Internal Server Error | Errores del servidor         |

---

## 🚀 Instalación y Ejecución

### **Prerrequisitos:**

- **Node.js** 18.0.0 o superior
- **npm** 8.0.0 o superior
- **Git** para clonar el repositorio

### **Pasos de Instalación:**

#### **1. Clonar el Repositorio**

```bash
git clone https://github.com/[usuario]/sistema-monitoreo-minero.git
cd sistema-monitoreo-minero
```

#### **2. Instalar Dependencias**

```bash
npm install
```

#### **3. Verificar Configuración**

```bash
# Verificar que TypeScript compila correctamente
npm run build

# Verificar estructura de archivos
ls -la
```

#### **4. Ejecutar en Modo Desarrollo**

```bash
npm run dev
```

#### **5. Verificar Funcionamiento**

- **Página web**: http://localhost:3000
- **API REST**: http://localhost:3000/api/equipos
- **Health Check**: http://localhost:3000/health

## 👥 Equipo de Desarrollo

### **Información del Equipo:**

| **Rol**                    | **Nombre**                                                | **Responsabilidades**                          |
| -------------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| **Team Lead & Full Stack** | [Wilson Ramos Pacco ]                                     | Arquitectura, Backend, Frontend, Documentación |
| **Backend Developer**      | [Rimsky Augusto Miramida Bellido]                         | Domain Layer, Use Cases, API REST              |
| **Frontend Developer**     | [Jose Alberto Rivera Torres]                              | UI/UX, Integration, Testing                    |
| **DevOps & QA**            | [MORALES TACCA, Luis Fernando y RIVAS ABRIL, Jorge Aaron] | CI/CD, Testing, Deployment                     |

## 📚 Buenas Prácticas Implementadas

### **Clean Code & SOLID:**

#### **1. Single Responsibility Principle (SRP)**

```typescript
//Cada clase tiene una responsabilidad específica
class CrearEquipo {
  // Solo se encarga de crear equipos
}

class EquipoController {
  // Solo maneja HTTP requests/responses
}
```

#### **2. Dependency Inversion Principle (DIP)**

```typescript
// Depende de abstracciones, no de implementaciones
class CrearEquipo {
  constructor(private equipoRepositorio: IEquipoRepositorio) {}
  //                                     ↑ Interface, no implementación
}
```

#### **3. Interface Segregation Principle (ISP)**

```typescript
// Interfaces específicas y cohesivas
interface IEquipoRepositorio {
  crear(equipo: Equipo): Promise<void>;
  obtenerTodos(): Promise<Equipo[]>;
  // Solo métodos relacionados con persistencia de equipos
}
```

#### **3. Repository Pattern**

```typescript
// Dominio define QUÉ necesita
interface IEquipoRepositorio {
  obtenerTodos(): Promise<Equipo[]>;
}

// Infraestructura define CÓMO se obtiene
class MemoriaEquipoRepositorio implements IEquipoRepositorio {
  async obtenerTodos(): Promise<Equipo[]> {
    return [...this.equipos]; // Implementación específica
  }
}
```

## Convenciones de Codificación Aplicadas

### Nombres

#### Convención de Clases (PascalCase)

```typescript
export class EquipoController {}
export class CrearEquipo {}
export class ObtenerEquipos {}
export class Equipo {}
```

#### Convención de Métodos y Variables (camelCase)

```typescript
// Métodos
async crear(req: Request, res: Response): Promise<void>
async obtenerTodos(): Promise<EquipoDto[]>
async ejecutar(): Promise<string>

// Variables
private readonly equipoRepositorio: IEquipoRepositorio
const nuevoEstado: string
const tiposValidos: string[]
```

#### Propiedades Privadas (underscore prefix)

```typescript
private _id: string;
private _codigo: string;
private _tipo: string;
private _estado: string;
```

#### Interfaces (I prefix)

```typescript
export interface IEquipoRepositorio {
  crear(equipo: Equipo): Promise<void>;
  obtenerTodos(): Promise<Equipo[]>;
}
```

#### Constantes y Enumeraciones (UPPER_CASE)

```typescript
const tiposValidos = [
  "VOLQUETE",
  "EXCAVADORA",
  "BULLDOZER",
  "GRUA",
  "PERFORADORA",
];
const estadosValidos = ["DISPONIBLE", "OPERANDO", "MANTENIMIENTO", "INACTIVO"];
```

### Funciones

#### Responsabilidad Única

```typescript
// Cada método tiene una responsabilidad específica
private validarDatosCreacion(codigo: any, tipo: any): string[]
private crearRespuestaExitosa(mensaje: string, data?: any): any
private manejarError(res: Response, error: any): void
```

#### Operaciones Asíncronas

```typescript
// Uso consistente de async/await
async crear(equipo: Equipo): Promise<void>
async obtenerTodos(): Promise<Equipo[]>
async ejecutar(codigo: string, tipo: string): Promise<string>
```

#### Tipado Explícito

```typescript
// Parámetros y retornos tipados
async buscarPorTipo(tipo: string): Promise<Equipo[]>
private validarTipo(tipo: string): void
obtenerInfo(): any
```

### Comentarios

#### Documentación JSDoc

```typescript
/**
 * Caso de Uso: Crear Nuevo Equipo
 *
 * Responsabilidades:
 * 1. Coordinar la creación de un equipo
 * 2. Validar datos de entrada (nivel aplicación)
 * 3. Delegar validaciones de negocio al dominio
 */
```

### **Repositorio y Enlaces:**

- **GitHub**: https://github.com/WilsonRamos/sistema-monitoreo
- **Documentación**: `/docs` en el repositorio
- **Issues**: GitHub Issues para reportar problemas
