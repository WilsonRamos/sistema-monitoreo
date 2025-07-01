"""
Conversor completo de proyecto Python a TypeScript
Mantiene estructura DDD y genera archivos de configuración
"""

import * as os from 'os';
import * as shutil from 'shutil';
import * as re from 're';
import * as json from 'json';
import { Path } from 'pathlib';

export class PythonToTypeScriptConverter {
    constructor() {
        this.source_dir = Path(source_dir)
        this.output_dir = Path(output_dir)
        this.converted_files = 0
        this.total_files = 0
        
    public setup_output_directory(): void {
        """Crear directorio de salida limpio"""
        if this.output_dir.exists():
            shutil.rmtree(this.output_dir)
        this.output_dir.mkdir(parents=true, exist_ok=true)
        print(f"📁 Directorio creado: {this.output_dir}")
    
    public convert_python_to_typescript(content, filename): void {
        """Conversión avanzada de Python a TypeScript"""
        original_content = content
        
        # Limpiar headers Python
        content = re.sub(r'        content = re.sub(r'# -\*- coding: utf-8 -\*-.*\n', '', content)
        content = re.sub(r'        
        # Imports - convertir a TypeScript
        content = re.sub(r'from\s+([.\w]+)\s+import\s+(\w+)', r"import { \2 } from '\1';", content)
        content = re.sub(r'import\s+([.\w]+)', r"import * as \1 from '\1';", content)
        
        # Clases
        content = re.sub(r'class\s+(\w+)(\([^)]*\))?:', r'export class \1\2 {', content)
        content = re.sub(r'class\s+(\w+):', r'export class \1 {', content)
        
        # Interfaces (detectar clases que empiezan con I)
        if filename.startswith('I') and filename.endswith('.py'):
            content = re.sub(r'export class\s+(I\w+)', r'export interface \1', content)
            content = re.sub(r'def\s+(\w+)\s*\([^)]*\):', r'\1(): any;', content)
            content = re.sub(r'// TODO: Implement method', '', content)
        
        # Enums
        content = re.sub(r'import { Enum } from 'enum';', '', content)
        content = re.sub(r'class\s+(\w+)\(Enum\):', r'export enum \1 {', content)
        
        # Métodos y funciones
        content = re.sub(r'def\s+__init__\s*\([^)]*\):', r'constructor() {', content)
        content = re.sub(r'def\s+(\w+)\s*\(\s*self\s*,?\s*([^)]*)\):', r'public \1(\2): void {', content)
        content = re.sub(r'def\s+(\w+)\s*\(([^)]*)\):', r'function \1(\2): void {', content)
        
        # Tipos de datos
        content = re.sub(r':\s*str', ': stringing', content)
        content = re.sub(r':\s*int', ': number', content)
        content = re.sub(r':\s*float', ': number', content)
        content = re.sub(r':\s*bool', ': booleanean', content)
        content = re.sub(r':\s*list', ': any[]', content)
        content = re.sub(r':\s*dict', ': any', content)
        
        # Variables y atributos
        content = re.sub(r'self\.(\w+)\s*=\s*null', r'public \1: any = null;', content)
        content = re.sub(r'self\.(\w+)', r'this.\1', content)
        
        # Valores literales
        content = re.sub(r'\bNone\b', 'null', content)
        content = re.sub(r'\bTrue\b', 'true', content)
        content = re.sub(r'\bFalse\b', 'false', content)
        
        # Comentarios TODO
        content = re.sub(r'// TODO: Implement method', '// TODO: Implement method', content)
        
        # Limpiar líneas vacías múltiples
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
        
        return content.strip()
    
    public get_typescript_filename(py_filename): void {
        """Convertir nombre de archivo Python a TypeScript"""
        if py_filename == '__init__.py':
            return 'index.ts'
        return py_filename.replace('.py', '.ts')
    
    public should_skip_file(file_path): void {
        """Determinar si omitir archivo"""
        skip_patterns = [
            '__pycache__',
            '.pyc',
            '.git',
            'node_modules',
            '.pytest_cache'
        ]
        return any(pattern in str(file_path) for pattern in skip_patterns)
    
    public copy_directory_structure(): void {
        """Copiar estructura de directorios"""
        for root, dirs, files in os.walk(this.source_dir):
            root_path = Path(root)
            
            if this.should_skip_file(root_path):
                continue
            
            # Crear directorio correspondiente en output
            relative_path = root_path.relative_to(this.source_dir)
            output_path = this.output_dir / relative_path
            output_path.mkdir(parents=true, exist_ok=true)
    
    public convert_files(): void {
        """Convertir todos los archivos Python"""
        print("🔄 Iniciando conversión de archivos...")
        
        for root, dirs, files in os.walk(this.source_dir):
            root_path = Path(root)
            
            if this.should_skip_file(root_path):
                continue
            
            for file in files:
                if not file.endswith('.py'):
                    continue
                
                this.total_files += 1
                source_file = root_path / file
                
                # Calcular ruta de salida
                relative_path = root_path.relative_to(this.source_dir)
                output_dir = this.output_dir / relative_path
                output_file = output_dir / this.get_typescript_filename(file)
                
                try:
                    # Leer archivo Python
                    with open(source_file, 'r', encoding='utf-8') as f:
                        py_content = f.read()
                    
                    # Convertir a TypeScript
                    ts_content = this.convert_python_to_typescript(py_content, file)
                    
                    # Escribir archivo TypeScript
                    with open(output_file, 'w', encoding='utf-8') as f:
                        f.write(ts_content)
                    
                    this.converted_files += 1
                    print(f"✅ {source_file} → {output_file}")
                    
                except Exception as e:
                    print(f"❌ Error convirtiendo {source_file}: {e}")
    
    public generate_package_json(): void {
        """Generar package.json"""
        package_json = {
            "name": "sistema-monitoreo-typescript",
            "version": "1.0.0",
            "description": "Sistema de Monitoreo convertido de Python a TypeScript",
            "main": "index.ts",
            "scripts": {
                "build": "tsc",
                "dev": "ts-node index.ts",
                "start": "node dist/index.js",
                "test": "jest",
                "lint": "eslint . --ext .ts"
            },
            "devDependencies": {
                "@types/node": "^20.0.0",
                "typescript": "^5.0.0",
                "ts-node": "^10.0.0",
                "@typescript-eslint/eslint-plugin": "^6.0.0",
                "@typescript-eslint/parser": "^6.0.0",
                "eslint": "^8.0.0",
                "jest": "^29.0.0",
                "@types/jest": "^29.0.0"
            },
            "keywords": ["typescript", "monitoring", "system", "ddd", "mining"],
            "author": "Sistema Monitoreo Team",
            "license": "MIT"
        }
        
        with open(this.output_dir / 'package.json', 'w', encoding='utf-8') as f:
            json.dump(package_json, f, indent=2, ensure_ascii=false)
        
        print("📄 package.json generado")
    
    public generate_tsconfig_json(): void {
        """Generar tsconfig.json"""
        tsconfig = {
            "compilerOptions": {
                "target": "ES2020",
                "module": "commonjs",
                "lib": ["ES2020"],
                "outDir": "./dist",
                "rootDir": "./",
                "strict": true,
                "esModuleInterop": true,
                "skipLibCheck": true,
                "forceConsistentCasingInFileNames": true,
                "declaration": true,
                "declarationMap": true,
                "sourceMap": true,
                "removeComments": false,
                "emitDecoratorMetadata": true,
                "experimentalDecorators": true,
                "resolveJsonModule": true,
                "allowSyntheticDefaultImports": true
            },
            "include": [
                "**/*.ts"
            ],
            "exclude": [
                "node_modules",
                "dist",
                "**/*.test.ts"
            ]
        }
        
        with open(this.output_dir / 'tsconfig.json', 'w', encoding='utf-8') as f:
            json.dump(tsconfig, f, indent=2)
        
        print("📄 tsconfig.json generado")
    
    public generate_readme(): void {
        """Generar README.md"""
        readme_content = """# Sistema de Monitoreo - TypeScript

Este proyecto es la versión TypeScript del Sistema de Monitoreo, convertido desde Python con arquitectura DDD (Domain Driven Design).

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

## 📝 Notas de Conversión

- Todos los archivos Python han sido convertidos a TypeScript
- Los tipos han sido inferidos donde fue posible
- Se mantiene la estructura DDD original
- Se agregaron TODOs donde se requiere implementación específica

## 🛠️ Scripts disponibles

- `npm run build`: Compila el proyecto TypeScript
- `npm run dev`: Ejecuta en modo desarrollo
- `npm run test`: Ejecuta tests
- `npm run lint`: Linter de código
"""
        
        with open(this.output_dir / 'README.md', 'w', encoding='utf-8') as f:
            f.write(readme_content)
        
        print("📖 README.md generado")
    
    public generate_gitignore(): void {
        """Generar .gitignore"""
        gitignore_content = """# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript
dist/
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage
coverage/
.nyc_output/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
"""
        
        with open(this.output_dir / '.gitignore', 'w', encoding='utf-8') as f:
            f.write(gitignore_content)
        
        print("📋 .gitignore generado")
    
    public convert_project(): void {
        """Proceso completo de conversión"""
        print("🚀 Iniciando conversión completa Python → TypeScript")
        print(f"📂 Origen: {this.source_dir}")
        print(f"📂 Destino: {this.output_dir}")
        print("-" * 50)
        
        # 1. Configurar directorio de salida
        this.setup_output_directory()
        
        # 2. Copiar estructura de directorios
        this.copy_directory_structure()
        
        # 3. Convertir archivos Python
        this.convert_files()
        
        # 4. Generar archivos de configuración
        this.generate_package_json()
        this.generate_tsconfig_json()
        this.generate_readme()
        this.generate_gitignore()
        
        # 5. Resumen
        print("-" * 50)
        print(f"🎉 ¡Conversión completada!")
        print(f"📊 Archivos convertidos: {this.converted_files}/{this.total_files}")
        print(f"📁 Proyecto TypeScript creado en: {this.output_dir}")
        print("\n📝 Próximos pasos:")
        print(f"   cd {this.output_dir}")
        print("   npm install")
        print("   npm run build")

if __name__ == "__main__":
    # Configuración
    SOURCE_DIR = "."  # Directorio actual (tu proyecto Python)
    OUTPUT_DIR = "sistema-monitoreo-typescript"  # Carpeta de salida
    
    # Ejecutar conversión
    converter = PythonToTypeScriptConverter(SOURCE_DIR, OUTPUT_DIR)
    converter.convert_project()