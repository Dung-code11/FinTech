pipeline {
  agent any

  options {
    disableConcurrentBuilds()
  }

  parameters {
    booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run backend tests and frontend lint/build.')
    booleanParam(name: 'DOCKER_BUILD', defaultValue: true, description: 'Build Docker images for backend/frontend.')
    booleanParam(name: 'DEPLOY_COMPOSE', defaultValue: false, description: 'Deploy on the Jenkins agent using docker compose (requires prod files on agent).')
  }

  environment {
    DOCKER_BUILDKIT = '1'
    COMPOSE_DOCKER_CLI_BUILD = '1'
    // Override in Jenkins job / global env:
    // DEPLOY_HOST, DEPLOY_USER (if you want SSH deploy)
  }

  stages {
    stage('Backend: test') {
      when { expression { return params.RUN_TESTS } }
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -eu

              # Spin up a throwaway MySQL for Spring contextLoads (requires SQL_URL/SQL_USERNAME/SQL_PASSWORD).
              CI_NET="fintech_ci_net_${BUILD_NUMBER:-0}"
              CI_MYSQL="fintech_ci_mysql_${BUILD_NUMBER:-0}"

              docker network create "$CI_NET" >/dev/null 2>&1 || true
              docker rm -f "$CI_MYSQL" >/dev/null 2>&1 || true
              docker run -d --name "$CI_MYSQL" --network "$CI_NET" \
                -e MYSQL_DATABASE=fintech \
                -e MYSQL_USER=fintech \
                -e MYSQL_PASSWORD=fintech_password \
                -e MYSQL_ROOT_PASSWORD=root_password \
                mysql:8.4 >/dev/null

              # Wait for DB ready (avoid flakiness)
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
                -e SQL_URL="jdbc:mysql://$CI_MYSQL:3306/fintech?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" \
                -e SQL_USERNAME="fintech" \
                -e SQL_PASSWORD="fintech_password" \
                -e JWT_SECRET_KEY="change-me-change-me-change-me-change-me" \
                -v "$WORKSPACE/backend:/workspace" \
                -w /workspace \
                maven:3.9-eclipse-temurin-21 \
                mvn -B test
            '''
          } else {
            powershell '''
              $ErrorActionPreference = 'Stop'

              $buildNumber = if ($env:BUILD_NUMBER) { $env:BUILD_NUMBER } else { '0' }
              $ciNet = "fintech_ci_net_$buildNumber"
              $ciMysql = "fintech_ci_mysql_$buildNumber"

              docker network create $ciNet 2>$null | Out-Null
              docker rm -f $ciMysql 2>$null | Out-Null

              docker run -d --name $ciMysql --network $ciNet `
                -e MYSQL_DATABASE=fintech `
                -e MYSQL_USER=fintech `
                -e MYSQL_PASSWORD=fintech_password `
                -e MYSQL_ROOT_PASSWORD=root_password `
                mysql:8.4 | Out-Null

              for ($i=0; $i -lt 60; $i++) {
                $ok = $true
                try {
                  docker exec $ciMysql mysqladmin ping -h 127.0.0.1 -uroot -proot_password --silent | Out-Null
                } catch {
                  $ok = $false
                }
                if ($ok) { break }
                Start-Sleep -Seconds 2
                if ($i -eq 59) {
                  Write-Error "MySQL did not become ready in time"
                }
              }

              $workspace = $env:WORKSPACE
              if (-not $workspace) { throw "WORKSPACE env var is missing" }

              docker run --rm --network $ciNet `
                -e SQL_URL="jdbc:mysql://$ciMysql`:3306/fintech?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" `
                -e SQL_USERNAME=fintech `
                -e SQL_PASSWORD=fintech_password `
                -e JWT_SECRET_KEY=change-me-change-me-change-me-change-me `
                -v "$workspace\\backend:/workspace" `
                -w /workspace `
                maven:3.9-eclipse-temurin-21 `
                mvn -B test
            '''
          }
        }
      }
      post {
        always {
          script {
            if (isUnix()) {
              sh '''
                set +e
                CI_NET="fintech_ci_net_${BUILD_NUMBER:-0}"
                CI_MYSQL="fintech_ci_mysql_${BUILD_NUMBER:-0}"
                docker rm -f "$CI_MYSQL" >/dev/null 2>&1 || true
                docker network rm "$CI_NET" >/dev/null 2>&1 || true
              '''
            } else {
              powershell '''
                $ErrorActionPreference = 'Continue'
                $buildNumber = if ($env:BUILD_NUMBER) { $env:BUILD_NUMBER } else { '0' }
                $ciNet = "fintech_ci_net_$buildNumber"
                $ciMysql = "fintech_ci_mysql_$buildNumber"
                docker rm -f $ciMysql 2>$null | Out-Null
                docker network rm $ciNet 2>$null | Out-Null
              '''
            }
          }
        }
      }
    }

    stage('Frontend: lint/build') {
      when { expression { return params.RUN_TESTS } }
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -eu
              docker run --rm \
                -v "$WORKSPACE/frontend:/workspace" \
                -w /workspace \
                node:22-alpine \
                sh -lc "npm ci && npm run lint && npm run build"
            '''
          } else {
            powershell '''
              $ErrorActionPreference = 'Stop'
              $workspace = $env:WORKSPACE
              if (-not $workspace) { throw "WORKSPACE env var is missing" }
              docker run --rm `
                -v "$workspace\\frontend:/workspace" `
                -w /workspace `
                node:22-alpine `
                sh -lc "npm ci && npm run lint && npm run build"
            '''
          }
        }
      }
    }

    stage('Docker: build') {
      when { expression { return params.DOCKER_BUILD } }
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -eu
              docker build -t fintech-backend:ci ./backend
              docker build -t fintech-frontend:ci \
                --build-arg VITE_BACKEND_API_URL="/api" \
                ./frontend
            '''
          } else {
            powershell '''
              $ErrorActionPreference = 'Stop'
              docker build -t fintech-backend:ci ./backend
              docker build -t fintech-frontend:ci `
                --build-arg VITE_BACKEND_API_URL="/api" `
                ./frontend
            '''
          }
        }
      }
    }

    stage('Deploy (optional)') {
      when {
        allOf {
          branch 'main'
          expression { return params.DEPLOY_COMPOSE }
        }
      }
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -eu
              docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
            '''
          } else {
            powershell '''
              $ErrorActionPreference = 'Stop'
              docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
            '''
          }
        }

        // Default deploy runs on the Jenkins agent host.
        // If you prefer SSH deploy to a remote server, do it with Jenkins Credentials, e.g.:
        // withCredentials([sshUserPrivateKey(credentialsId: 'deploy-ssh-key', keyFileVariable: 'SSH_KEY')]) {
        //   sh '''
        //     set -eu
        //     chmod 600 "$SSH_KEY"
        //     ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "cd /opt/fintech && docker compose -f docker-compose.prod.yml up -d --build --remove-orphans"
        //   '''
        // }
      }
    }
  }
}
