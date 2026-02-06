pipeline {
    agent any

    // 등록한 모든 Credentials를 환경 변수로 매핑
    environment {
        DB_ROOT_PASS = credentials('SHOPPY_MYSQL_ROOT_PASS')
        DB_PASS      = credentials('SHOPPY_MYSQL_PASS')
        DB_USER      = credentials('SHOPPY_MYSQL_USER')
        DB_HOST      = credentials('SHOPPY_MYSQL_HOST')
        DB_PORT      = credentials('SHOPPY_MYSQL_PORT')
        OV_SECRET    = credentials('SHOPPY_OV_SECRET')
        KAKAO_JS     = credentials('KAKAO_JS_KEY')
        KAKAO_REST   = credentials('KAKAO_REST_KEY')
        JWT_SECRET   =  credentials('JWT_SECRET')
        JWT_ACCESS_EXP = credentials('JWT_ACCESS_EXP')
        JWT_REFRESH_EXP = credentials('JWT_REFRESH_EXP')
        AWS_ACCESS_KEY = credentials('AWS_ACCESS_KEY')
        AWS_SECRET_KEY = credentials('AWS_SECRET_KEY')
        AWS_S3_BUCKET     = credentials('AWS_S3_BUCKET')
        GMS_API_KEY = credentials('GMS_API_KEY')
        KAKAO_CLIENT_ID = credentials('KAKAO_CLIENT_ID')
        KAKAO_REDIRECT_URI = credentials('KAKAO_REDIRECT_URI')
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
                        --build-arg VITE_API_BASE_URL=https://i14c209.p.ssafy.io \
                        --build-arg VITE_WEBSOCKET_URL=https://i14c209.p.ssafy.io/api/ws \
                        --build-arg VITE_WEBRTC_SIGNALING_URL=https://i14c209.p.ssafy.io/api/ws \
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
            if (env.BRANCH_NAME == 'release') {

                echo 'Deploying Frontend...'
                sh 'docker stop shoppy-fe || true'
                sh 'docker rm -f shoppy-fe || true'
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
                        echo "JWT_SECRET=${JWT_SECRET}" >> .env
                        echo "JWT_ACCESS_EXP=${JWT_ACCESS_EXP}" >> .env
                        echo "JWT_REFRESH_EXP=${JWT_REFRESH_EXP}" >> .env
                        echo "JPA_DDL_AUTO=update" >> .env
                        echo "JPA_SHOW_SQL=false" >> .env
                        echo "AWS_ACCESS_KEY=REDACTED" >> .env
                        echo "AWS_SECRET_KEY=REDACTED" >> .env
                        echo "AWS_S3_BUCKET=${AWS_S3_BUCKET}" >> .env
                        echo "GMS_API_KEY=${GMS_API_KEY}" >> .env
                        echo "KAKAO_CLIENT_ID=${KAKAO_CLIENT_ID}" >> .env
                        echo "KAKAO_REDIRECT_URI=${KAKAO_REDIRECT_URI}" >> .env
                        echo "DB_HOST=${DB_HOST}" >> .env
                        echo "DB_PORT=${DB_PORT}" >> .env
                        echo "CORS_ALLOWED_ORIGINS=https://i14c209.p.ssafy.io" >> .env
                    """
                    sh 'docker compose up -d --no-build'
                }
            } else {
                echo "Skip deploy: BRANCH_NAME=${env.BRANCH_NAME}"
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
    }
    post {
            always {
                // BE 폴더에 들어가서 .env 삭제
                // test
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