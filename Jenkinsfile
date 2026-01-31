pipeline {
    agent any

    // 등록한 모든 Credentials를 환경 변수로 매핑
    environment {
        DB_ROOT_PASS = credentials('SHOPPY_MYSQL_ROOT_PASS')
        DB_PASS      = credentials('SHOPPY_MYSQL_PASS')
        DB_USER      = credentials('SHOPPY_MYSQL_USER')
        OV_SECRET    = credentials('SHOPPY_OV_SECRET')
        KAKAO_JS     = credentials('KAKAO_JS_KEY')
        KAKAO_REST   = credentials('KAKAO_REST_KEY')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend - Dockerize') {
            when {
                anyOf {
                    branch 'develop'; branch 'buildtest'; branch 'release'
                }
            }
            steps {
                dir('SHOPPY-BE') {
                    sh 'docker build -t shoppy-be:latest .'
                }
            }
        }

        stage('Frontend - Dockerize') {
            when {
                anyOf {
                    branch 'develop'; branch 'buildtest'; branch 'release'
                }
            }
            steps {
                dir('SHOPPY-FE') {
                    sh """
                        docker build --no-cache \
                        --build-arg VITE_API_BASE_URL=https://i14c209.p.ssafy.io/api \
                        --build-arg VITE_WEBSOCKET_URL=https://i14c209.p.ssafy.io/api/ws \
                        --build-arg VITE_REALTIME_ENABLED=true \
                        --build-arg VITE_KAKAO_JS_KEY=${KAKAO_JS} \
                        --build-arg VITE_KAKAO_REST_KEY=${KAKAO_REST} \
                        -t shoppy-fe:latest .
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    def targetBranches = ['develop', 'buildtest', 'release']
                    if (targetBranches.contains(env.BRANCH_NAME)) {
                        
                        echo 'Deploying Frontend...'
                        sh 'docker stop shoppy-fe || true'
                        sh 'docker rm shoppy-fe || true'
                        sh 'docker run -d --name shoppy-fe -p 3000:3000 --restart always shoppy-fe:latest'

                        echo 'Deploying Backend & OpenVidu...'
                        dir('SHOPPY-BE') {
                            sh """
                                echo "DOMAIN_OR_PUBLIC_IP=i14c209.p.ssafy.io" > .env
                                echo "SERVER_SSL_ENABLED=true" >> .env
                                echo "HTTPS_PORT=5443" >> .env
                                echo "CERTIFICATE_TYPE=owncert" >> .env
                                echo "OPENVIDU_SECRET=${OV_SECRET}" >> .env
                                echo "LETSENCRYPT_EMAIL=user@example.com" >> .env
                                echo "OPENVIDU_RECORDING=false" >> .env
                                echo "OPENVIDU_RECORDING_DEBUG=false" >> .env
                                echo "OPENVIDU_RECORDING_PATH=/opt/openvidu/recordings" >> .env
                                echo "OPENVIDU_RECORDING_CUSTOM_LAYOUT=/opt/openvidu/custom-layout" >> .env
                                echo "OPENVIDU_RECORDING_PUBLIC_ACCESS=false" >> .env
                                echo "OPENVIDU_RECORDING_NOTIFICATION=publisher_moderator" >> .env
                                echo "OPENVIDU_RECORDING_AUTOSTOP_TIMEOUT=120" >> .env
                                echo "V_BANDWIDTH=1000" >> .env
                                echo "OPENVIDU_STREAMS_VIDEO_MIN_RECV_BANDWIDTH=300" >> .env
                                echo "OPENVIDU_STREAMS_VIDEO_MAX_SEND_BANDWIDTH=1000" >> .env
                                echo "OPENVIDU_STREAMS_VIDEO_MIN_SEND_BANDWIDTH=300" >> .env
                                echo "OPENVIDU_WEBHOOK=false" >> .env
                                echo "OPENVIDU_WEBHOOK_EVENTS=[sessionCreated,sessionDestroyed,participantJoined,participantLeft,webrtcConnectionCreated,webrtcConnectionDestroyed,recordingStatusChanged,filterEventDispatched,mediaNodeStatusChanged,nodeCrashed,nodeRecovered,broadcastStarted,broadcastStopped]" >> .env
                                echo "OPENVIDU_SESSIONS_GARBAGE_INTERVAL=900" >> .env
                                echo "OPENVIDU_SESSIONS_GARBAGE_THRESHOLD=3600" >> .env
                                echo "OPENVIDU_CDR=false" >> .env
                                echo "OPENVIDU_CDR_PATH=/opt/openvidu/cdr" >> .env
                                echo "MYSQL_ROOT_PASSWORD=${DB_ROOT_PASS}" >> .env
                                echo "MYSQL_DATABASE=Shoppy_DB" >> .env
                                echo "MYSQL_USER=${DB_USER}" >> .env
                                echo "MYSQL_PASSWORD=${DB_PASS}" >> .env
                                echo "SERVER_SSL_KEY_STORE=/opt/openvidu/owncert/keystore.p12" >> .env
                                echo "SERVER_SSL_KEY_STORE_PASSWORD=changeit" >> .env
                                echo "SERVER_SSL_KEY_STORE_TYPE=PKCS12" >> .env
                                echo "SERVER_SSL_KEY_ALIAS=tomcat" >> .env
                            """
                            sh 'docker compose up -d --no-build'
                        }
                    }
                }
            }
        }
        
        stage('Clean up Image') {
             steps {
                script {
                    // 사용하지 않는 이미지(Dangling images) 삭제
                    sh 'docker image prune -f'
                }
             }
        }

        post {
            always {
                // BE 폴더에 들어가서 .env 삭제
                dir('SHOPPY-BE') { 
                    script {
                        sh "rm -f .env"
                        echo "🧹 Backend .env file deleted."
                    }
                }
            }
            success {
                echo "🎉 모든 배포가 성공적으로 완료되었습니다!"
            }
            failure {
                echo "💥 배포 중 오류가 발생했습니다."
            }
        }
    }
}