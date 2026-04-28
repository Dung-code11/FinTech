pipeline {
  agent any

  options {
    disableConcurrentBuilds()
  }

  environment {
    DOCKER_BUILDKIT = '1'
    COMPOSE_DOCKER_CLI_BUILD = '1'
    // Override in Jenkins job / global env:
    // NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_API_BASE_URL, DEPLOY_HOST, DEPLOY_USER
  }

  stages {
    stage('Backend: test') {
      steps {
        sh '''
          set -euo pipefail
          docker run --rm \
            -v "$PWD/backend:/workspace" \
            -w /workspace \
            maven:3.9-eclipse-temurin-21 \
            ./mvnw -B test
        '''
      }
    }

    stage('Frontend: lint/build') {
      steps {
        sh '''
          set -euo pipefail
          docker run --rm \
            -v "$PWD/frontend-nextjs-seo-geo:/workspace" \
            -w /workspace \
            node:20-alpine \
            sh -lc "npm ci && npm run lint && npm run typecheck && npm run build"
        '''
      }
    }

    stage('Docker: build') {
      steps {
        sh '''
          set -euo pipefail
          docker build -t fintech-backend:ci ./backend
          docker build -t fintech-frontend:ci \
            --build-arg NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}" \
            --build-arg NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8080}" \
            ./frontend-nextjs-seo-geo
        '''
      }
    }

    stage('Deploy (optional)') {
      when {
        branch 'main'
      }
      steps {
        echo 'Configure DEPLOY_HOST + Jenkins credentials to enable deploy.'
        // Example deploy (requires Credentials Binding plugin):
        // withCredentials([sshUserPrivateKey(credentialsId: 'deploy-ssh-key', keyFileVariable: 'SSH_KEY')]) {
        //   sh '''
        //     set -euo pipefail
        //     chmod 600 "$SSH_KEY"
        //     ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "cd /opt/fintech && docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d --remove-orphans"
        //   '''
        // }
      }
    }
  }
}
