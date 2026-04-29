pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
  }

  parameters {
    booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run backend + frontend checks')
    booleanParam(name: 'PUSH_IMAGES', defaultValue: false, description: 'Push Docker images to a registry')
    string(name: 'IMAGE_TAG', defaultValue: '', description: 'Docker tag (default: short git sha)')
  }

  environment {
    // Defaults (override in Jenkins job config as needed)
    MYSQL_ROOT_PASSWORD = 'root'
    JWT_SECRET_KEY = 'change-me'

    DOCKER_REGISTRY = 'docker.io'
    DOCKER_NAMESPACE = 'your-namespace'
    DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.GIT_SHA_SHORT = (env.GIT_COMMIT ?: '').take(7)
          env.EFFECTIVE_TAG = (params.IMAGE_TAG?.trim()) ? params.IMAGE_TAG.trim() : env.GIT_SHA_SHORT
        }
      }
    }

    stage('Checks') {
      when { expression { return params.RUN_TESTS } }
      steps {
        script {
          def run = { cmd ->
            if (isUnix()) { sh cmd } else { bat cmd }
          }

          // Backend build (requires a DB for @SpringBootTest)
          run('docker rm -f fintech-ci-db 2>/dev/null || true')
          run("docker run -d --name fintech-ci-db -e MYSQL_DATABASE=fintech -e MYSQL_ROOT_PASSWORD=${env.MYSQL_ROOT_PASSWORD} -p 3308:3306 mysql:8.4")

          try {
            run(isUnix()
              ? "cd backend && SQL_URL='jdbc:mysql://localhost:3308/fintech' SQL_USERNAME='root' SQL_PASSWORD='${env.MYSQL_ROOT_PASSWORD}' JWT_SECRET_KEY='${env.JWT_SECRET_KEY}' ./mvnw -q test"
              : "cd backend && set SQL_URL=jdbc:mysql://localhost:3308/fintech && set SQL_USERNAME=root && set SQL_PASSWORD=${env.MYSQL_ROOT_PASSWORD} && set JWT_SECRET_KEY=${env.JWT_SECRET_KEY} && mvnw.cmd -q test"
            )
          } finally {
            run('docker rm -f fintech-ci-db || true')
          }

          // Frontend lint (fast feedback)
          run(isUnix()
            ? "cd fintech-mobile && npm ci && npm run lint"
            : "cd fintech-mobile && npm ci && npm run lint"
          )
        }
      }
    }

    stage('Build Images') {
      steps {
        script {
          def run = { cmd ->
            if (isUnix()) { sh cmd } else { bat cmd }
          }

          run("docker build -t ${env.DOCKER_NAMESPACE}/fintech-backend:${env.EFFECTIVE_TAG} backend")
          run("docker build -t ${env.DOCKER_NAMESPACE}/fintech-frontend:${env.EFFECTIVE_TAG} fintech-mobile")
        }
      }
    }

    stage('Push Images') {
      when { expression { return params.PUSH_IMAGES } }
      steps {
        script {
          def run = { cmd ->
            if (isUnix()) { sh cmd } else { bat cmd }
          }

          withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            run(isUnix()
              ? "echo \"$DOCKER_PASS\" | docker login ${env.DOCKER_REGISTRY} -u \"$DOCKER_USER\" --password-stdin"
              : "echo %DOCKER_PASS% | docker login ${env.DOCKER_REGISTRY} -u %DOCKER_USER% --password-stdin"
            )
          }

          run("docker push ${env.DOCKER_NAMESPACE}/fintech-backend:${env.EFFECTIVE_TAG}")
          run("docker push ${env.DOCKER_NAMESPACE}/fintech-frontend:${env.EFFECTIVE_TAG}")
        }
      }
    }
  }

  post {
    always {
      script {
        try {
          if (isUnix()) { sh 'docker rm -f fintech-ci-db 2>/dev/null || true' }
          else { bat 'docker rm -f fintech-ci-db 2>nul || exit /b 0' }
        } catch (ignored) { }
      }
    }
  }
}
