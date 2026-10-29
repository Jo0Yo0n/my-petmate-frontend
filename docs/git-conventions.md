# Git 규칙

이 문서는 프론트엔드 저장소의 커밋 메시지·단위·사전 확인과 브랜치명을 정한다.

## 커밋 규칙

### 메시지 형식

커밋 메시지는 영어 Conventional Commits 형식으로 작성한다. 기본 제목 형식은 백엔드와 동일하다.

```text
<type>: <short summary>
```

- type은 아래 목록에서 선택한다.
- summary는 `add`, `fix`, `prevent`, `update`, `remove`처럼 변경을 설명하는 동사로 시작하고 짧고 구체적으로 작성한다.
- `update files`, `fix bug`처럼 대상과 결과를 알 수 없는 제목은 피한다.
- 앱 생성·기기 검증·기능 완료를 실제 수행하지 않았다면 제목에서도 완료한 것처럼 표현하지 않는다.
- 이유나 제한을 남길 필요가 있으면 제목 다음에 빈 줄을 두고 영어 본문을 작성한다. 단순 변경에는 본문을 강제하지 않는다.

### 허용 type

| type       | 사용 기준                                 | 프론트 예시                                     |
|------------|-------------------------------------------|-------------------------------------------------|
| `feat`     | 사용자에게 제공하는 새 기능               | `feat: add email login`                         |
| `fix`      | 기존 동작의 오류 수정                     | `fix: prevent duplicate login submissions`      |
| `docs`     | 문서만 변경                               | `docs: detail F0 and F1 implementation tasks`   |
| `design`   | 목업·시안·디자인 에셋 변경                | `design: update interactive mockups and shared UI components` |
| `test`     | 테스트 추가·수정                          | `test: cover concurrent token refresh requests` |
| `refactor` | 사용자 동작을 유지하는 코드 구조 변경     | `refactor: simplify session cleanup`            |
| `chore`    | 다른 type에 해당하지 않는 저장소 유지보수 | `chore: ignore local Expo state`                |
| `build`    | 앱 생성·빌드 설정·의존성 변경             | `build: initialize Expo application`            |
| `ci`       | CI 워크플로 변경                          | `ci: run frontend checks on pull requests`      |

표의 예시는 메시지 작성 예이며 해당 기능·설정의 구현 완료를 뜻하지 않는다. 기능에 필요한 테스트·문서를 함께 변경했다면 주된 목적에 맞는 type을 사용한다. 테스트가 포함됐다는 이유만으로 `test`로 분류하지
않는다.

### 커밋 단위

- 한 커밋은 하나의 설명 가능한 목적을 담는다. 관련 구현·테스트·문서는 함께 포함할 수 있다.
- 서로 독립적인 기능·오류 수정·문서 정비는 나눈다. 파일마다 나누거나 구현과 필수 테스트를 기계적으로 분리하지 않는다.
- 구현 계획의 작은 단위와 커밋은 반드시 일대일일 필요가 없다. 변경을 이해하고 검증할 수 있는 범위로 나눈다.
- 의존성을 변경했다면 실제 패키지 설정과 해당 lockfile을 함께 반영한다. 생성 타입은 타입 생성 정책과 원본 계약에 맞춰 관리하고 임의로 고치지 않는다.
- 기존 사용자 변경을 보존한다. 요청 범위 밖 파일·삭제·포맷 변경을 섞지 않는다.
- 비밀번호·토큰·서명 인증서·개인키·비밀 환경 값·개인정보가 담긴 로그나 캡처를 포함하지 않는다.

### 커밋 전 확인

1. `git status --short`와 `git diff`로 변경 범위와 기존 변경을 확인한다. 새 파일은 내용도 별도로 확인한다.
2. 문서 변경이면 링크·앵커·기준 문서 일치·공백을 확인한다. 앱 변경이면 실제 구성된 검사 명령을 사용한다.
3. 포함할 파일이나 변경 구간만 선택해 stage한다. 기존 미커밋 변경이 있는 상태에서 전체 파일을 일괄 stage하지 않는다.
4. `git diff --cached`와 `git diff --cached --check`로 실제 커밋 대상·공백 오류·민감한 값의 포함 여부를 확인한다.
5. 변경 목적에 맞는 type과 제목을 작성한다. 검증 결과와 미실행 사유를 구분해 보고한다. PR을 작성할 때는 필요한 검증 결과를 포함한다.

AI는 사용자가 커밋을 요청한 경우에만 커밋한다. 문서 작성·코드 수정 요청을 커밋·push·PR 생성 요청으로 해석하지 않는다. 커밋 권한이 push나 PR 생성까지 자동으로 포함하지 않는다.

## 브랜치명 규칙

브랜치명만 보고 작업 종류·프론트 단계·작업 내용을 확인할 수 있게 한다. 새 작업 브랜치는 다음 형식을 사용한다.
하나의 브랜치는 하나의 설명 가능한 작업 범위를 담는다. 서로 독립적인 작업을 이름에 나열해 묶지 않는다.

```text
<type>/<stage>-<short-kebab-summary>
```

### 구성

- `type`: [커밋 규칙의 허용 type](#허용-type) 중 주된 작업 목적에 맞는 값을 사용한다.
- `stage`: [MVP 계획](frontend-mvp-plan.md)의 작업 대상 단계인 `f0`~`f8`을 소문자로 쓴다. 현재 합의 범위인 F0→F1에 공통으로 걸치는 작업은 `f0-f1`을 사용한다.
- `short-kebab-summary`: 영어 소문자·숫자·하이픈으로 구체적인 작업을 짧게 표현한다. `work`, `update`, `misc`처럼 대상이 드러나지 않는 이름은 피한다.

단계는 브랜치를 만드는 시점의 전체 진행률이 아니라 해당 변경이 속한 위치다. 작은 구현 단위 번호는 계획 세분화에 따라 바뀔 수 있으므로 필수로 넣지 않고, 작업 이름으로 구분한다.

### 예시

| 작업                        | 브랜치명                          |
|-----------------------------|-----------------------------------|
| F0·F1 공통 Git 규칙 정비    | `docs/f0-f1-git-conventions`      |
| F0·F1 구현 계획 상세화      | `docs/f0-f1-implementation-plan`  |
| F0 첫 Expo 앱 생성          | `build/f0-expo-setup`             |
| F0 로그인·가입 화면 이동    | `feat/f0-auth-navigation`         |
| F0 API 오류 파서            | `feat/f0-api-error-parser`        |
| F1 로그인·로그아웃          | `feat/f1-login-logout`            |
| F1 세션 복원                | `feat/f1-session-restore`         |
| F1 동시 토큰 갱신 오류 수정 | `fix/f1-concurrent-token-refresh` |
| F1 인증 통합 테스트         | `test/f1-auth-integration`        |
