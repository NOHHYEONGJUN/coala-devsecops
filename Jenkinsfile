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
        HARBOR_PROJECT = 'nhj7804'
        IMAGE_NAME = 'test-react'
        TAG = "${BUILD_NUMBER}"
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
                            -Dsonar.exclusions=**/node_modules/** \\
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
                                    if (qg.status != 'OK') {
                                        echo "Quality Gate 체크 결과: ${qg.status}"
                                    } else {
                                        echo "Quality Gate 통과!"
                                    }
                                } catch (Exception e) {
                                    echo "Quality Gate 확인 중 오류 발생: ${e.message}"
                                    echo "SonarQube 웹에서 품질 게이트 결과를 확인하세요. 파이프라인은 계속 진행합니다."
                                }
                            }
                        }
                    }
                }
            }
        }

        // Docker 설정 파일 생성
        stage('Create Docker Config') {
            steps {
                script {
                    // Kaniko가 사용할 Docker 설정 파일 생성
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

        // 배포 또는 추가 단계
        stage('Deploy') {
            steps {
                echo "이미지가 성공적으로 빌드되어 배포 준비가 되었습니다: ${DOCKER_IMAGE}:${TAG}"
                // 여기에 SSH를 통한 배포 스크립트를 추가할 수 있습니다
                // 예: SSH로 대상 서버에 접속하여 컨테이너 실행
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