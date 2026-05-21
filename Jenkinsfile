pipeline {
  agent any

  options {
    disableConcurrentBuilds()
  }

  parameters {
    booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run backend tests and frontend build.')
    booleanParam(name: 'DEPLOY', defaultValue: true, description: 'Push Docker images and deploy with docker compose.')
  }

  environment {
    DOCKER_BUILDKIT = '1'
    COMPOSE_DOCKER_CLI_BUILD = '1'

    DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
    SSH_CREDENTIALS = 'deploy-vps-ssh'

    DOCKERHUB_USER = 'kayndevops'

    BACKEND_DIR = 'backend'
    FRONTEND_DIR = 'frontend'

    BACKEND_IMAGE = "${DOCKERHUB_USER}/fintrackutt-backend"
    FRONTEND_IMAGE = "${DOCKERHUB_USER}/fintrackutt-frontend"

    DEPLOY_USER = 'root'
    DEPLOY_HOST = 'localhost'
    DEPLOY_PATH = '/opt/fintrackutt'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Docker preflight') {
      steps {
        sh '''
          set -eu
          docker version
        '''
      }
    }

    stage('Backend test') {
      when {
        expression { return params.RUN_TESTS }
      }
      steps {
        sh '''
          set -eu

          if [ -f "$WORKSPACE/$BACKEND_DIR/pom.xml" ]; then
            BACKEND_PATH="$WORKSPACE/$BACKEND_DIR"
          elif [ -f "$WORKSPACE/pom.xml" ]; then
            BACKEND_PATH="$WORKSPACE"
          else
            echo "Cannot find backend pom.xml"
            ls -la "$WORKSPACE"
            exit 1
          fi

          CI_NET="fintrack_ci_net_${BUILD_NUMBER}"
          CI_MYSQL="fintrack_ci_mysql_${BUILD_NUMBER}"

          docker network create "$CI_NET" >/dev/null 2>&1 || true
          docker rm -f "$CI_MYSQL" >/dev/null 2>&1 || true

          docker run -d --name "$CI_MYSQL" --network "$CI_NET" \
            -e MYSQL_DATABASE=fintrack \
            -e MYSQL_USER=fintrack \
            -e MYSQL_PASSWORD=fintrack_password \
            -e MYSQL_ROOT_PASSWORD=root_password \
            mysql:8.4 >/dev/null

          i=0
          until docker exec "$CI_MYSQL" mysqladmin ping -h 127.0.0.1 -uroot -proot_password --silent >/dev/null 2>&1; do
            sleep 2
            i=$((i+1))
            if [ "$i" -ge 60 ]; then
              echo "MySQL did not become ready in time"
              docker logs "$CI_MYSQL" || true
              exit 1
            fi
          done

          docker run --rm --network "$CI_NET" \
            -e SQL_URL="jdbc:mysql://$CI_MYSQL:3306/fintrack?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" \
            -e SQL_USERNAME="fintrack" \
            -e SQL_PASSWORD="fintrack_password" \
            -e JWT_SECRET_KEY="change-me-change-me-change-me-change-me" \
            -v "$BACKEND_PATH:/workspace" \
            -w /workspace \
            maven:3.9-eclipse-temurin-21 \
            mvn -B test
        '''
      }
      post {
        always {
          sh '''
            set +e
            CI_NET="fintrack_ci_net_${BUILD_NUMBER}"
            CI_MYSQL="fintrack_ci_mysql_${BUILD_NUMBER}"
            docker rm -f "$CI_MYSQL" >/dev/null 2>&1 || true
            docker network rm "$CI_NET" >/dev/null 2>&1 || true
          '''
        }
      }
    }

    stage('Frontend build') {
      when {
        expression { return params.RUN_TESTS }
      }
      steps {
        sh '''
          set -eu

          if [ -f "$WORKSPACE/$FRONTEND_DIR/package.json" ]; then
            FRONTEND_PATH="$WORKSPACE/$FRONTEND_DIR"
          elif [ -f "$WORKSPACE/package.json" ]; then
            FRONTEND_PATH="$WORKSPACE"
          else
            echo "Cannot find frontend package.json"
            ls -la "$WORKSPACE"
            exit 1
          fi

          docker run --rm \
            -v "$FRONTEND_PATH:/workspace" \
            -w /workspace \
            node:22-alpine \
            sh -lc "npm ci && npm run build"
        '''
      }
    }

    stage('Build Docker images') {
      steps {
        sh '''
          set -eu

          BACKEND_CONTEXT="./$BACKEND_DIR"
          FRONTEND_CONTEXT="./$FRONTEND_DIR"

          if [ ! -f "$BACKEND_CONTEXT/Dockerfile" ]; then
            echo "Cannot find backend Dockerfile at $BACKEND_CONTEXT/Dockerfile"
            exit 1
          fi

          if [ ! -f "$FRONTEND_CONTEXT/Dockerfile" ]; then
            echo "Cannot find frontend Dockerfile at $FRONTEND_CONTEXT/Dockerfile"
            exit 1
          fi

          docker build \
            -t ${BACKEND_IMAGE}:latest \
            -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
            "$BACKEND_CONTEXT"

          docker build \
            --build-arg VITE_BACKEND_API_URL="/api" \
            -t ${FRONTEND_IMAGE}:latest \
            -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
            "$FRONTEND_CONTEXT"
        '''
      }
    }

    stage('Push Docker images') {
      when {
        expression { return params.DEPLOY }
      }
      steps {
        withCredentials([usernamePassword(
          credentialsId: "${DOCKERHUB_CREDENTIALS}",
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
            set -eu

            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

            docker push ${BACKEND_IMAGE}:latest
            docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}

            docker push ${FRONTEND_IMAGE}:latest
            docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
          '''
        }
      }
    }

    stage('Deploy to server') {
      when {
        expression { return params.DEPLOY }
      }
      steps {
        sshagent(credentials: ["${SSH_CREDENTIALS}"]) {
          sh '''
            set -eu

            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "
              cd ${DEPLOY_PATH} &&
              docker compose pull &&
              docker compose down &&
              docker compose up -d
            "
          '''
        }
      }
    }
  }

  post {
    success {
      echo 'CI/CD deploy thành công!'
    }

    failure {
      echo 'CI/CD deploy thất bại. Kiểm tra Jenkins Console Output.'
    }

    always {
      sh '''
        set +e
        docker logout >/dev/null 2>&1 || true
      '''
    }
  }
}