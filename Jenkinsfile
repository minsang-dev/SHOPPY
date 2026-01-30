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
                    branch 'release'
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
                    branch 'release'
                }
            }
            steps {
                dir('SHOPPY-FE') {
                    sh '''
                        echo "VITE_API_BASE_URL=https://i14c209.p.ssafy.io/api" > .env
                        echo "VITE_WEBSOCKET_URL=https://i14c209.p.ssafy.io/api/ws" >> .env
                        echo "VITE_REALTIME_ENABLED=true" >> .env
                        echo "VITE_KAKAO_JS_KEY=924e1ada162135f28e439c12268347cb" >> .env
                        echo "VITE_KAKAO_REST_KEY=fcaef89fee2a672b719a292edcdb9b66" >> .env
                    '''
                    sh 'docker build -t shoppy-fe:latest .'
                }
            }
        }
    
        stage('Deploy') {
            steps {
                script {
                    // 1. Frontend 배포
                    if (env.BRANCH_NAME == 'FE' || env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'buildtest' || env.BRANCH_NAME == 'release') {
                        echo 'Deploying Frontend...'
                        sh 'docker stop shoppy-fe || true'
                        sh 'docker rm shoppy-fe || true'
                        sh 'docker run -d --name shoppy-fe -p 3000:3000 --restart always shoppy-fe:latest'
                    }

                    // 2. Backend & OpenVidu 배포
                    if (env.BRANCH_NAME == 'BE' || env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'buildtest' || env.BRANCH_NAME == 'release') {
                        echo 'Deploying Backend & OpenVidu...'
                        dir('SHOPPY-BE') {
                            sh '''
                                echo "DOMAIN_OR_PUBLIC_IP=i14c209.p.ssafy.io:8989" > .env
                                echo "OPENVIDU_SECRET=MySuperSecretPasswordC209" >> .env
                                echo "CERTIFICATE_TYPE=selfsigned" >> .env
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
                                echo "MYSQL_ROOT_PASSWORD=root" >> .env
                                echo "MYSQL_DATABASE=shoppy" >> .env
                                echo "MYSQL_USER=shoppyuser" >> .env
                                echo "MYSQL_PASSWORD=shoppypass" >> .env
                                echo "KAKAO_CLIENT_ID=fcaef89fee2a672b719a292edcdb9b66" >> .env
                                echo "KAKAO_REDIRECT_URI=https://i14c209.p.ssafy.io/auth/kakao/callback" >> .env
                                echo "JWT_SECRET=OGU4MjRhNzFmMTQ4YjM3NDFmYTliNTU0NTI5YWE5ZTMwZmIzY2NiMzNmZDg0ZGNiMTc4MmNmYzliZmRlMGJlYw==" >> .env
                                echo "JWT_ACCESS_EXP=3600000" >> .env
                                echo "JWT_REFRESH_EXP=604800000" >> .env
                                echo "CORS_ALLOWED_ORIGINS=https://i14c209.p.ssafy.io,http://localhost:5173" >> .env
                            '''
                            sh 'docker compose up -d --no-build'
                        }
                    }
                }
            }
        }
    }
}
