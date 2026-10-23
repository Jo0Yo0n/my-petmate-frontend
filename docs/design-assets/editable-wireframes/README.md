# 화면 원본 — 와이어프레임과 Sunshine

전체 화면의 동작·구성 기준은 **HTML/CSS 와이어프레임**, 적용할 시각 기준은 **[Sunshine 디자인 규칙](../../ui-foundation.md)**이다. PNG는 원본이 아니며 과거 시안·생성 캡처·PNG 기반 보드는 삭제했다.

## 진입점과 적용 범위

| 진입점 | 범위 |
|---|---|
| [index.html](index.html) | 전체 37개 화면·모달·상태의 와이어프레임. 화면 선택기와 탐색 목록으로 이동 |
| [sunshine-board.html](sunshine-board.html) | Sunshine을 적용한 다섯 종류의 실제 HTML 미리보기 |
| [sunshine.html](sunshine.html) | Sunshine 독립 미리보기. 폭·큰 글씨·상태 선택 가능 |

**Sunshine 적용 완료 범위는 아래에 한정된다.**

| 화면 종류 | ID |
|---|---|
| 로그인 | AUTH-01 |
| 회원가입 | AUTH-02 |
| 추천 목록 | REC-01 |
| 추천 상세 | REC-03 |
| 채팅 | CHAT-01, CHAT-02: 같은 디자인의 대화 예시 두 개 |

반려견 등록·관리, 보호자 정보, 받은 관심·매칭, 선호 조건, 약속·평가·안전 등 다른 화면은 와이어프레임 단계다. Sunshine 진입점에서 이동할 때 공통 색상 일부가 상속되더라도 화면별 디자인 적용 완료를 뜻하지 않는다. 새로운 화면을 디자인할 때 현재 Sunshine 규칙을 재사용하며 기존 동작·정책은 [화면 정의](../../mvp-screen-map.md)를 따른다.

## 실행

저장소 루트에서 `python3 -m http.server 8765 --bind 127.0.0.1`을 실행하고 `http://127.0.0.1:8765/docs/design-assets/editable-wireframes/`를 연다. 서버가 이미 실행 중이면 재실행하지 않는다. 설치·배포·API 연결은 필요 없다.

- `index.html?screen=DOG-02`: 전체 와이어프레임 중 반려견 등록.
- `sunshine.html?screen=AUTH-02`: Sunshine 회원가입.
- `sunshine.html?screen=REC-03&width=320&font=large`: 좁은 화면·큰 글씨.
- `sunshine.html?screen=CHAT-02&state=chat-error`: 연결·전송 실패의 모의 상태.
- `sunshine.html?screen=AUTH-02&export=1`: 설계 도구를 숨긴 844px 프레임.
- `sunshine.html?screen=AUTH-02&export=1&capture=full`: 스크롤 내용을 펼친 보기.

## 수정할 파일

| 파일 | 책임 |
|---|---|
| [preview-shell.js](preview-shell.js) | 두 진입점의 공통 조작 패널·휴대폰 프레임·팝업 틀 |
| [screens.js](screens.js) | 화면 목록·ID·모의 반려견 데이터 |
| [app.js](app.js) | 전체 와이어프레임 HTML 템플릿·화면 이동·상태·모의 동작 |
| [tokens.css](tokens.css), [styles.css](styles.css), [design.css](design.css) | 두 진입점이 사용하는 기반 변수·배치·폼·모달 스타일. 현재 실행 의존성이므로 유지 |
| [sunshine.js](sunshine.js) | 위 다섯 종류에 한정한 HTML 템플릿·시각 후처리 |
| [sunshine.css](sunshine.css) | 현재 Sunshine 팔레트·컴포넌트·화면별 스타일 |
| [sunshine-board.html](sunshine-board.html), [sunshine-board.css](sunshine-board.css) | Sunshine 다섯 종류를 실제 HTML iframe으로 보여주는 보드 |

두 HTML은 진입점 설정과 의존 파일만 선언하고, 공통 HTML 틀은 `preview-shell.js`에서 한 번만 관리한다. 화면 상태 선택기는 해당 화면에서 지원하지 않는 항목을 비활성화한다. 필드 오류·제출 중은 폼, 연결·전송 실패는 채팅에서 확인한다.

Sunshine은 기반 CSS 위에 sunshine.css를 마지막으로 적용한다. 기반 파일의 코랄 기본값은 index.html에서 실제로 사용하므로 유지한다. Sunshine의 새 디자인 기준으로 사용하지 않는다. 참조 없는 변수·효력이 없는 이전 선언·사용하지 않는 선택자는 제거하며, 현재 화면이 의존하는 CSS 파일은 유지한다. 기능을 수정할 때 Sunshine 템플릿에 업무 규칙을 따로 복제하지 않는다.

## 유지할 에셋

- [assets/login-dog.png](assets/login-dog.png): 현재 화면에서 사용하는 독립 반려견 사진. 캡처 PNG가 아니므로 유지한다. [생성 출처](assets/generation.md).
- [assets/icons/](assets/icons/README.md): Phosphor regular SVG와 [MIT 라이선스](assets/icons/LICENSE).

새 화면을 만들 때마다 PNG를 생성·보관하지 않는다. 비교나 회귀 확인에 실제 필요한 경우에만 임시 캡처를 만들며, 원본을 대신하거나 전체 화면 캡처 세트를 상시 유지하지 않는다.

## 모의 동작과 검증 범위

HTML/CSS와 작은 JS로 만든 설계 자료이며 실제 RN 앱이 아니다. 입력·로그인·가입·관심·채팅·약속은 브라우저 메모리만 변경하고 새로고침하면 초기화된다. 실제 인증·토큰·사진 업로드·지오코딩·DB·서버 멱등성은 구현하지 않았다.

선호 조건은 선택 UI와 보호자 정보/지역의 모의 필터만 제공하며 실제 안전 제외·궁합 계산은 서버 책임이다. 두 채팅은 서로 다른 약속 이력을 가지며 약속 목록과 같은 모의 데이터를 사용한다. 지역 카탈로그는 서울/마포구 일부 예시다. 동일 사진을 모의 반려견 여러 마리에 재사용한다.

백엔드 범위는 [백엔드 계획](../../../../my-petmate-server/docs/backend-mvp-plan.md)과 [M1 체크리스트](../../../../my-petmate-server/docs/m1-auth-contract-checklist.md)를 따른다. 과거의 개별 서버 검증 기록을 추가 계약·프론트 통합 완료로 간주하지 않는다.

현재 유지하는 검증 요약과 정리 후 확인은 [verification.md](verification.md)에 기록한다. 삭제한 캡처를 현재 증거로 연결하지 않는다.
