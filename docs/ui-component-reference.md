# 시안 컴포넌트와 목차의 화면별 공유 구성

현재 HTML 시안의 [컴포넌트 목차](design-assets/editable-wireframes/components.html#screen-components)에 등록된 구성과 화면 연결이다.
ID는 목차의 기존 ID와 같다. 화면별 표는 목차가 수동으로 정리한 주요 구성으로, 공통 헤더 등 코드의 모든 사용 관계를 나열하지 않는다.

## 컴포넌트 목록

| ID                           | 컴포넌트                      |
|------------------------------|-------------------------------|
| `fields`                     | 입력 필드                     |
| `buttons`                    | 행동 버튼                     |
| `choices`                    | 선택 타일                     |
| `feedback`                   | 상태 안내                     |
| `confirm`                    | 확인 대화상자                 |
| `appointments`               | 약속 카드                     |
| `unit-approved-schedule`     | 산책 조건 · 승인한 폼         |
| `unit-schedule-states`       | 시간·요일·강도 상태           |
| `unit-headings`              | 제목·섹션 제목                |
| `unit-navigation`            | 상단 헤더·하단 탭             |
| `unit-facts`                 | 정보 목록·반려견 정보         |
| `unit-guardian`              | 보호자 요약·사진              |
| `unit-input-composition`     | 폼·선택 입력·여러 줄 입력     |
| `unit-choice-groups`         | 다중 선택·화면 내부 이동·분류 |
| `unit-lists`                 | 사진 목록 행·기준 반려견 선택 |
| `unit-candidate`             | 추천 카드                     |
| `unit-chat-units`            | 말풍선·실패 안내·입력 영역    |
| `unit-actions-badges`        | 배지·버튼 묶음·아이콘 버튼    |
| `unit-registration-progress` | 등록 진행 단계                |
| `unit-regions`               | 지역 선택·선택된 동           |
| `unit-rating`                | 비공개 만남 평가 입력         |
| `unit-sheets`                | 제안·평가 시트                |
| `unit-compact-cards`         | 반려견·대화·관심 카드         |
| `unit-dog-registration`      | 반려견 등록 · 기본·건강       |
| `unit-profile-composition`   | 반려견 상세 구성              |
| `unit-preferences`           | 선호 조건 폼                  |
| `unit-result-notices`        | 완료·매칭·쉬는 중 안내        |
| `unit-action-menu`           | 설정·안전 메뉴                |
| `unit-chat-context`          | 대화 상대·연결 안내           |

## 화면별 주요 공유 구성

| 단계 | 화면                         | 컴포넌트 ID                                                                      |
|------|------------------------------|----------------------------------------------------------------------------------|
| F1   | 로그인                       | `fields` · `unit-input-composition` · `unit-headings`                            |
| F1   | 회원가입                     | `fields` · `choices` · `unit-input-composition` · `unit-headings` · `unit-regions` · `unit-schedule-states`                |
| F1   | 세션 복원 스피너 (공통 상태) | `feedback`                                                                       |
| F1   | 로그아웃 확인                | `confirm`                                                                        |
| F2   | 등록된 반려견 없음           | `unit-result-notices`                                                            |
| F2   | 내 반려견                    | `unit-compact-cards` · `buttons`                                                 |
| F2   | 반려견 등록 · 기본           | `unit-dog-registration` · `unit-registration-progress`                           |
| F2   | 반려견 등록 · 건강           | `unit-dog-registration` · `unit-registration-progress`                           |
| F2   | 반려견 등록 · 성향           | `unit-schedule-states` · `unit-input-composition` · `unit-registration-progress` |
| F2   | 반려견 등록 · 소개           | `unit-input-composition` · `unit-registration-progress` |
| F2   | 내 반려견 상세               | `unit-profile-composition` · `unit-facts`                                        |
| F1   | 내 정보                      | `unit-profile-composition` · `unit-facts` · `unit-actions-badges`                |
| F1   | 내 정보 수정                 | `fields` · `choices` · `unit-input-composition` · `unit-regions` · `unit-schedule-states`                                  |
| F1   | 탈퇴 확인                    | `confirm`                                                                        |
| F3   | 산책 메이트 찾기             | `unit-lists` · `unit-candidate`                                                  |
| F3   | 선호 조건                    | `unit-preferences` · `unit-regions`                                              |
| F3   | 추천 상세                    | `unit-profile-composition` · `unit-actions-badges`                               |
| F4   | 관심 전송 완료               | `unit-result-notices`                                                            |
| F4   | 매칭 성사 · 바텀 시트        | `unit-result-notices`                                                            |
| F3   | 잠시 쉬는 중                 | `unit-result-notices`                                                            |
| F4   | 매칭                         | `unit-compact-cards` · `unit-choice-groups`                                      |
| F4   | 받은 관심                    | `unit-compact-cards` · `unit-lists` · `unit-choice-groups`                       |
| F4   | 받은 관심 상세               | `unit-profile-composition` · `unit-actions-badges`                               |
| F4   | 보낸 관심                    | `unit-compact-cards` · `unit-lists` · `unit-choice-groups`                       |
| F5   | 채팅 설정                    | `unit-action-menu`                                                               |
| F5   | 구름 · 보낸 제안 취소됨      | `unit-chat-context` · `unit-chat-units` · `appointments`                         |
| F5   | 두부 · 받은 제안 성사됨      | `unit-chat-context` · `unit-chat-units` · `appointments`                         |
| F5   | 매칭 종료                    | `confirm`                                                                        |
| F6   | 약속 목록                    | `appointments` · `unit-choice-groups`                                            |
| F6   | 약속 제안 · 바텀 시트        | `unit-sheets`                                                                    |
| F6   | 받은 제안                    | `appointments` · `unit-chat-units`                                               |
| F6   | 성사된 약속                  | `appointments`                                                                   |
| F6   | 약속 취소 · 바텀 시트        | `unit-input-composition`                                                         |
| F6   | 만남 후 평가 · 바텀 시트     | `unit-sheets` · `unit-rating`                                                    |
| F7   | 차단 확인                    | `confirm`                                                                        |
| F7   | 신고 · 바텀 시트             | `unit-input-composition`                                                         |
| F1   | 추천 · F1 탭 셸              | `feedback`                                                                       |
| F1   | 매칭 · F1 탭 셸              | `feedback`                                                                       |
| F1   | 내 반려견 · F1 탭 셸         | `feedback`                                                                       |
