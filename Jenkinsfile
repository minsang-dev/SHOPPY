pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend - Dockerize') {
            when {
                anyOf {
                    branch 'BE'
                    branch 'develop'
                    branch 'buildtest'
                }
            }
            steps {
                dir('SHOPPY-BE') {
                    // Gradle 직접 빌드 제거 (Dockerfile 내부 빌드 사용)
                    sh 'docker build -t shoppy-be:latest .'
                }
            }
        }

        stage('Frontend - Dockerize') {
            when {
                anyOf {
                    branch 'FE'
                    branch 'develop'
                    branch 'buildtest'
                }
            }
            steps {
                dir('SHOPPY-FE') {
                    sh 'docker build -t shoppy-fe:latest .'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // 1. Frontend 배포
                    if (env.BRANCH_NAME == 'FE' || env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'buildtest') {
                        echo 'Deploying Frontend...'
                        sh 'docker stop shoppy-fe || true'
                        sh 'docker rm shoppy-fe || true'
                        sh 'docker run -d --name shoppy-fe -p 3000:3000 --restart always shoppy-fe:latest'
                    }

                    // 2. Backend & OpenVidu 배포
                    if (env.BRANCH_NAME == 'BE' || env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'buildtest') {
                        echo 'Deploying Backend & OpenVidu...'
                        dir('SHOPPY-BE') {
                            sh 'docker-compose up -d --no-build'
                        }
                    }
                }
            }
        }
    }
}
