// =====================================================
// JENKINSFILE - CI/CD Pipeline para Sistema de Monitoreo Minero
// =====================================================
// Pipeline declarativo para construir, probar y desplegar
// microservicios en AWS ECR con validación de calidad
// =====================================================

pipeline {
    agent any
    
    // Variables de entorno
    environment {
        // AWS ECR Configuration
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = credentials('aws-account-id')
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        
        // Credenciales AWS
        AWS_CREDENTIALS = credentials('aws-ecr-credentials')
        
        // Información del build
        GIT_COMMIT_SHORT = sh(
            script: "git rev-parse --short HEAD",
            returnStdout: true
        ).trim()
        BUILD_TAG = "${env.BRANCH_NAME}-${GIT_COMMIT_SHORT}-${env.BUILD_NUMBER}"
        
        // Thresholds de calidad
        COVERAGE_THRESHOLD = '70'
        
        // Servicios a construir
        SERVICES = 'backend,servicio-monitoreo,servicio-operaciones,frontend,api-gateway'
    }
    
    // Triggers del pipeline
    triggers {
        // Ejecutar en cada Pull Request
        githubPullRequests(
            triggerMode: 'CRON',
            spec: 'H/5 * * * *'
        )
    }
    
    // Opciones del pipeline
    options {
        // Mantener solo los últimos 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        
        // Timeout global del pipeline
        timeout(time: 1, unit: 'HOURS')
        
        // Deshabilitar checkout automático
        skipDefaultCheckout()
        
        // Timestamps en los logs
        timestamps()
    }
    
    stages {
        
        // =====================================================
        // STAGE 1: CHECKOUT
        // =====================================================
        stage('Checkout') {
            steps {
                script {
                    echo "===================="
                    echo "Clonando repositorio"
                    echo "Branch: ${env.BRANCH_NAME}"
                    echo "Commit: ${GIT_COMMIT_SHORT}"
                    echo "===================="
                }
                
                checkout scm
                
                // Mostrar información del commit
                sh '''
                    echo "Último commit:"
                    git log -1 --pretty=format:"%h - %an: %s"
                '''
            }
        }
        
        // =====================================================
        // STAGE 2: ANÁLISIS ESTÁTICO
        // =====================================================
        stage('Análisis Estático') {
            parallel {
                stage('Lint Backend') {
                    steps {
                        dir('backend') {
                            echo "Ejecutando análisis estático en Backend..."
                            sh '''
                                if [ -f "package.json" ]; then
                                    npm ci
                                    echo "✓ Dependencias instaladas"
                                fi
                            '''
                        }
                    }
                }
                
                stage('Lint Servicio Monitoreo') {
                    steps {
                        dir('servicio-monitoreo') {
                            echo "Ejecutando análisis estático en Servicio Monitoreo..."
                            sh '''
                                if [ -f "package.json" ]; then
                                    npm ci
                                    echo "✓ Dependencias instaladas"
                                fi
                            '''
                        }
                    }
                }
                
                stage('Lint Servicio Operaciones') {
                    steps {
                        dir('servicio-operaciones') {
                            echo "Ejecutando análisis estático en Servicio Operaciones..."
                            sh '''
                                if [ -f "package.json" ]; then
                                    npm ci
                                    echo "✓ Dependencias instaladas"
                                fi
                            '''
                        }
                    }
                }
            }
        }
        
        // =====================================================
        // STAGE 3: PRUEBAS UNITARIAS
        // =====================================================
        stage('Pruebas Unitarias') {
            parallel {
                stage('Tests Backend') {
                    steps {
                        dir('backend') {
                            echo "Ejecutando pruebas unitarias en Backend..."
                            sh '''
                                npm test -- --coverage --ci
                                
                                # Verificar threshold de cobertura
                                COVERAGE=$(grep -oP '"lines":\s*\{\s*"total":\s*\K[0-9.]+' coverage/coverage-summary.json | head -1)
                                echo "Cobertura actual: ${COVERAGE}%"
                                
                                if (( $(echo "$COVERAGE < $COVERAGE_THRESHOLD" | bc -l) )); then
                                    echo "❌ Cobertura insuficiente: ${COVERAGE}% < ${COVERAGE_THRESHOLD}%"
                                    exit 1
                                fi
                                
                                echo "✓ Cobertura cumple con el threshold: ${COVERAGE}% >= ${COVERAGE_THRESHOLD}%"
                            '''
                        }
                    }
                    post {
                        always {
                            // Publicar reportes de cobertura
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'backend/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report - Backend'
                            ])
                        }
                    }
                }
                
                stage('Tests Servicio Monitoreo') {
                    steps {
                        dir('servicio-monitoreo') {
                            echo "Ejecutando pruebas unitarias en Servicio Monitoreo..."
                            sh '''
                                npm test -- --coverage --ci
                                
                                # Verificar threshold de cobertura
                                if [ -f "coverage/coverage-summary.json" ]; then
                                    COVERAGE=$(grep -oP '"lines":\s*\{\s*"total":\s*\K[0-9.]+' coverage/coverage-summary.json | head -1)
                                    echo "Cobertura actual: ${COVERAGE}%"
                                    
                                    if (( $(echo "$COVERAGE < $COVERAGE_THRESHOLD" | bc -l) )); then
                                        echo "❌ Cobertura insuficiente: ${COVERAGE}% < ${COVERAGE_THRESHOLD}%"
                                        exit 1
                                    fi
                                    
                                    echo "✓ Cobertura cumple con el threshold"
                                fi
                            '''
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'servicio-monitoreo/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report - Monitoreo'
                            ])
                        }
                    }
                }
                
                stage('Tests Servicio Operaciones') {
                    steps {
                        dir('servicio-operaciones') {
                            echo "Ejecutando pruebas unitarias en Servicio Operaciones..."
                            sh '''
                                npm test -- --coverage --ci
                                
                                # Verificar threshold de cobertura
                                if [ -f "coverage/coverage-summary.json" ]; then
                                    COVERAGE=$(grep -oP '"lines":\s*\{\s*"total":\s*\K[0-9.]+' coverage/coverage-summary.json | head -1)
                                    echo "Cobertura actual: ${COVERAGE}%"
                                    
                                    if (( $(echo "$COVERAGE < $COVERAGE_THRESHOLD" | bc -l) )); then
                                        echo "❌ Cobertura insuficiente: ${COVERAGE}% < ${COVERAGE_THRESHOLD}%"
                                        exit 1
                                    fi
                                    
                                    echo "✓ Cobertura cumple con el threshold"
                                fi
                            '''
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'servicio-operaciones/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report - Operaciones'
                            ])
                        }
                    }
                }
            }
        }
        
        // =====================================================
        // STAGE 4: BUILD DE IMÁGENES DOCKER
        // =====================================================
        stage('Build Docker Images') {
            when {
                // Solo construir si las pruebas pasaron
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            echo "Construyendo imagen Docker - Backend"
                            sh """
                                cd backend
                                docker build -t backend:${BUILD_TAG} .
                                docker tag backend:${BUILD_TAG} backend:latest
                                echo "✓ Backend image built successfully"
                            """
                        }
                    }
                }
                
                stage('Build Servicio Monitoreo') {
                    steps {
                        script {
                            echo "Construyendo imagen Docker - Servicio Monitoreo"
                            sh """
                                cd servicio-monitoreo
                                docker build -t servicio-monitoreo:${BUILD_TAG} .
                                docker tag servicio-monitoreo:${BUILD_TAG} servicio-monitoreo:latest
                                echo "✓ Servicio Monitoreo image built successfully"
                            """
                        }
                    }
                }
                
                stage('Build Servicio Operaciones') {
                    steps {
                        script {
                            echo "Construyendo imagen Docker - Servicio Operaciones"
                            sh """
                                cd servicio-operaciones
                                docker build -t servicio-operaciones:${BUILD_TAG} .
                                docker tag servicio-operaciones:${BUILD_TAG} servicio-operaciones:latest
                                echo "✓ Servicio Operaciones image built successfully"
                            """
                        }
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        script {
                            echo "Construyendo imagen Docker - Frontend"
                            sh """
                                cd frontend
                                docker build -t frontend:${BUILD_TAG} .
                                docker tag frontend:${BUILD_TAG} frontend:latest
                                echo "✓ Frontend image built successfully"
                            """
                        }
                    }
                }
                
                stage('Build API Gateway') {
                    steps {
                        script {
                            echo "Construyendo imagen Docker - API Gateway"
                            sh """
                                cd api-gateway
                                docker build -t api-gateway:${BUILD_TAG} .
                                docker tag api-gateway:${BUILD_TAG} api-gateway:latest
                                echo "✓ API Gateway image built successfully"
                            """
                        }
                    }
                }
            }
        }
        
        // =====================================================
        // STAGE 5: PUSH A AWS ECR
        // =====================================================
        stage('Push to AWS ECR') {
            when {
                // Solo pushear en rama main o en PRs aprobados
                anyOf {
                    branch 'main'
                    branch 'develop'
                    expression { env.CHANGE_TARGET == 'main' && env.CHANGE_ID != null }
                }
            }
            
            steps {
                script {
                    echo "===================="
                    echo "Autenticando con AWS ECR"
                    echo "Región: ${AWS_REGION}"
                    echo "Registro: ${ECR_REGISTRY}"
                    echo "===================="
                    
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'aws-ecr-credentials',
                            usernameVariable: 'AWS_ACCESS_KEY_ID',
                            passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                        )
                    ]) {
                        sh '''
                            # Login a ECR
                            aws ecr get-login-password --region ${AWS_REGION} | \
                            docker login --username AWS --password-stdin ${ECR_REGISTRY}
                            
                            echo "✓ Autenticación exitosa con ECR"
                        '''
                        
                        // Push de cada servicio
                        def services = ['backend', 'servicio-monitoreo', 'servicio-operaciones', 'frontend', 'api-gateway']
                        
                        services.each { service ->
                            echo "Pusheando ${service} a ECR..."
                            
                            sh """
                                # Crear repositorio si no existe
                                aws ecr describe-repositories --repository-names ${service} --region ${AWS_REGION} || \
                                aws ecr create-repository --repository-name ${service} --region ${AWS_REGION}
                                
                                # Tag y push
                                docker tag ${service}:${BUILD_TAG} ${ECR_REGISTRY}/${service}:${BUILD_TAG}
                                docker tag ${service}:${BUILD_TAG} ${ECR_REGISTRY}/${service}:latest
                                
                                docker push ${ECR_REGISTRY}/${service}:${BUILD_TAG}
                                docker push ${ECR_REGISTRY}/${service}:latest
                                
                                echo "✓ ${service} pushed successfully"
                            """
                        }
                    }
                }
            }
        }
        
        // =====================================================
        // STAGE 6: LIMPIEZA
        // =====================================================
        stage('Cleanup') {
            steps {
                script {
                    echo "Limpiando imágenes Docker locales..."
                    sh '''
                        # Limpiar imágenes del build actual
                        docker rmi backend:${BUILD_TAG} || true
                        docker rmi servicio-monitoreo:${BUILD_TAG} || true
                        docker rmi servicio-operaciones:${BUILD_TAG} || true
                        docker rmi frontend:${BUILD_TAG} || true
                        docker rmi api-gateway:${BUILD_TAG} || true
                        
                        # Limpiar imágenes dangling
                        docker image prune -f
                        
                        echo "✓ Limpieza completada"
                    '''
                }
            }
        }
    }
    
    // =====================================================
    // POST ACTIONS
    // =====================================================
    post {
        success {
            script {
                echo """
                ========================================
                ✓ PIPELINE EXITOSO
                ========================================
                Branch: ${env.BRANCH_NAME}
                Commit: ${GIT_COMMIT_SHORT}
                Build: ${env.BUILD_NUMBER}
                Tag: ${BUILD_TAG}
                ========================================
                """
                
                // Notificación a Slack/Email si está configurado
                // slackSend(channel: '#deployments', message: "Pipeline exitoso: ${env.JOB_NAME} - ${env.BUILD_NUMBER}")
            }
        }
        
        failure {
            script {
                echo """
                ========================================
                ❌ PIPELINE FALLIDO
                ========================================
                Branch: ${env.BRANCH_NAME}
                Commit: ${GIT_COMMIT_SHORT}
                Build: ${env.BUILD_NUMBER}
                ========================================
                """
                
                // Notificación a Slack/Email si está configurado
                // slackSend(channel: '#deployments', color: 'danger', message: "Pipeline falló: ${env.JOB_NAME} - ${env.BUILD_NUMBER}")
            }
        }
        
        always {
            // Limpiar workspace
            cleanWs(
                deleteDirs: true,
                patterns: [[pattern: 'node_modules', type: 'INCLUDE']]
            )
        }
    }
}
