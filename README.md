# Sistema de Monitoreo - TypeScript

## 📋 Requisitos previos

- Node.js **16+** instalado
- npm o yarn como gestor de paquetes

## 🔧 Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Compilar proyecto:
   ```bash
   npm run build
   ```

3. Ejecutar en desarrollo:
   ```bash
   npm run dev
   ```

## 📁 Estructura del Proyecto

- **Dominio/**: Lógica de negocio y entidades del dominio
  - **mina/**: Gestión de minas y frentes
  - **monitoreo/**: Equipos y seguimiento GPS
  - **operaciones/**: Operaciones mineras
  - **turno/**: Gestión de turnos y ciclos
  - **usuarios/**: Operadores y supervisores

- **Repositorio/**: Implementaciones de acceso a datos
- **presentacion/**: Controladores de presentación
- **servicios/**: Servicios de aplicación

## 🏗️ Arquitectura

El proyecto sigue los principios de **Domain Driven Design (DDD)**:
- Separación clara entre dominio y infraestructura
- Uso de interfaces para inversión de dependencias
- Factories para creación de objetos complejos
- Servicios de dominio para lógica especializada

## 🚀 Próximos pasos

1. Implementar la lógica de negocio en cada método
2. Configurar base de datos (TypeORM recomendado)
3. Implementar tests unitarios
4. Configurar CI/CD


## 🔧 instalación de dependencias

- `npm install typescript --save-dev`: Instala TypeScript como dependencia de desarrollo
- `npm install ts-node --save-dev`: Instala ts-node para ejecutar TypeScript directamente
- `npm install eslint --save-dev`:  Instala ESLint para la linting de código
- `npm install @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev`: Instala los plugins y el parser de TypeScript para ESLint
- `npx eslint --init`:  Inicializa la configuración de ESLint

## 🛠️ Scripts disponibles

- `npm run build`: Compila el proyecto TypeScript
- `npm run dev`: Ejecuta en modo desarrollo
- `npm run test`: Ejecuta tests
- `npm run lint`: Linter de código