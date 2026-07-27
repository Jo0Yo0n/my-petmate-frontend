# My Petmate iOS 프론트엔드 MVP 계획

## 요약

- `my-petmate-frontend`에 Expo SDK 57, React Native, TypeScript, Expo Router 기반의 iPhone 전용 MVP를 구축한다.
- 개발 순서는 `백엔드 M1 → 프론트 F1 → 백엔드 M2 → 프론트 F2`처럼 기능별로 교차한다. 날짜 대신 완료 조건을 사용한다.
- UI는 `@expo/ui/swift-ui`를 중심으로 최대한 iOS 네이티브처럼 구성하고, 따뜻한 코랄 포인트와 큰 반려견 사진을 사용한다.
- 한국어·한국 지역 사용자와 TestFlight 베타 배포까지만 범위에 포함한다.
- 모든 production code는 인간 개발자가 작성한다. AI는 계획, 설명, 코드 리뷰, 오류 분석, 명시적으로 요청된 작은 예제만 제공한다.

## 프로젝트 기반과 화면 구조

- 프론트 저장소에 `AGENTS.md`, `docs/development-conventions.md`, `docs/frontend-mvp-plan.md`, `docs/ui-foundation.md`를 먼저 작성한다.
- Node.js LTS와 npm을 사용하고 TypeScript strict mode, ESLint, Prettier, Jest를 기본 검증으로 둔다.
- Expo Router의 인증 보호 경로를 사용한다. SDK 57 개발 빌드는 Linux에서 EAS로 생성하여 실제 iPhone에서 실행한다. [Expo 프로젝트 생성](https://docs.expo.dev/get-started/create-a-project/), [Expo Router 인증](https://docs.expo.dev/router/advanced/authentication/)
- 앱 구조는 인증 화면과 세 개의 탭으로 고정한다.
  - 인증: 회원가입, 로그인
  - 추천: 선택된 반려견의 추천 목록과 상세
  - 매칭: 매칭 목록, 채팅, 약속
  - 내 반려견: 목록, 등록, 상세, 수정, 보호자 정보 공개 설정·로그아웃
- 서버 상태는 TanStack Query, 긴 프로필 폼은 React Hook Form과 Zod, 인증과 선택된 반려견은 작은 React Context로 관리한다. Redux·Zustand·범용 repository 계층은 도입하지 않는다.
- refresh token은 SecureStore에, access token은 메모리에만 둔다. 앱 재시작 시 refresh 후 사용자 정보를 복원하며 refresh 실패 시 로그인 화면으로 이동한다. [Expo SecureStore](https://docs.expo.dev/develop/user-interface/store-data/)
- `@expo/ui/swift-ui`의 Form, List, Button, SecureField, DatePicker, BottomSheet 등을 우선 사용한다. 반려견 카드처럼 서비스 고유 표현만 React Native 레이아웃으로 만든다. [Expo UI SwiftUI](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/)
- 시스템 글꼴과 Dynamic Type, Safe Area, 다크 모드를 지원한다. 기본 포인트 색상은 밝은 모드 `#E66A5C`, 어두운 모드 `#FF8A7A`로 두고 시스템 배경색을 유지한다.

## 백엔드·프론트 인터페이스 보완

- 백엔드 M1부터 OpenAPI 문서를 API 계약의 원본으로 관리한다. 프론트는 `openapi-typescript`로 타입만 생성하고, 인증 갱신과 오류 처리가 포함된 작은 fetch 클라이언트는 직접 작성한다.
- 공통 REST 오류는 RFC 9457 `ProblemDetail`과 `application/problem+json`을 사용한다. 표준 필드 `type`, `title`, `status`, `detail`, `instance`와 앱 확장 필드 `code`, 선택적인 `fieldErrors`, `requestId`를 파싱한다.
- 앱은 HTTP status로 큰 오류 범주를 판단하고 안정적인 `code`로 refresh, 로그인 복귀, 채팅 이탈, 공개 설정 안내 등 구체적인 동작을 결정한다. 사용자 메시지는 `detail`, 폼 오류는 `fieldErrors`, 문의 추적은 `requestId`를 사용한다.
- 모든 화면은 로딩, 빈 결과, 재시도 가능한 오류, 인증 만료 상태를 구분한다.
- M1에 `GET/PATCH /api/guardians/me`를 추가한다. 로그인·refresh 응답, 개인/커플/가족 유형, 개인 계정에서 여성·남성만 허용하는 성별, 공개 여부, 토큰 회전 여부와 만료 규칙을 OpenAPI에 명시한다. 동시에 발생한 401은 refresh를 한 번만 실행하고 원 요청을 한 번만 재시도한다.
- M2의 반려견 생성·수정은 `profile` JSON과 `photo` 파일을 받는 multipart 계약으로 확정한다.
  - `breed`는 서버 제공 목록에서 하나를 선택하고 `mixed_breed`를 `믹스견`으로 표시한다. 별도 믹스견 boolean이나 토글은 사용하지 않는다.
  - 나이는 만 나이 정수 `age`로 통일하고 0~30을 허용하며 1살 미만은 0으로 입력한다.
  - 앱은 사진첩 이미지를 정사각형으로 편집하고 최대 2048px JPEG, 품질 0.8로 변환한다.
  - 백엔드는 AWS S3 비공개 버킷에 저장하고 응답에는 만료되는 조회 URL을 제공한다.
  - 업로드·DB 저장 실패 시 객체 정리와 권한 정책을 별도 security/persistence 리뷰 대상으로 둔다.
- 활동 지역은 사용자가 한국어 구·동 또는 도로명을 입력하고 `expo-location`의 iOS `geocodeAsync`로 좌표를 얻은 뒤, 역지오코딩된 지역명을 확인하여 선택한다.
  - 현재 위치 권한, 지도, 자동완성은 사용하지 않는다.
  - 결과가 없거나 모호하면 더 구체적인 주소를 다시 입력받는다.
  - 백엔드는 좌표를 약 1km 수준인 위·경도 소수점 둘째 자리로 낮춰 저장하고 원본 좌표는 보존하지 않는다.
  - 다른 사용자에게는 지역명과 근사 거리만 반환한다. [Expo 지오코딩 API](https://docs.expo.dev/versions/latest/sdk/location/)
- M3 추천 요청은 크기, 산책 강도, 사회성, 가능 요일, 최대 근사 거리, 공개 보호자 정보의 선택적 query를 지원한다. 공개 요청자는 공개 후보만 추천받고 보호자 정보 필터를 사용할 수 있다. 비공개 요청자는 공개·비공개 후보를 모두 받을 수 있지만 모든 보호자 정보가 마스킹되며 해당 필터는 비활성화된다. 필터는 현재 추천 세션에 적용하며 안전 제외를 완화하지 않는다.
- M4에 `POST /api/matches/{matchId}/close`를 추가한다. 매칭 성사 시트와 매칭 목록에서는 별도 상세 화면 없이 채팅으로 바로 이동하고, 채팅 헤더는 `GET /api/matches/{matchId}`로 간단한 정보를 보여준다.
- M5 WebSocket은 `/ws`의 JSON 프로토콜을 OpenAPI 인접 문서에 정의한다.
  - 연결 직후 access token으로 인증하고 성공 응답 전에는 메시지를 보내지 않는다.
  - 텍스트 전송에는 `matchId`, `clientMessageId`, `body`를 포함한다.
  - 서버는 저장 완료된 메시지와 오류를 명시적인 event type으로 반환한다.
  - 만료·연결 해제 시 refresh 후 재연결하고 REST 메시지 내역을 다시 조회한다.
  - 메시지 내역은 `before` cursor와 `limit`을 사용하는 역방향 페이지네이션으로 고정한다.
- `GET /api/matches`는 최근 메시지와 읽지 않은 수를 제공하고, 채팅 진입 시 `POST /api/matches/{matchId}/read`로 마지막 읽은 메시지를 갱신한다.
- 약속 생성·상태 변경 및 차단은 해당 채팅의 Query 캐시와 WebSocket 상태를 즉시 무효화한다. 차단된 매칭의 채팅 입력은 바로 닫는다.
- 신고는 서버가 허용한 `reason` enum을 선택하고 선택적인 최대 1000자 `comment`를 받는다. 사용자는 severity를 선택하지 않는다.
- 수락된 약속의 종료 시각이 지나면 채팅 카드의 `reviewEligible` 상태로 평가 진입을 노출한다. 평가는 1~5점과 선택적인 태그·의견을 받되 상대 화면에는 공개하지 않는다.
- `docs/backend-mvp-plan.md`는 날짜 대신 완료 조건 기반 순서를 사용하고 한 번에 하나의 백엔드 마일스톤만 진행 중으로 둔다. M1은 OpenAPI·ProblemDetail 공통 오류·`/me`, M2는 S3 사진·근사 좌표 저장 정책을 포함한다.

## 프론트 마일스톤

| 단계 | 대응 백엔드 | 구현 및 완료 조건 |
| --- | --- | --- |
| F0. 기반과 UI 원칙 | M0 | SDK 57/EAS 개발 빌드가 iPhone에서 실행되고, 인증 경로·탭 셸·테마·API 환경 설정·기본 테스트가 동작한다. 주요 화면의 저해상도 와이어프레임과 공통 로딩·빈 화면·오류 표현을 확정한다. |
| F1. 인증 | M1 | 개인/커플/가족 유형과 공개 여부가 포함된 회원가입, 로그인, 앱 시작 시 세션 복원, 제한된 보호자 정보 설정, 자동 refresh, 로그아웃, 보호 경로가 실제 API와 연결된다. |
| F2. 반려견 프로필 | M2 | 다견 목록과 선택 기능, 등록·조회·수정, 사진 업로드, 주소 지오코딩을 완성한다. 등록은 기본 정보, 건강·신체, 성향·궁합, 지역·시간·소개의 4단계 폼으로 구성하고 로컬 임시 저장을 지원한다. |
| F3. 추천 | M3 | 선택된 반려견 기준 추천 목록·상세와 선호 조건 시트를 제공한다. 등급, 사람이 읽을 수 있는 이유, 근사 거리·지역과 공개된 보호자 정보만 표시하며 정확한 좌표, 비공개 보호자 정보, 숫자 궁합 점수는 표시하지 않는다. |
| F4. Like와 Match | M4 | 추천 상세의 like/pass, 상호 like 결과 시트, 활성 매칭 목록, 매칭 종료를 구현한다. 결과 시트와 목록에서는 채팅으로 바로 이동하며 별도 매칭 상세 화면은 만들지 않는다. 중복 탭 동안 버튼을 비활성화하고 서버 결과를 최종 상태로 사용한다. |
| F5. 채팅 | M5 | cursor REST 내역 조회, 최근 메시지·읽지 않은 수, 읽음 위치 갱신, 멱등 WebSocket 텍스트 송수신, 전송 중·실패·재시도, 재연결과 권한 오류를 처리한다. 푸시 알림과 오프라인 메시지 큐는 제외한다. |
| F6. 약속과 평가 | M6 | 채팅 내 약속 카드, SwiftUI DatePicker 기반 제안 시트, 수락·거절·사유가 필요한 취소, 종료된 약속의 비공개 상대 평가 흐름을 구현한다. |
| F7. 안전 | M7 | 매칭·채팅 메뉴에서 차단과 신고를 제공하고 확인 시트, 신고 사유, 제한 계정 안내, 차단 후 화면 이탈을 구현한다. |
| F8. 베타 안정화 | M1~M7 | 두 테스트 계정의 전체 핵심 흐름, 접근성, 다크 모드, 느린 네트워크, 앱 재시작을 검증하고 EAS production 빌드를 TestFlight 외부 베타에 배포한다. |

각 프론트 단계가 실제 API와 통합되고 자동 테스트 및 iPhone 수동 확인을 통과하기 전에는 다음 백엔드 단계로 넘어가지 않는다.

## 테스트와 인수 기준

- Jest, `jest-expo`, React Native Testing Library로 검증하며 snapshot보다 사용자 동작과 접근성 label 기반 테스트를 우선한다. [Expo 테스트 가이드](https://docs.expo.dev/develop/unit-testing/)
- 매 단계에서 `npm run lint`, `npm run typecheck`, `npm test`와 iPhone 수동 확인을 완료한다.
- 인증은 개인/커플/가족 조건부 입력, 개인 성별의 여성·남성 제한, 공개 여부 수정, 세션 복원, refresh 성공·실패, 동시 401, 로그아웃 후 보호 화면 차단을 검증한다.
- 프로필은 믹스견을 포함한 단일 견종 선택, `age` 0~30 validation, 4단계 validation, 임시 저장 복원, HEIC 입력의 JPEG 변환, 업로드 실패, 주소 검색 실패, 다른 소유자 접근 거부를 검증한다.
- 추천·매칭은 반려견 전환, 선호 query 조합, 공개 요청자의 공개 후보 제한, 비공개 요청자의 전체 마스킹과 필터 차단, 안전 제외 우선, 빈 목록, like/pass 중복 방지, 상호 like 전후, 채팅 직행, match close 상태를 검증한다.
- 채팅·약속은 재연결, 중복 `clientMessageId`, 전송 실패, 페이지네이션, 참여자 권한, 모든 약속 상태 전이, 종료 전 평가 차단, 보호자별 1회 평가를 검증한다.
- 안전 기능은 차단 후 추천·매칭·채팅 제거, 신고 reason enum과 선택 comment, severity 입력 부재, 제한 계정 안내를 검증한다.
- 공통 오류 처리는 `application/problem+json` 파싱, body status와 HTTP status 일치, code 기반 분기, fieldErrors 표시, requestId 보존을 검증한다.
- 별도 공기계는 필수가 아니다. 개발 중 두 번째 사용자는 PC의 API/WebSocket 테스트 클라이언트로 대체하고, F8에서 초대 테스터의 iPhone과 실제 양방향 채팅을 확인한다.
- TestFlight 완료 조건은 Apple Developer 계정, 앱 아이콘·스플래시, 사진 사용 설명, 개인정보 처리방침, 베타 심사 정보, 핵심 흐름 테스트 기록까지 준비된 상태다. App Store 공개 출시는 MVP 밖이다.

## 명시적 가정

- MVP는 iOS 전용이며 Android 구현·검증·배포는 후속 마일스톤이다.
- UI와 콘텐츠는 한국어만 제공하고 한국 주소만 입력받는다.
- 지도 탐색, 장소 자동완성, 현재 위치 권한, 실시간 위치, 푸시 알림, 소셜 로그인은 제외한다.
- 주소 지오코딩 품질이 한국 베타 테스트에서 부족하다고 확인될 때만 Kakao Local API 프록시를 후속 대안으로 검토한다.
- security, 인증, AWS S3, 위치 저장, WebSocket 권한 변경은 구현 전 인간 개발자의 명시적 리뷰를 거친다.
