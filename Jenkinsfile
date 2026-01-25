pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // 소스 코드 체크아웃
                checkout scm
            }
        }

        stage('Backend - Build & Test') {
            // BE 브랜치이거나 develop 브랜치일 때만 실행
            when {
                anyOf {
                    branch 'BE'
                    branch 'develop'
                }
            }
            steps {
                dir('SHOPPY-BE') {
                    // gradlew 실행 권한 부여
                    sh 'chmod +x gradlew'
                    // 클린 빌드 및 테스트 실행
                    sh './gradlew clean build'
                }
            }
            post {
                always {
                    // JUnit 테스트 결과 리포트 저장
                    junit testResults: 'SHOPPY-BE/build/test-results/test/*.xml', allowEmptyResults: true
                }
            }
        }

        stage('Frontend - Install & Build') {
            // FE 브랜치이거나 develop 브랜치일 때만 실행
            when {
                anyOf {
                    branch 'FE'
                    branch 'develop'
                }
            }
            steps {
                dir('SHOPPY-FE') {
                    // 프론트엔드 의존성 설치
                    sh 'npm install'
                    // 프로덕션 빌드 수행
                    sh 'npm run build'
                }
            }
        }
    }
}
