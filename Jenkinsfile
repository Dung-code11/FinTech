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
    // Optional: override project paths (monorepo vs split repos)
    // BACKEND_DIR=backend
    // FRONTEND_DIR=frontend
  }

  stages {
    stage('Checkout') {
      steps {
        script {
          // Some Jenkins job types (e.g. "Pipeline script") do not automatically checkout the repo.
          // This makes the pipeline self-contained for both "Pipeline script from SCM" and Multibranch jobs.
          try {
            checkout scm
          } catch (Exception e) {
            echo "SCM checkout did not run (or SCM not configured). Workspace may be empty."
            echo "If you see an empty workspace, configure the job as 'Pipeline script from SCM' (or Multibranch) so Jenkins can fetch the repository."
            // Re-throw to fail fast; build steps require source code.
            throw e
          }
        }
      }
    }

    stage('Docker: preflight') {
      when {
        expression { return params.RUN_TESTS || params.DOCKER_BUILD || params.DEPLOY_COMPOSE }
      }
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -eu
              docker version
            '''
          } else {
            powershell '''
              $ErrorActionPreference = 'Stop'
              docker version
            '''
          }
        }
      }
    }

    stage('Backend: test') {
      when { expression { return params.RUN_TESTS } }
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -eu

              BACKEND_DIR="${BACKEND_DIR:-backend}"
              if [ -f "$WORKSPACE/$BACKEND_DIR/pom.xml" ]; then
                BACKEND_PATH="$WORKSPACE/$BACKEND_DIR"
              elif [ -f "$WORKSPACE/pom.xml" ]; then
                BACKEND_PATH="$WORKSPACE"
              else
                echo "Cannot find pom.xml in $WORKSPACE/$BACKEND_DIR or $WORKSPACE"
                ls -la "$WORKSPACE" || true
                exit 1
              fi

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
                -v "$BACKEND_PATH:/workspace" \
                -w /workspace \
                maven:3.9-eclipse-temurin-21 \
                mvn -B test
            '''
          } else {
            powershell '''
              $ErrorActionPreference = 'Stop'

              $backendDir = if ($env:BACKEND_DIR) { $env:BACKEND_DIR } else { 'backend' }
              $backendPath = Join-Path $env:WORKSPACE $backendDir
              if (Test-Path (Join-Path $backendPath 'pom.xml')) {
                # ok
              } elseif (Test-Path (Join-Path $env:WORKSPACE 'pom.xml')) {
                $backendPath = $env:WORKSPACE
              } else {
                Write-Error "Cannot find pom.xml in $backendPath or $env:WORKSPACE"
              }

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
                -v "$backendPath:/workspace" `
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
              FRONTEND_DIR="${FRONTEND_DIR:-frontend}"
              if [ -f "$WORKSPACE/$FRONTEND_DIR/package.json" ]; then
                FRONTEND_PATH="$WORKSPACE/$FRONTEND_DIR"
              elif [ -f "$WORKSPACE/package.json" ]; then
                FRONTEND_PATH="$WORKSPACE"
              else
                echo "Cannot find package.json in $WORKSPACE/$FRONTEND_DIR or $WORKSPACE"
                ls -la "$WORKSPACE" || true
                exit 1
              fi

              docker run --rm \
                -v "$FRONTEND_PATH:/workspace" \
                -w /workspace \
                node:22-alpine \
                sh -lc "npm ci && npm run lint && npm run build"
            '''
          } else {
            powershell '''
              $ErrorActionPreference = 'Stop'
              $workspace = $env:WORKSPACE
              if (-not $workspace) { throw "WORKSPACE env var is missing" }

              $frontendDir = if ($env:FRONTEND_DIR) { $env:FRONTEND_DIR } else { 'frontend' }
              $frontendPath = Join-Path $workspace $frontendDir
              if (Test-Path (Join-Path $frontendPath 'package.json')) {
                # ok
              } elseif (Test-Path (Join-Path $workspace 'package.json')) {
                $frontendPath = $workspace
              } else {
                Write-Error "Cannot find package.json in $frontendPath or $workspace"
              }

              docker run --rm `
                -v "$frontendPath:/workspace" `
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
              BACKEND_DIR="${BACKEND_DIR:-backend}"
              FRONTEND_DIR="${FRONTEND_DIR:-frontend}"

              BACKEND_CONTEXT="./$BACKEND_DIR"
              [ -f "$BACKEND_CONTEXT/pom.xml" ] || BACKEND_CONTEXT="."
              FRONTEND_CONTEXT="./$FRONTEND_DIR"
              [ -f "$FRONTEND_CONTEXT/package.json" ] || FRONTEND_CONTEXT="."

              docker build -t fintech-backend:ci "$BACKEND_CONTEXT"
              docker build -t fintech-frontend:ci \
                --build-arg VITE_BACKEND_API_URL="/api" \
                "$FRONTEND_CONTEXT"
            '''
          } else {
            powershell '''
              $ErrorActionPreference = 'Stop'
              $backendDir = if ($env:BACKEND_DIR) { $env:BACKEND_DIR } else { 'backend' }
              $frontendDir = if ($env:FRONTEND_DIR) { $env:FRONTEND_DIR } else { 'frontend' }

              $backendContext = ".\\$backendDir"
              if (-not (Test-Path (Join-Path $backendContext 'pom.xml'))) { $backendContext = "." }
              $frontendContext = ".\\$frontendDir"
              if (-not (Test-Path (Join-Path $frontendContext 'package.json'))) { $frontendContext = "." }

              docker build -t fintech-backend:ci $backendContext
              docker build -t fintech-frontend:ci `
                --build-arg VITE_BACKEND_API_URL="/api" `
                $frontendContext
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
