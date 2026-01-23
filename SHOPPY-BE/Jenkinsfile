pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    sh 'docker compose up --build -d'
                }
            }
        }

        stage('Clean up') {
             steps {
                script {
                    sh 'docker image prune -f'
                }
             }
        }
    }
}