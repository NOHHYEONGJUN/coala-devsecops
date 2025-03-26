// Jenkins 파이프라인의 시작을 선언합니다.
pipeline {
    // Kubernetes 에이전트를 설정합니다.
    agent {
        kubernetes {
            // 'kaniko-agent' 라벨을 가진 Pod을 생성합니다.
            label 'kaniko-agent'
            // 기본 컨테이너를 'kaniko'로 지정합니다.
            defaultContainer 'kaniko'
        }
    }

    // 파이프라인에서 사용할 환경 변수들을 정의합니다.
    environment {
        // Harbor 레지스트리 관련 설정입니다.
        REGISTRY = 'harbor.jbnu.ac.kr'
        HARBOR_PROJECT = '<사용자 이름>'
        IMAGE_NAME = '<이미지 이름>'
        TAG = "v${BUILD_NUMBER}"
        DOCKER_IMAGE = "${REGISTRY}/${HARBOR_PROJECT}/${IMAGE_NAME}"
        DOCKER_CREDENTIALS_ID = 'harbor-credentials'
        SONAR_TOKEN = credentials("sonarqube-credentials")
        HARBOR_CREDENTIALS = credentials("${DOCKER_CREDENTIALS_ID}")
    }

    // 파이프라인의 각 단계를 정의합니다.
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // SonarQube를 사용하여 코드 품질을 분석하는 단계입니다.
        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    withSonarQubeEnv('sonarqube') {
                        // SonarQube 분석 실행 (Dockerfile 분석 포함)
                        sh """
                            sonar-scanner \\
                            -Dsonar.projectKey=${HARBOR_PROJECT}-${IMAGE_NAME} \\
                            -Dsonar.projectName=${HARBOR_PROJECT}-${IMAGE_NAME} \\
                            -Dsonar.sources=. \\
                            -Dsonar.exclusions=**/node_modules/**,**/Dockerfile.vulnerable \\
                            -Dsonar.docker.file.path=Dockerfile \\
                            -Dsonar.docker.activate=true \\
                            -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
                }
            }
        }

        // SonarQube Quality Gate 확인
        stage('Quality Gate') {
            steps {
                container('sonar-scanner') {
                    withSonarQubeEnv('sonarqube') {
                        timeout(time: 5, unit: 'MINUTES') {
                            script {
                                try {
                                    def qg = waitForQualityGate(abortPipeline: false)
                                    echo "Quality Gate 상태: ${qg.status}"
                                    if (qg.status != 'OK') {
                                        error "Quality Gate 실패: ${qg.status}"
                                    } else {
                                        echo "✅ Quality Gate 통과!"
                                    }
                                } catch (Exception e) {
                                    echo "❌ Quality Gate 검사 중 오류 발생: ${e.message}"
                                    throw e 
                                }
                            }
                        }
                    }
                }
            }
        }

        // Docker 설정 파일을 생성합니다.
        stage('Create Docker Config') {
            steps {
                script {
                    // Kaniko가 사용할 Docker 설정 파일을 생성합니다.
                    sh """
                        mkdir -p /kaniko/.docker
                        echo '{"auths":{"${REGISTRY}":{"username":"${HARBOR_CREDENTIALS_USR}","password":"${HARBOR_CREDENTIALS_PSW}"}}}' > /kaniko/.docker/config.json
                    """
                }
            }
        }

        // Kaniko를 사용하여 도커 이미지를 빌드하고 푸시하는 단계입니다.
        stage('Build and Push with Kaniko') {
            steps {
                container('kaniko') {
                    sh """
                        /kaniko/executor \\
                        --context=\$(pwd) \\
                        --destination=${DOCKER_IMAGE}:${TAG} \\
                        --cleanup
                    """
                }
            }
        }

        // 배포 단계입니다.
        stage('Deploy') {
            steps {
                echo "이미지가 성공적으로 빌드되어 배포 준비가 되었습니다: ${DOCKER_IMAGE}:${TAG}"

                container('ssh') {
                    sh """
                        apk update && apk add openssh bash openssh-client
                    """

                    sshagent (credentials: ['jcloud-ssh']) {
                        sh """
                            ssh -o StrictHostKeyChecking=no -p <Port 번호> ubuntu@113.198.66.75 <<EOF
                                echo "✅ 기존 컨테이너 중지 및 삭제..."
                                docker stop react-web || true
                                docker rm react-web || true

                                echo "📥 Harbor 로그인 및 최신 이미지 Pull..."
                                docker login ${REGISTRY} -u ${HARBOR_CREDENTIALS_USR} -p ${HARBOR_CREDENTIALS_PSW}
                                docker pull ${DOCKER_IMAGE}:${TAG}

                                echo "🚀 새 컨테이너 실행..."
                                docker run -d --name react-web -p 8080:8080 ${DOCKER_IMAGE}:${TAG}
EOF
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo '성공적으로 빌드 및 배포되었습니다!'
        }
        failure {
            echo '빌드 또는 배포 실패'
        }
        always {
            deleteDir()
            echo "파드 리소스 정리 중"
        }
    }
}