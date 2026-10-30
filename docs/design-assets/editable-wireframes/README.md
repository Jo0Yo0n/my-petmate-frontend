# 화면 원본 — 와이어프레임과 Sunshine

화면 동작은 [화면 정의](../../screen-definition.md), 화면 구성은 **HTML/CSS 와이어프레임**, 시각
기준은 **[Sunshine 디자인 규칙](../../ui-foundation.md)**을 따른다.

HTML/CSS와 작은 JS로 만든 설계 자료이며 실제 RN 앱이 아니다.

## 진입점과 적용 범위

| 진입점                                    | 범위                                                     |
|-------------------------------------------|----------------------------------------------------------|
| [와이어프레임](index.html)                | 무채색으로 구조·기능·상태를 확인하는 보기                |
| [화면별 디자인 목차](sunshine-board.html) | 화면별 디자인 적용 여부·마일스톤·두 보기 링크와 미리보기 |
| [컴포넌트 목차](components.html)          | 공통 컴포넌트·변형과 F1 화면별 전체 상태 링크            |
| [디자인 미리보기](sunshine.html)          | Sunshine 시각 규칙으로 같은 기능·상태를 확인하는 보기    |

## 실행

저장소 루트에서 `python3 -m http.server 8765 --bind 127.0.0.1`을
실행하고 `http://127.0.0.1:8765/docs/design-assets/editable-wireframes/` 를 연다. 서버가 이미 실행 중이면 재실행하지 않는다. 설치·배포·API 연결은 필요 없다.
테스트는 `node --test tests/design-preview.test.cjs`로 실행한다.

## 파일별 역할

| 파일                                                                                                            | 책임                                                                                                 |
|-----------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| [preview-navigation.js](scripts/preview-navigation.js), [preview-navigation.css](styles/preview-navigation.css) | 네 페이지의 공통 헤더·이동 메뉴·현재 보기 표시                                                       |
| [wireframe.css](styles/wireframe.css)                                                                           | 공통 화면의 무채색 테마. 기능·상태 코드를 포함하지 않음                                              |
| [preview-shell.js](scripts/preview-shell.js)                                                                    | 와이어프레임과 디자인 미리보기의 공통 조작 패널·휴대폰 프레임·팝업 틀                                |
| [screens.js](scripts/screens.js)                                                                                | 화면 목록·ID·모의 반려견 데이터                                                                      |
| [app.js](scripts/app.js)                                                                                        | 전체 와이어프레임 HTML 템플릿·화면 이동·상태·모의 동작                                               |
| [tokens.css](styles/tokens.css), [styles.css](styles/styles.css), [design.css](styles/design.css)               | 와이어프레임과 디자인 미리보기가 사용하는 기반 변수·배치·폼·모달 스타일. 현재 실행 의존성이므로 유지 |
| [ui-components.js](scripts/ui-components.js)                                                                    | 필드·선택·안내·확인·사진 자리·약속 카드 공통 렌더러                                                  |
| [f1-states.js](scripts/f1-states.js), [f1-preview.js](scripts/f1-preview.js)                                    | F1 페이지별 상태 목록, 계정 화면과 상태 표현                                                         |
| [components.html](components.html), [components.js](scripts/components.js)                                      | 같은 렌더러로 구성한 컴포넌트·상태 목차                                                              |
| [sunshine.js](scripts/sunshine.js)                                                                              | 와이어프레임과 디자인 미리보기가 함께 사용하는 일부 화면 템플릿과 공통 배치                          |
| [sunshine.css](styles/sunshine.css)                                                                             | 현재 Sunshine 팔레트·컴포넌트·화면별 스타일                                                          |
| [sunshine-board.html](sunshine-board.html), [sunshine-board.css](styles/sunshine-board.css)                     | 화면별 마일스톤·디자인 적용 여부와 미리보기를 보여 주는 목차                                         |

## 활동 시간 표시 후보

[시간 표시 비교](activity-options.html)에서 알약형·한 줄 목록형·작은 카드형을 같은 예시로 비교한다. 비교 페이지의 삭제는 예시 안에서만 동작한다. 실제 시안은 B 한 줄 목록형을 사용한다.
요일·시간·삭제 버튼을 열로 정렬하고 삭제 버튼만 항목을 제거한다.

## 활동 정보와 추천 시안

회원가입·내 정보 수정에서 보호자의 주 활동 지역 1~3개와 요일별 시간을 설정하고 내 정보에서 확인한다. 반려견 등록에서는 소개·성향만 입력하며 지역·시간은 중복 입력하지 않는다. 추천 시안은 저장한 활동 정보로
시작하고 필터의 지역·시간 지정은 이번 조회에서만 대체한다. 초기화 후 적용하면 저장 정보로 돌아간다.

추천 조건의 화면 동작은 [화면 정의](../../screen-definition.md#c-추천과-관심), 서버 계약과 구현·검증 상태는 기존 담당 문서를 따른다. HTML의 저장·조회·추천은 모의 동작이며
새로고침하면 초기화된다. 좌표·거리 표시와 지도 장소 선택은 MVP에 포함하지 않는다.
