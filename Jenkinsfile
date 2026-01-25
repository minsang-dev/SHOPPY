pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend - Build & Dockerize') {
            when {
                anyOf {
                    branch 'BE'
                    branch 'develop'
                    branch 'buildtest'
                }
            }
            steps {
                dir('SHOPPY-BE') {
                    // // 1. 단위 테스트 및 검증을 위한 Gradle 빌드
                    // sh 'chmod +x gradlew'
                    // sh './gradlew clean build'
                    
                    // 2. Docker 이미지 빌드
                    sh 'docker build -t shoppy-be:latest .'
                }
            }
            // post {
            //     always {
            //         // JUnit 테스트 결과 리포트 (Gradle 빌드 결과)
            //         junit testResults: 'SHOPPY-BE/build/test-results/test/*.xml', allowEmptyResults: true
            //     }
            // }
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
                    // Docker 이미지 빌드 (빌드 과정은 Dockerfile 내부에 포함됨)
                    sh 'docker build -t shoppy-fe:latest .'
                }
            }
        }
    }
}