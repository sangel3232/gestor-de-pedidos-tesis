// ============================================================
// JENKINSFILE - Gestor de Pedidos
// Pipeline: DEV → QA → RELEASE (con aprobacion manual)
// ============================================================

pipeline {

    agent any

    // ── Variables globales ───────────────────────────────────
    environment {
        APP_NAME        = "gestor-pedidos"
        BACKEND_DIR     = "gestor_pedidos"
        FRONTEND_DIR    = "Gestor-de-Pedidos-Portal"
        DOCKER_REGISTRY = "${env.DOCKER_REGISTRY ?: 'tu-usuario-dockerhub'}"
        IMAGE_BACKEND   = "${DOCKER_REGISTRY}/${APP_NAME}-backend"
        IMAGE_FRONTEND  = "${DOCKER_REGISTRY}/${APP_NAME}-frontend"
        IMAGE_TAG       = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'local'}"
    }

    // ── Opciones del pipeline ────────────────────────────────
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 90, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    // ── Parametros manuales ──────────────────────────────────
    parameters {
        choice(
            name: 'DEPLOY_ENV',
            choices: ['dev', 'qa', 'release'],
            description: 'Ambiente de despliegue'
        )
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: false,
            description: 'Omitir pruebas (solo para emergencias)'
        )
    }

    stages {

        // ── STAGE 1: Checkout ────────────────────────────────
        stage('Checkout') {
            steps {
                echo "=== Descargando codigo fuente ==="
                checkout scm
                sh 'git log --oneline -5'
            }
        }

        // ── STAGE 2: Build Backend ───────────────────────────
        stage('Build Backend') {
            steps {
                echo "=== Compilando Spring Boot ==="
                dir("${BACKEND_DIR}") {
                    sh '''
                        export MAVEN_OPTS="-Xmx512m -XX:MaxMetaspaceSize=256m"
                        mvn clean package \
                            -DskipTests=true \
                            -B \
                            --no-transfer-progress
                    '''
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: "${BACKEND_DIR}/target/*.jar", fingerprint: true
                }
            }
        }

        // ── STAGE 3: Tests Backend ───────────────────────────
        stage('Tests Backend') {
            when {
                expression { return false } // Tests de integracion requieren BD - se ejecutan en ambiente QA
            }
            steps {
                echo "=== Tests omitidos en CI - requieren BD ==="
            }
        }

        // ── STAGE 4: Build Frontend ──────────────────────────
        stage('Build Frontend') {
            steps {
                echo "=== Compilando React/Vite ==="
                dir("${FRONTEND_DIR}") {
                    sh '''
                        npm install
                        npm run build
                    '''
                }
            }
        }

        // ── STAGE 5: Build Docker Images ─────────────────────
        stage('Build Docker Images') {
            steps {
                echo "=== Construyendo imagenes Docker ==="
                script {
                    // Backend — usa el JAR ya compilado por Maven
                    dir("${BACKEND_DIR}") {
                        sh """
                            docker build \
                                -t ${IMAGE_BACKEND}:${IMAGE_TAG} \
                                -t ${IMAGE_BACKEND}:latest \
                                .
                        """
                    }
                    // Frontend
                    dir("${FRONTEND_DIR}") {
                        def apiUrl = params.DEPLOY_ENV == 'release'
                            ? 'https://api.gestor-pedidos.com'
                            : params.DEPLOY_ENV == 'qa'
                                ? 'http://qa.gestor-pedidos.com:8081'
                                : "http://${env.EC2_DEV_HOST ?: 'localhost'}:8080"
                        sh """
                            docker build \
                                --build-arg VITE_API_BASE_URL=${apiUrl} \
                                --build-arg VITE_ENV=${params.DEPLOY_ENV} \
                                -t ${IMAGE_FRONTEND}:${IMAGE_TAG} \
                                -t ${IMAGE_FRONTEND}:latest \
                                .
                        """
                    }
                }
            }
        }

        // ── STAGE 6: Push a Docker Registry ──────────────────
        stage('Push Docker Images') {
            steps {
                echo "=== Subiendo imagenes al registry ==="
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                        docker push ${IMAGE_BACKEND}:${IMAGE_TAG}
                        docker push ${IMAGE_BACKEND}:latest
                        docker push ${IMAGE_FRONTEND}:${IMAGE_TAG}
                        docker push ${IMAGE_FRONTEND}:latest
                        docker logout
                    """
                }
            }
        }

        // ── STAGE 7: Deploy DEV ───────────────────────────────
        stage('Deploy DEV') {
            when {
                anyOf {
                    expression { return params.DEPLOY_ENV == 'dev' }
                    branch 'develop'
                }
            }
            steps {
                echo "=== Desplegando en DEV ==="
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'aws-ec2-dev-key', keyFileVariable: 'SSH_KEY'),
                    string(credentialsId: 'ec2-dev-host', variable: 'EC2_HOST')
                ]) {
                    sh """
                        scp -i ${SSH_KEY} -o StrictHostKeyChecking=no \
                            ${BACKEND_DIR}/.env.dev ubuntu@${EC2_HOST}:/home/ubuntu/gestor-pedidos/.env

                        ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            cd /home/ubuntu/gestor-pedidos
                            export IMAGE_TAG=${IMAGE_TAG}
                            docker-compose -f docker-compose.dev.yml --env-file .env pull
                            docker-compose -f docker-compose.dev.yml --env-file .env up -d --remove-orphans
                            docker system prune -f
                        '
                    """
                }
            }
            post {
                success {
                    echo "✅ DEV desplegado exitosamente - Build #${BUILD_NUMBER}"
                }
            }
        }

        // ── STAGE 8: Aprobacion para QA ───────────────────────
        stage('Aprobacion QA') {
            when {
                anyOf {
                    expression { return params.DEPLOY_ENV == 'qa' }
                    expression { return params.DEPLOY_ENV == 'release' }
                    branch 'main'
                }
            }
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    input message: "¿Desplegar build #${BUILD_NUMBER} en QA?",
                          ok: 'Aprobar QA',
                          submitter: 'admin'
                }
            }
        }

        // ── STAGE 9: Deploy QA ────────────────────────────────
        stage('Deploy QA') {
            when {
                anyOf {
                    expression { return params.DEPLOY_ENV == 'qa' }
                    expression { return params.DEPLOY_ENV == 'release' }
                    branch 'main'
                }
            }
            steps {
                echo "=== Desplegando en QA ==="
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'aws-ec2-qa-key', keyFileVariable: 'SSH_KEY'),
                    string(credentialsId: 'ec2-qa-host', variable: 'EC2_HOST')
                ]) {
                    sh """
                        scp -i ${SSH_KEY} -o StrictHostKeyChecking=no \
                            ${BACKEND_DIR}/.env.qa ubuntu@${EC2_HOST}:/home/ubuntu/gestor-pedidos/.env

                        ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            cd /home/ubuntu/gestor-pedidos
                            export IMAGE_TAG=${IMAGE_TAG}
                            docker-compose -f docker-compose.qa.yml --env-file .env pull
                            docker-compose -f docker-compose.qa.yml --env-file .env up -d --remove-orphans
                            docker system prune -f
                        '
                    """
                }
            }
            post {
                success {
                    echo "✅ QA desplegado exitosamente - Build #${BUILD_NUMBER}"
                }
            }
        }

        // ── STAGE 10: Aprobacion para RELEASE ─────────────────
        stage('Aprobacion RELEASE') {
            when {
                expression { return params.DEPLOY_ENV == 'release' }
            }
            steps {
                timeout(time: 60, unit: 'MINUTES') {
                    input message: "⚠️ ¿Desplegar build #${BUILD_NUMBER} en PRODUCCION?",
                          ok: 'Aprobar RELEASE',
                          submitter: 'admin'
                }
            }
        }

        // ── STAGE 11: Deploy RELEASE ──────────────────────────
        stage('Deploy RELEASE') {
            when {
                expression { return params.DEPLOY_ENV == 'release' }
            }
            steps {
                echo "=== Desplegando en PRODUCCION ==="
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'aws-ec2-prod-key', keyFileVariable: 'SSH_KEY'),
                    string(credentialsId: 'ec2-prod-host', variable: 'EC2_HOST'),
                    file(credentialsId: 'env-release-file', variable: 'ENV_FILE')
                ]) {
                    sh """
                        scp -i ${SSH_KEY} -o StrictHostKeyChecking=no \
                            ${ENV_FILE} ubuntu@${EC2_HOST}:/home/ubuntu/gestor-pedidos/.env

                        ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            cd /home/ubuntu/gestor-pedidos
                            export IMAGE_TAG=${IMAGE_TAG}
                            docker-compose -f docker-compose.release.yml --env-file .env pull
                            docker-compose -f docker-compose.release.yml --env-file .env up -d --remove-orphans
                            docker system prune -f
                            echo "Verificando health check..."
                            sleep 30
                            curl -f http://localhost:8080/actuator/health || exit 1
                        '
                    """
                }
            }
            post {
                success {
                    echo "🚀 PRODUCCION desplegada exitosamente - Build #${BUILD_NUMBER}"
                }
            }
        }
    }

    // ── Post-pipeline ────────────────────────────────────────
    post {
        always {
            echo "=== Fin del pipeline ==="
        }
        success {
            echo "✅ Pipeline completado exitosamente - Build #${BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline fallido - Build #${BUILD_NUMBER}"
        }
    }
}
