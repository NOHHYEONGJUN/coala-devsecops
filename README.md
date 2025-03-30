# CI/CD 보안 실습용 리액트 프로젝트

Jenkins, GitLab, SonarQube, Harbor, OpenStack, Grafana를 사용한 <br/>
CI/CD 파이프라인에서 보안 취약점 감지 및 품질 관리를 실습하기 위한 예제 애플리케이션입니다.

## 프로젝트 구성

- ~~React 애플리케이션: 의도적으로 보안 취약점이 포함된 간단한 사용자 등록/관리 웹 앱~~
- **취약한 Dockerfile**: 보안 모범 사례를 따르지 않는 예시
- **보안 강화 Dockerfile**: 보안 모범 사례를 적용한 예시
- **Nginx 설정**: 보안 헤더가 강화된 웹 서버 설정
- **SonarQube 설정**: 코드 품질 및 보안 분석을 위한 설정

## 의도적으로 포함된 취약점

### 취약한 Dockerfile의 문제점
1. **오래된 베이스 이미지**: 보안 패치가 적용되지 않은 Node.js 버전
2. **Root 권한 사용**: 컨테이너가 root로 실행됨
3. **불필요한 패키지 설치**: 공격 표면 증가
4. **민감한 정보 노출**: 환경 변수에 비밀 포함
5. **불필요한 포트 노출**: 필요 이상의 포트 개방

## 실습 시나리오

이 프로젝트는 다음 실습 시나리오를 지원합니다:

1. **SonarQube 코드 품질 분석**:
   - 소스 코드의 취약점 및 코드 악취(code smell) 식별
   - Dockerfile 보안 분석 및 문제점 확인
   - Quality Gate 설정에 따른 파이프라인 실패/성공 확인

2. **도커 이미지 보안 강화**:
   - 취약한 Dockerfile에서 보안 강화 Dockerfile로 전환
   - 멀티 스테이지 빌드, 최소 권한 원칙 적용 방법 학습
   - 민감한 정보 관리 방법 학습

3. **보안 개선 및 배포**:
   - 코드 품질 및 보안 취약점 수정
   - 파이프라인 통과 후 성공적인 배포 확인

## 시작하기

1. 이 프로젝트를 GitLab 저장소에 복제합니다.
2. Jenkins 파이프라인을 설정합니다.
3. 취약한 Dockerfile로 빌드를 시도하고 SonarQube 분석 결과를 확인합니다.
4. 문제점을 수정하고 보안 강화 Dockerfile로 전환합니다.
5. 파이프라인이 성공적으로 완료되고 애플리케이션이 배포되는지 확인합니다.

## 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker 보안 모범 사례](https://docs.docker.com/develop/security-best-practices/)
- [SonarQube 문서](https://docs.sonarqube.org/latest/)
- [React 보안 모범 사례](https://reactjs.org/docs/security.html)