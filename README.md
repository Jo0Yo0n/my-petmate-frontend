# My Petmate 프론트엔드

반려견의 산책·놀이 친구를 찾고 매칭·채팅·약속으로 연결하는 React Native·Expo 앱의 저장소다. MVP는 iPhone·한국어·밝은 모드로 진행한다.

## 어디서 시작할까

1. [MVP 계획의 현재 위치](docs/frontend-mvp-plan.md#현재-위치): 전체 단계와 지금 어디까지 왔는가.
2. [프론트 가이드](docs/frontend-guide.md): 화면·상태·API·저장·실행 도구는 어떻게 연결되는가.
3. [F0·F1 구현 계획](docs/f0-f1-implementation-plan.md): 다음 구현 단위와 완료 기준.
4. [프론트 기술 부채](docs/technical-debt.md): 서버 계약 확정 후 연결할 항목과 관련 백엔드 계획.

## 실행 안내

Expo SDK 57 기반의 첫 화면을 준비 중이다. 실행 환경은 [프론트 가이드](docs/frontend-guide.md#실행-환경과-실행-방식), 남은
검증은 [F0·F1 구현 계획](docs/f0-f1-implementation-plan.md)을 따른다.

```bash
npm install
npm run start
```

Xcode와 iOS Simulator 준비 후 개발 서버에서 `i`를 눌러 Expo Go로 실행한다. `npm run ios`로 바로 시뮬레이터 실행을 요청할 수도 있다. 첫 화면은
`src/app/index.tsx`에서 시작하고 공통 라우터는 `src/app/_layout.tsx`에서 설정한다. 첫 화면의 현재 검증
상태는 [F0·F1 구현 계획](docs/f0-f1-implementation-plan.md)을 따른다.

```bash
npm run lint
npm run typecheck
npm test
```

lint는 앱 소스의 정적 규칙을 확인하고, Jest는 앱 테스트를 실행한다. 아직 앱 테스트가 없으면 Jest는 테스트가 없다고 출력하고 정상 종료한다.

## 문서를 이어서 관리하는 방법

단계별 상태는 MVP 계획에서, 구현 단위별 상태와 완료 판정에 필요한 근거는 해당 상세 계획에서 현재 상태로 갱신한다. 미해결 항목은 관련 기능·계획 문서에서 관리한다.

## 디자인 미리보기

화면 구성과 모의 동작은 [HTML/CSS 와이어프레임](docs/design-assets/editable-wireframes/index.html), 시각
기준은 [UI Foundation](docs/ui-foundation.md)을 참고한다. 화면별 디자인 적용
범위는 [디자인 목차](docs/design-assets/editable-wireframes/sunshine-board.html), 로컬 실행
방법은 [화면 원본 안내](docs/design-assets/editable-wireframes/README.md)에서 확인한다. 시안은 실제 앱 구현과 별도다.
