
module.exports = function(grunt) {
  
  // ========================================
  // CONFIGURACIÓN ESPECÍFICA PARA TU PROYECTO
  // ========================================
  grunt.initConfig({
    
    // Información del proyecto (lee tu package.json)
    pkg: grunt.file.readJSON('package.json'),
    
    // Banner para archivos generados
    banner: '/*! Sistema de Monitoreo Minero v<%= pkg.version %>\n' +
            ' * Universidad Nacional de San Agustín de Arequipa\n' +
            ' * Clean Architecture + DDD + TypeScript + Grunt\n' +
            ' * Construcción automática - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
    
    // ========================================
    // 1. LIMPIEZA DE ARCHIVOS
    // ========================================
    clean: {
      dist: {
        src: ['dist/**/*'],
        options: {
          force: true
        }
      },
      temp: {
        src: ['.tmp/**/*', '*.tmp']
      }
    },
    
    // ========================================  
    // 2. COPIA DE ARCHIVOS ESTÁTICOS  
    // ========================================
    copy: {
      // Copiar tu página web
      web: {
        files: [
          {
            expand: true,
            cwd: 'presentacion/web/',
            src: ['**/*.html', '**/*.css', '**/*.js', '**/*.png', '**/*.jpg', '**/*.ico'],
            dest: 'dist/presentacion/web/',
            filter: 'isFile'
          }
        ]
      },
      
      // Copiar package.json optimizado
      package: {
        src: 'package.json',
        dest: 'dist/package.json',
        options: {
          process: function(content, srcpath) {
            var pkg = JSON.parse(content);
            // Optimizar para producción
            delete pkg.devDependencies;
            delete pkg.scripts.dev;
            delete pkg.scripts['dev:simple'];
            pkg.main = 'app.js';
            return JSON.stringify(pkg, null, 2);
          }
        }
      }
    },
    
    // ========================================
    // 3. COMPILACIÓN DE TYPESCRIPT (usando tsc nativo)
    // ========================================
    shell: {
      // Compilar TypeScript usando el compilador nativo
      typescript: {
        command: 'tsc',
        options: {
          stdout: true,
          stderr: true
        }
      },
      
      // Ejecutar la aplicación compilada
      run: {
        command: 'node dist/app.js',
        options: {
          stdout: true,
          stderr: true
        }
      },
      
      // Modo desarrollo con nodemon
      dev: {
        command: 'nodemon dist/app.js',
        options: {
          stdout: true,
          stderr: true
        }
      },
      
      // Verificar instalación de TypeScript
      checkTs: {
        command: 'tsc --version',
        options: {
          stdout: true
        }
      }
    },
    
    // ========================================
    // 4. OBSERVADOR DE CAMBIOS
    // ========================================
    watch: {
      // Observar cambios en archivos TypeScript
      typescript: {
        files: [
          'app.ts',
          'aplicacion/**/*.ts', 
          'Dominio/**/*.ts',
          'infraestructura/**/*.ts',
          'presentacion/**/*.ts',
          '!presentacion/web/**'  // Excluir archivos web
        ],
        tasks: ['compile'],
        options: {
          spawn: false,
          livereload: false
        }
      },
      
      // Observar cambios en archivos web
      web: {
        files: ['presentacion/web/**/*'],
        tasks: ['copy:web'],
        options: {
          spawn: false
        }
      }
    }
  });

  // ========================================
  // CARGAR PLUGINS DE GRUNT
  // ========================================
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');

  // ========================================
  // DEFINIR TAREAS PRINCIPALES
  // ========================================
  
  // Tarea de compilación únicamente
  grunt.registerTask('compile', [
    'shell:typescript'   // Usar tsc nativo
  ]);
  
  // Tarea de construcción completa
  grunt.registerTask('build', [
    'clean:dist',        // 1. Limpiar directorio
    'shell:typescript',  // 2. Compilar TypeScript con tsc nativo
    'copy:web',         // 3. Copiar archivos web
    'copy:package'      // 4. Preparar package.json
  ]);
  
  // Tarea para construcción y ejecución
  grunt.registerTask('run', [
    'build',            // Construir primero
    'shell:run'         // Luego ejecutar
  ]);
  
  // Tarea de desarrollo con observador
  grunt.registerTask('dev', [
    'build',            // Construcción inicial
    'shell:dev'         // Ejecutar con nodemon
  ]);
  
  // Tarea de limpieza completa
  grunt.registerTask('clean:all', [
    'clean:dist', 
    'clean:temp'
  ]);
  
  // Tarea por defecto
  grunt.registerTask('default', ['build']);
  
  // ========================================
  // TAREAS DE INFORMACIÓN
  // ========================================
  grunt.registerTask('info', 'Información del proyecto', function() {
    grunt.log.writeln('');
    grunt.log.writeln(' SISTEMA DE MONITOREO MINERO');
    grunt.log.writeln('Clean Architecture + DDD');
    grunt.log.writeln(' Construcción automática con Grunt + TypeScript');
    grunt.log.writeln(' UNSA - Ingeniería de Software II - Práctica 03');
    grunt.log.writeln('');
    grunt.log.writeln('  COMANDOS DISPONIBLES:');
    grunt.log.writeln('   npm run build     - Construcción completa');
    grunt.log.writeln('   npm run clean     - Limpiar archivos generados');
    grunt.log.writeln('   npm run run       - Construir y ejecutar');
    grunt.log.writeln('   npm run watch     - Observar cambios');
    grunt.log.writeln('   grunt info        - Esta información');
    grunt.log.writeln('');
    grunt.log.writeln(' ESTRUCTURA DEL PROYECTO:');
    grunt.log.writeln('   aplicacion/       - Casos de uso y servicios');
    grunt.log.writeln('   Dominio/          - Entidades y reglas de negocio');
    grunt.log.writeln('   infraestructura/  - Repositorios e implementaciones');
    grunt.log.writeln('   presentacion/     - Controllers, rutas y web UI');
    grunt.log.writeln('   dist/             - Código compilado (generado)');
    grunt.log.writeln('');
  });
  
  // Tarea para verificar dependencias
  grunt.registerTask('check', 'Verificar configuración', function() {
    grunt.log.writeln('🔍 Verificando configuración...');
    
    // Verificar TypeScript
    var done = this.async();
    grunt.util.spawn({
      cmd: 'tsc',
      args: ['--version']
    }, function(error, result) {
      if (error) {
        grunt.log.error('❌ TypeScript no encontrado. Instalar con: npm install -g typescript');
      } else {
        grunt.log.ok('✅ TypeScript: ' + result.stdout);
      }
      
      // Verificar estructura de proyecto
      if (grunt.file.exists('app.ts')) {
        grunt.log.ok('✅ app.ts encontrado');
      } else {
        grunt.log.error('❌ app.ts no encontrado');
      }
      
      if (grunt.file.exists('tsconfig.json')) {
        grunt.log.ok('✅ tsconfig.json encontrado');
      } else {
        grunt.log.error('❌ tsconfig.json no encontrado');
      }
      
      done();
    });
  });
};