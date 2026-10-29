/* UI 기준의 원본. 상태는 서버 정책이 아니라 현재 시안에서 확인할 표시 변형이다. */
const UI_SPECS = (() => {
  const U = PetmateUI,
    P = PetmatePatterns;
  const photo = P.photo({
    src: 'assets/login-dog.png',
    alt: '산책 중인 반려견',
  });
  const dog = {
    name: '구름',
    age: 3,
    size: '중형',
    identity: '개인 · 여성',
    guardian: { nickname: '구름이네', activityRegions: [{id:'locality-demo-mangwon',displayName:'서울특별시 마포구 망원동'}], availableTimeSlots: [{dayOfWeek:'saturday',startTime:'10:00',endTime:'12:00'}] },
  };
  const tabs = [
    ['F1-REC', '추천', 'recommendations', 'paw-print'],
    ['F1-MATCH', '매칭', 'matches', 'chat-circle'],
    ['F1-DOG', '내 반려견', 'dogs', 'dog'],
    ['GUARDIAN-01', '내 정보', 'guardian', 'user'],
  ];
  const spec = (
    id,
    title,
    milestone,
    connection,
    rule,
    examples,
    view = 'guardian',
  ) => ({ id, title, milestone, connection, rule, examples, view });
  const iconBack = U.button('이전', 'catalog', 'icon-button', false, {
    icon: 'arrow-left',
    iconOnly: true,
  });
  const specs = [
    spec(
      'approved-schedule',
      '산책 조건 · 승인한 폼',
      'F2·F3 UI 기준',
      '승인 시안 · 공통 입력 연결',
      '수정한 3번 시안. 시간은 양쪽 손잡이, 강도는 세 점 중 하나, 요일은 한 줄, 지역은 동명·닫기 칩을 사용한다. 예시는 저장하지 않는다.',
      [
        [
          '산책 조건',
          P.form({
            action: 'catalog',
            label: '저장',
            errorId: 'approved-form-error',
            bodyHtml:
              `<div class="approved-schedule-heading"><div><a href="components.html#unit-approved-schedule" aria-label="컴포넌트 목차로">${U.icon('arrow-left')}</a><h2>산책 조건</h2></div><p>함께 걷기 좋은 때를 골라 주세요.</p></div>` +
              P.timeRange({ id: 'approved-time' }) +
              P.weekdays({
                name: 'approved-days',
                selected: ['saturday', 'sunday'],
              }) +
              P.intensity({ name: 'approved-intensity', value: 'moderate' }) +
              P.regionPicker(
                [
                  {
                    name: 'sido',
                    label: '시·도',
                    options: [['seoul-demo', '서울특별시']],
                    value: 'seoul-demo',
                  },
                  {
                    name: 'sigungu',
                    label: '시·군·구',
                    options: [['mapo-demo', '마포구']],
                    value: 'mapo-demo',
                  },
                  {
                    name: 'locality',
                    label: '읍·면·동',
                    options: [
                      ['mangwon', '망원동'],
                      ['seogyo', '서교동'],
                      ['hapjeong', '합정동'],
                      ['yeonnam', '연남동'],
                    ],
                    value: '',
                  },
                ],
                [
                  ['mangwon', '망원동'],
                  ['seogyo', '서교동'],
                ],
                { idPrefix: 'approved-' },
              ) +
              '<div class="schedule-intro">' +
              P.control({
                id: 'approved-intro',
                name: 'approved-intro',
                label: '소개',
                type: 'textarea',
                value: '처음에는 천천히 인사해요.',
                required: false,
              }) +
              '<output>14 / 500</output></div>',
          }),
        ],
      ],
      'schedule',
    ),
    spec(
      'schedule-states',
      '시간·요일·강도 상태',
      'F2·F3·F6 UI 기준',
      '공통 컨트롤',
      '단독 예시와 종합 폼은 같은 시간 컴포넌트를 사용한다. 직접 입력·손잡이는 모두 10분 단위이며 최소 간격도 10분이다. 강도는 세 범주만 선택한다. 요일은 기능별로 단일/복수 선택을 구분한다.',
      [
        ['시간 · 기본', P.timeRange({ id: 'spec-time-basic' })],
        [
          '시간 · 최소 간격 (10분)',
          P.timeRange({ id: 'spec-time-short', start: '10:00', end: '10:10' }),
        ],
        [
          '시간 · 비활성',
          P.timeRange({ id: 'spec-time-disabled', disabled: true }),
        ],
        ['요일 · 미선택', P.weekdays({ name: 'spec-days-none' })],
        [
          '요일 · 주말 선택',
          P.weekdays({
            name: 'spec-days-weekend',
            selected: ['saturday', 'sunday'],
          }),
        ],
        [
          '요일 · 단일 선택',
          P.weekdays({
            name: 'spec-days-single',
            multiple: false,
            selected: ['monday'],
          }),
        ],
        [
          '요일 · 비활성',
          P.weekdays({
            name: 'spec-days-off',
            selected: ['saturday'],
            disabled: true,
          }),
        ],
        ...['', 'slow', 'moderate', 'active'].map((value, i) => [
          '강도 · ' + (value || '미선택'),
          P.intensity({ name: 'spec-intensity-' + i, value }),
        ]),
        [
          '강도 · 비활성',
          P.intensity({
            name: 'spec-intensity-disabled',
            value: 'moderate',
            disabled: true,
          }),
        ],
      ],
      'schedule',
    ),
    spec(
      'headings',
      '제목·섹션 제목',
      'F1 공통',
      '화면 연결',
      '제목 수준과 설명 유무를 유지한다. 고정된 행의 긴 이름은 글자 크기를 줄여 한 줄로 표시한다.',
      [
        [
          '제목·설명',
          P.heading('내 정보', '보호자 정보와 메이트 찾기 상태를 확인해요.'),
        ],
        [
          '긴 제목·설명 없음',
          P.heading('보호자 정보와 메이트 찾기 상태를 확인해 주세요'),
        ],
        [
          '번호 있는 폼 섹션',
          P.sectionHeading(
            '01',
            '계정 정보',
            '로그인에 사용할 정보를 입력해 주세요.',
          ),
        ],
        ['번호 없는 섹션', P.sectionHeading('', '산책 조건')],
      ],
    ),
    spec(
      'navigation',
      '상단 헤더·하단 탭',
      'F1 공통 · F3 · F5',
      '하단 탭 화면 연결 · 헤더 구성 기준',
      '인증에는 보호 탭을 표시하지 않는다. 활성 링크는 aria-current로 표시한다. F1 탭은 F1 셸로 이동한다.',
      [
        [
          '일반 헤더',
          `<header>${P.header({ leftHtml: iconBack, titleHtml: '<h1>내 정보</h1>' })}</header>`,
        ],
        [
          '상세·긴 제목',
          `<header>${P.header({ leftHtml: iconBack, titleHtml: '<h1>산책 친구의 상세 프로필</h1>' })}</header>`,
        ],
        [
          '추천·브랜드',
          `<header>${P.header({ leftHtml: P.wordmark(), rightHtml: iconBack })}</header>`,
        ],
        [
          '채팅·상대 정보',
          `<header>${P.header({ leftHtml: iconBack, titleHtml: P.chatPerson({ name: '구름', copy: '보리와 연결된 친구', photoHtml: photo }), rightHtml: U.button('채팅 설정', 'catalog', 'icon-button', false, { icon: 'dots-three', iconOnly: true }) })}</header>`,
        ],
        ...tabs.map(([, label, key]) => [
          '하단 탭 · ' + label,
          `<footer>${P.bottomTabs(tabs, key, true)}</footer>`,
        ]),
      ],
    ),
    spec(
      'facts',
      '정보 목록·반려견 정보',
      'F1 · F3',
      '화면 연결',
      '정보 항목을 합치거나 생략하지 않는다. 개인 성별의 노출 조건은 화면이 결정한다.',
      [
        [
          '개인 보호자',
          P.facts([
            ['보호자 유형', '개인'],
            ['성별', '여성'],
            ['메이트 찾기', '찾는 중'],
          ]),
        ],
        [
          '가족·쉬는 중',
          P.facts([
            ['보호자 유형', '가족'],
            ['메이트 찾기', '쉬는 중'],
          ]),
        ],
        [
          '긴 값',
          P.facts([
            ['건강·안전', '중성화·예방접종·반려동물등록을 완료했어요.'],
          ]),
        ],
        [
          '목록 이름·활동 지역',
          P.identity(dog) + P.location('서울특별시 마포구 망원동'),
        ],
        [
          '상세·긴 이름·거리 없음',
          P.identity({ ...dog, name: '이름이 긴 산책 친구 구름이' }, 2) +
            P.location('서울특별시 마포구 망원동'),
        ],
        [
          '소개 섹션',
          P.textSection(
            '구름이를 소개해요',
            '처음에는 충분한 거리를 두고 천천히 인사해요.',
          ),
        ],
      ],
    ),
    spec(
      'guardian',
      '보호자 요약·사진',
      'F1 · F3',
      '화면 연결',
      '사진 없음·있음과 긴 닉네임을 지원한다. 찾기 상태에 따라 식별 정보를 임의로 없애지 않는다.',
      [
        ['사진 없음', P.guardian('구름이네', '개인 · 여성')],
        [
          '사진 있음 · 예시 이미지',
          P.guardian('보리네', '가족', 'assets/login-dog.png'),
        ],
        ['긴 닉네임', P.guardian('주말 아침에 함께 걷는 구름이네', '커플')],
        ['아바타 없음', U.avatar()],
        ['아바타 있음 · 예시 이미지', U.avatar('assets/login-dog.png')],
        [
          '사진 변경 · 촬영/앨범 바텀 시트',
          P.photoEditor({ idPrefix: 'catalog-guardian-photo' }),
        ],
        [
          '보호자 성별',
          P.choiceGroup({
            name: 'catalog-guardian-gender',
            label: '성별',
            options: [
              ['female', '여성'],
              ['male', '남성'],
            ],
            selected: ['female'],
          }),
        ],
      ],
    ),
    spec(
      'input-composition',
      '폼·선택 입력·여러 줄 입력',
      'F1 폼 · F2·F7 입력 참고',
      '폼 화면 연결 · select/textarea 기준 예시',
      '필드의 label·도움말·오류를 연결한다. select의 읽기 전용은 비활성 표시로 구분한다. 파일 입력은 기존 field를 사용한다.',
      [
        ...['기본', '선택됨', '오류', '비활성', '읽기 전용'].map((label, i) => [
          '드롭다운 · ' + label,
          P.control({
            id: 'spec-select-' + i,
            name: 'breed-' + i,
            label: '견종',
            options: [
              ['mixed', '믹스견'],
              ['other', '기타'],
            ],
            value: i ? 'mixed' : '',
            error: i === 2,
            disabled: i === 3,
            readOnly: i === 4,
            feedback:
              i === 2
                ? '견종을 확인해 주세요.'
                : i === 4
                  ? '읽기 전용 예시입니다.'
                  : '',
          }),
        ]),
        ...['빈 값', '입력됨', '오류', '비활성', '읽기 전용'].map(
          (label, i) => [
            '여러 줄 입력 · ' + label,
            P.control({
              id: 'spec-text-' + i,
              name: 'intro-' + i,
              label: '소개',
              type: 'textarea',
              value: i
                ? '천천히 나란히 걸어요. 긴 소개는 여러 줄로 표시해요.'
                : '',
              error: i === 2,
              disabled: i === 3,
              readOnly: i === 4,
              feedback: i === 2 ? '소개를 확인해 주세요.' : '',
            }),
          ],
        ),
        ...['기본', '제출 중', '실패·입력 유지'].map((label, i) => [
          '폼 · ' + label,
          P.form({
            bodyHtml: U.field({
              id: 'spec-form-' + i,
              name: 'nickname',
              label: '닉네임',
              value: '보리네',
            }),
            action: 'catalog',
            label: i === 1 ? '저장 중…' : '저장',
            errorId: 'spec-form-error-' + i,
            busy: i === 1,
            error: i === 2 ? '저장하지 못했어요. 다시 시도해 주세요.' : '',
          }),
        ]),
      ],
    ),
    spec(
      'choice-groups',
      '다중 선택·화면 내부 이동·분류',
      'F3·F4·F6 참고',
      '다중 선택·이동 탭 화면 연결 · 분류 기준 예시',
      '다중 선택은 checkbox, 화면 이동은 링크, 목록 분류는 누름 상태를 가진 버튼이다. 서로 다른 역할을 하나로 합치지 않는다.',
      [
        ...[[], ['sat'], ['sat', 'sun']].map((selected, i) => [
          '다중 선택 · ' + ['미선택', '하나 선택', '여러 개 선택'][i],
          P.weekdays({
            name: 'spec-days-' + i,
            selected: selected.map((v) =>
              v === 'sat' ? 'saturday' : 'sunday',
            ),
          }),
        ]),
        [
          '다중 선택 · 비활성',
          P.weekdays({
            name: 'spec-days-disabled',
            selected: ['saturday'],
            disabled: true,
          }),
        ],
        ...['MATCH-01', 'LIKES-01', 'LIKES-SENT', 'APPT-LIST'].map((id) => [
          '이동 탭 · ' + id,
          P.navigationTabs(
            [
              ['MATCH-01', '대화'],
              ['LIKES-01', '받은 관심'],
              ['LIKES-SENT', '보낸 관심'],
              ['APPT-LIST', '약속'],
            ],
            id,
          ),
        ]),
        ...['sent', 'received', 'accepted', 'canceled'].map((id) => [
          '약속 분류 · ' + id,
          P.categoryTabs(
            [
              ['sent', '보낸 제안'],
              ['received', '받은 제안'],
              ['accepted', '성사된 약속'],
              ['canceled', '취소된 약속'],
            ],
            id,
          ),
        ]),
      ],
    ),
    spec(
      'lists',
      '사진 목록 행·기준 반려견 선택',
      'F2·F4 참고 · F3 선택',
      '선택기·보낸 관심 화면 연결 · 행 기준 예시',
      '이동 행은 사진·이름·보조 정보를 유지한다. 선택된 반려견은 문구로도 구분한다.',
      [
        [
          '보낸 관심 · 오른쪽 X 취소',
          P.sentInterest({ name: '구름', candidate: 0, photoHtml: photo }),
        ],
        [
          '기본 행',
          P.listRow({
            name: '구름',
            copy: '받은 제안 · 약속이 성사됐어요',
            photoHtml: photo,
            screen: 'CHAT-01',
          }),
        ],
        [
          '선택된 행·긴 이름',
          P.listRow({
            name: '이름이 긴 우리 반려견 보리',
            copy: '현재 기준 반려견',
            photoHtml: photo,
            screen: 'DOG-06',
            selected: true,
          }),
        ],
        [
          '사진 없는 행',
          P.listRow({
            name: '콩이',
            copy: '상세 프로필 보기',
            screen: 'DOG-06',
          }),
        ],
        [
          '기본 선택기',
          P.dogPicker({ selected: '보리', options: ['보리', '콩이'] }),
        ],
        [
          '사진 선택기',
          P.dogPicker({
            selected: '콩이',
            options: ['보리', '콩이'],
            photoHtml: photo,
          }),
        ],
      ],
    ),
    spec(
      'candidate',
      '추천 카드',
      'F3 · F4 참고',
      '추천 화면 연결',
      '추천은 궁합 이유, 받은 관심은 축약 카드에 받은 시각과 수락·거절을 표시한다. 받은 관심에 궁합을 임의로 붙이지 않는다.',
      [
        ['추천', P.candidate({ dog, index: 0, photoHtml: photo })],
        [
          '긴 이름·보호자',
          P.candidate({
            dog: {
              ...dog,
              name: '처음에는 천천히 인사하는 구름',
              guardian: { nickname: '함께 걷는 구름이네 가족' },
            },
            index: 0,
            photoHtml: photo,
          }),
        ],
      ],
      'recommendations',
    ),
    spec(
      'chat-units',
      '말풍선·실패 안내·입력 영역',
      'F5 · F6 실패 안내',
      '화면 연결',
      '본문은 HTML로 실행하지 않는다. 실패는 박스 없는 빨간 느낌표와 문구로 표시한다. 입력값과 전송 가능 여부는 화면 상태가 결정한다.',
      [
        ['수신', P.message('망원공원 입구에서 만날까요?')],
        [
          '발신·긴 본문',
          P.message(
            '좋아요! 처음에는 충분한 거리를 두고 천천히 인사해요. 나란히 걸으며 친해지면 좋겠어요.',
            true,
          ),
        ],
        [
          '전송 실패·재시도',
          P.message('조금 일찍 도착할 것 같아요.', true) +
            P.messageFailure('전송하지 못했어요.', 'catalog'),
        ],
        ['일반 실패', U.inlineError('처리하지 못했어요. 다시 시도해 주세요.')],
        ['입력 영역 · 빈 값', P.composer({ id: 'spec-message-empty' })],
        [
          '입력 영역 · 긴 내용',
          P.composer({
            id: 'spec-message-long',
            value:
              '안녕하세요! 토요일 오전에 망원공원 입구에서 만날까요? 처음에는 충분한 거리를 두고 천천히 인사해요. 익숙해지면 나란히 걸으면 좋겠어요.',
          }),
        ],
        [
          '입력 영역 · 여러 줄·전송 불가',
          P.composer({
            id: 'spec-message-long-disabled',
            disabled: true,
            value:
              '연결을 기다리는 동안 작성한 내용은 그대로 유지해요.\n토요일 오전에는 망원공원 입구에서 만나요.\n도착하면 다시 연락드릴게요.',
          }),
        ],
        [
          '입력 영역 · 입력됨',
          P.composer({ id: 'spec-message-filled', value: '안녕하세요!' }),
        ],
        [
          '입력 영역 · 대화 종료',
          P.composer({
            id: 'spec-message-closed',
            availability: 'closed',
            value: '입력한 내용은 유지해요',
          }),
        ],
        [
          '입력 영역 · 전송 불가',
          P.composer({
            id: 'spec-message-disabled',
            value: '입력한 내용은 유지해요',
            disabled: true,
          }),
        ],
      ],
      'chat',
    ),
    spec(
      'actions-badges',
      '배지·버튼 묶음·아이콘 버튼',
      'F1 공통 · F3·F5·F6',
      '화면 연결·배치 기준',
      '주요/보조/위험 행동을 구분한다. 아이콘만 있는 버튼에도 읽을 수 있는 이름이 필요하다. 표시 배지는 클릭 버튼으로 쓰지 않는다.',
      [
        [
          '표시 배지',
          ['쉬는 중', '아주 잘 맞아요', '성사된 약속'].map(P.badge).join(' '),
        ],
        [
          '오른쪽 행동',
          P.actions(
            U.button('취소', 'catalog', '') + U.button('저장', 'catalog'),
          ),
        ],
        [
          '위험 확인 행동',
          P.actions(
            U.button('취소', 'catalog', '') +
              U.button('탈퇴', 'catalog', 'danger danger-solid'),
          ),
        ],
        [
          '하단 주요·보조 행동',
          U.actionPair({ rightIcon: 'heart', className: 'sun-detail-actions' }),
        ],

        [
          '아이콘만·비활성',
          iconBack +
            U.button('보내기', 'catalog', 'icon-button', true, {
              icon: 'paper-plane-tilt',
              iconOnly: true,
            }),
        ],
      ],
    ),
    spec(
      'future-units',
      '단계·지역·꼬리 평가·시트 구성',
      'F2·F3·F6·F7 참고',
      '평가·제안 시트 Sunshine · 등록 단계 참고',
      '평가·제안 시트는 승인 시안을 적용했다. 등록 단계는 와이어프레임 참고다. 지역 검증·평가 자격·저장 정책은 담당 화면과 서버가 결정한다. 닫기·스크롤·포커스는 실제 모달에서 검증한다.',
      [
        ...['기본 정보', '신체와 건강', '성향과 행동', '소개'].map(
          (title, i) => ['등록 ' + (i + 1) + '단계', P.step(i + 1, 4, title)],
        ),
        [
          '지역 선택·미선택',
          P.regionPicker([
            {
              name: 'sido',
              label: '시·도',
              options: [['seoul-demo', '서울특별시']],
              value: 'seoul-demo',
            },
            {
              name: 'sigungu',
              label: '시·군·구',
              options: [['mapo-demo', '마포구']],
              value: 'mapo-demo',
            },
            {
              name: 'locality',
              label: '읍·면·동',
              options: [
                ['mangwon', '망원동'],
                ['seogyo', '서교동'],
              ],
              value: '',
            },
          ]),
        ],
        [
          '선택 지역·삭제',
          '<div class="region-chips">' +
            P.selectedItems([
              ['mangwon', '망원동'],
              ['seogyo', '서교동'],
            ]) +
            '</div>',
        ],
        [
          '선택 한도·오류',
          '<div class="region-chips">' +
            P.selectedItems([
              ['one', '망원동'],
              ['two', '서교동'],
              ['three', '합정동'],
            ]) +
            '</div>' +
            U.inlineError('지역은 최대 3개까지 선택할 수 있어요.'),
        ],
        [
          '꼬리 평가 미선택',
          P.rating({
            name: 'spec-rating-empty',
            id: 'spec-rating-empty-value',
          }),
        ],
        [
          '꼬리 평가 선택',
          P.rating({
            name: 'spec-rating-chosen',
            id: 'spec-rating-chosen-value',
            value: 4,
          }),
        ],
        [
          '확인창 구성',
          U.confirmation({
            title: '매칭을 종료할까요?',
            copy: '이 대화에서 메시지를 조회하거나 보낼 수 없게 돼요.',
            action: 'catalog',
            label: '매칭 종료',
            danger: true,
          }),
        ],
        ...['기본', '제출 중', '실패·입력 유지'].map((label, i) => [
          '만남 평가 · ' + label,
          P.sheetHeader('만남 평가') +
            P.reviewForm({
              idPrefix: 'spec-review-' + i,
              action: 'catalog',
              value: 3,
              busy: i === 1,
              error:
                i === 2 ? '평가를 저장하지 못했어요. 다시 시도해 주세요.' : '',
            }),
        ]),
        ...[true, false].map((busy, i) => [
          '약속 제안 · ' + (busy ? '제출 중' : '실패·입력 유지'),
          P.sheetHeader('약속 제안') +
            P.proposalForm({
              idPrefix: 'spec-proposal-state-' + i,
              action: 'catalog',
              date: '2026-10-31',
              busy,
              error: busy ? '' : '제안하지 못했어요. 다시 시도해 주세요.',
            }),
        ]),
        [
          '약속 제안 · 통합 시트',
          P.sheetHeader('약속 제안') +
            P.proposalForm({
              idPrefix: 'spec-proposal',
              action: 'catalog',
              date: '2026-10-31',
              start: '09:00',
              end: '10:00',
            }),
        ],
      ],
    ),
  ];
  const mixed = specs.find((item) => item.id === 'future-units');
  const split = (id, title, renderer, predicate) => ({
    ...mixed,
    id,
    title,
    renderer,
    examples: mixed.examples.filter(([label]) => predicate(label)),
  });
  const regionOptions = [
    {
      name: 'sido',
      label: '시·도',
      options: [['seoul-demo', '서울특별시']],
      value: 'seoul-demo',
    },
    {
      name: 'sigungu',
      label: '시·군·구',
      options: [['mapo-demo', '마포구']],
      value: 'mapo-demo',
    },
    {
      name: 'locality',
      label: '읍·면·동',
      options: [
        ['mangwon', '망원동'],
        ['seogyo', '서교동'],
      ],
      value: '',
    },
  ];
  const regions = (prefix) =>
    P.regionPicker(regionOptions, [], { idPrefix: prefix });
  const cardSpecs = spec(
    'compact-cards',
    '반려견·대화·관심 카드',
    'F4·F5',
    '네 목록에서 같은 박스·행을 공유',
    '본문 이동과 행동 버튼은 분리한다. 받은 관심만 받은 시각을 표시한다.',
    [
      [
        '내 반려견',
        P.dogCard({ name: '보리', selected: true, photoHtml: photo }),
      ],
      [
        '대화',
        P.conversationCard({
          name: '구름',
          copy: '공원 입구에서 만나요.',
          screen: 'CHAT-01',
          photoHtml: photo,
        }),
      ],
      [
        '받은 관심',
        P.receivedInterest({ name: '구름', candidate: 0, photoHtml: photo }),
      ],
      [
        '보낸 관심',
        P.sentInterest({ name: '구름', candidate: 0, photoHtml: photo }),
      ],
    ],
  );
  const additions = [
    cardSpecs,
    spec(
      'dog-registration',
      '반려견 등록 · 기본·건강',
      'F2',
      '등록 화면과 목차가 같은 폼을 공유',
      '기본 정보와 건강 정보를 구획하고 모든 선택 항목을 가로로 표시한다.',
      [
        [
          '기본 정보',
          P.registrationIntro({
            current: 1,
            title: '어떤 친구인가요?',
            copy: '사진과 기본 정보로 우리 친구를 소개해요.',
          }) + P.dogBasicForm({ idPrefix: 'catalog-dog-basic' }),
        ],
        [
          '기본 정보 · 기타 견종',
          P.registrationIntro({
            current: 1,
            title: '어떤 친구인가요?',
            copy: '사진과 기본 정보로 우리 친구를 소개해요.',
          }) +
            P.dogBasicForm({
              idPrefix: 'catalog-dog-other',
              draft: { breed: 'other', breedOther: '베들링턴 테리어' },
            }),
        ],
        [
          '신체와 건강',
          P.registrationIntro({
            current: 2,
            title: '건강하게 함께 걸어요',
            copy: '몸무게와 건강 상태에 맞춰 산책을 준비해요.',
          }) + P.dogHealthForm({ idPrefix: 'catalog-dog-health' }),
        ],
      ],
    ),
    spec(
      'profile-composition',
      '반려견 상세 구성',
      'F3·F4',
      '추천·받은 관심 상세 공유',
      '사진·정보·소개·조건은 한 렌더러를 사용하고 받은 관심에는 궁합을 만들지 않는다.',
      [
        [
          '추천 상세',
          P.dogProfile({
            dog: { ...dog, time: '토·일 09:00–11:00' },
            photoHtml: photo,
            intro: '친구와 천천히 걷는 것을 좋아해요.',
            reasons: ['산책 속도가 비슷해요.'],
            factRows: [['산책 강도', '보통']],
          }),
        ],
        [
          '받은 관심 상세',
          P.dogProfile({
            dog: { ...dog, time: '토·일 09:00–11:00' },
            photoHtml: photo,
            intro: '친구와 천천히 걷는 것을 좋아해요.',
            received: true,
            factRows: [['산책 강도', '보통']],
          }),
        ],
        [
          '내 반려견 상세',
          P.dogSummary({
            dog: { ...dog, time: '토·일 09:00–11:00' },
            photoHtml: P.photo({
              src: 'assets/login-dog.png',
              alt: '산책 중인 반려견',
              className: 'hero detail-photo',
            }),
            intro: '친구와 천천히 걷는 것을 좋아해요.',
            own: true,
            introTitle: '우리 구름을 소개해요',
          }),
        ],
        [
          '보호자 내 정보',
          P.guardianSurface({
            nickname: '구름이네',
            profileType: 'individual',
            gender: 'female',
            discovery: 'searching',
          }),
        ],
      ],
    ),
    spec(
      'preferences',
      '선호 조건 폼',
      'F3',
      '추천 필터 팝업 공유',
      '선택과 여백 규칙은 실제 필터 팝업과 같은 렌더러를 사용한다.',
      [
        [
          '기본',
          P.preferenceForm({
            regionHtml: regions('spec-filter-default-'),
            idPrefix: 'spec-filter-default-',
            action: 'catalog',
          }),
        ],
        [
          '선택됨',
          P.preferenceForm({
            filters: { sizeGroups: ['small'], availableTimeSlots: [{dayOfWeek:'saturday',startTime:'10:00',endTime:'12:00'}] },
            regionHtml: regions('spec-filter-selected-'),
            idPrefix: 'spec-filter-selected-',
            action: 'catalog',
          }),
        ],
      ],
    ),
    spec(
      'result-notices',
      '완료·매칭·쉬는 중 안내',
      'F3·F4',
      '실제 상태 안내 공유',
      '각 예시는 화면과 동일한 렌더러를 사용한다. 모달·바텀 시트·전체 화면은 각각 다르다.',
      [
        [
          '관심 전송 완료 · 모달',
          `<div class="catalog-feedback-dialog">${P.interestSent({ name: '구름', action: 'catalog' })}</div>`,
        ],
        [
          '매칭 성사 · 바텀 시트',
          `<div class="catalog-bottom-sheet">${P.matchResult({
            ownDog: '보리',
            otherDog: '구름',
            photoHtml: P.photo({
              src: 'assets/login-dog.png',
              className: 'dog-photo',
              alt: '하네스를 착용하고 공원에서 산책하는 반려견',
            }),
            actions: [
              ['목록으로', 'catalog', ''],
              ['메시지 보내기', 'catalog'],
            ],
          })}</div>`,
        ],
        [
          '잠시 쉬는 중',
          P.resultNotice({
            badge: '쉬는 중',
            title: '지금은 새로운 만남을 쉬고 있어요',
            copy: '기존 대화·약속은 계속 이용할 수 있어요.',
            actions: [
              ['받은 관심 보기', 'catalog'],
              ['설정에서 재개', 'catalog', ''],
            ],
          }),
        ],
        ['반려견 미등록', U.emptyDog()],
      ],
    ),
    spec(
      'action-menu',
      '설정·안전 메뉴',
      'F5·F7',
      '채팅 설정 공유',
      '탐색 링크는 같은 행과 위험 색을 사용한다.',
      [
        [
          '채팅 설정',
          P.actionMenu({
            title: '채팅 설정',
            items: [
              ['MATCH-CLOSE-01', '매칭 종료', true],
              ['SAFE-01', '차단', true],
              ['SAFE-02', '신고'],
            ],
          }),
        ],
      ],
    ),
    spec(
      'chat-context',
      '대화 상대·연결 안내',
      'F5',
      '채팅 헤더·상단 문맥 공유',
      '상대 이름과 기준 반려견을 공통으로 표시한다.',
      [
        [
          '상대 정보',
          P.chatPerson({
            name: '구름',
            copy: '보리와 연결된 친구',
            photoHtml: photo,
          }),
        ],
        ['연결 문맥', P.chatContext({ dog: '보리', otherDog: '구름' })],
      ],
    ),
  ];
  const entries = specs.filter((item) => item.id !== 'future-units');
  entries.find((item) => item.id === 'lists').examples = entries
    .find((item) => item.id === 'lists')
    .examples.filter(([label]) => !label.startsWith('보낸 관심'));
  return [
    ...entries,
    split(
      'registration-progress',
      '등록 진행 단계',
      'PetmatePatterns.step',
      (label) => label.startsWith('등록 '),
    ),
    split(
      'regions',
      '지역 선택·선택된 동',
      'PetmatePatterns.regionPicker / selectedItems',
      (label) => label.includes('지역') || label === '선택 한도·오류',
    ),
    split(
      'rating',
      '비공개 만남 평가 입력',
      'PetmatePatterns.rating',
      (label) => label.startsWith('꼬리 평가'),
    ),
    split(
      'sheets',
      '제안·평가 시트',
      'PetmatePatterns.sheetHeader / proposalForm / reviewForm',
      (label) => label.startsWith('만남 평가') || label.startsWith('약속 제안'),
    ),
    ...additions,
  ];
})();

const CATALOG_GROUPS = [
  {
    id: 'basics',
    title: '기본 요소·행동',
    sections: [
      'fields',
      'buttons',
      'choices',
      'unit-headings',
      'unit-actions-badges',
    ],
  },
  {
    id: 'navigation',
    title: '탐색·목록·카드',
    sections: [
      'unit-navigation',
      'unit-choice-groups',
      'unit-lists',
      'unit-compact-cards',
      'unit-action-menu',
    ],
  },
  {
    id: 'forms',
    title: '폼·선택·지역',
    sections: [
      'unit-approved-schedule',
      'unit-schedule-states',
      'unit-input-composition',
      'unit-preferences',
      'unit-dog-registration',
      'unit-registration-progress',
      'unit-regions',
      'unit-rating',
    ],
  },
  {
    id: 'profiles',
    title: '정보·프로필',
    sections: [
      'unit-facts',
      'unit-guardian',
      'unit-candidate',
      'unit-profile-composition',
    ],
  },
  {
    id: 'conversations',
    title: '메시지·약속',
    sections: [
      'unit-chat-context',
      'unit-chat-units',
      'appointments',
      'unit-sheets',
    ],
  },
  {
    id: 'states',
    title: '상태·대화상자',
    sections: ['feedback', 'confirm', 'unit-result-notices'],
  },
];
const COMPONENT_RENDERERS = {
  'approved-schedule': 'form / timeRange / weekdays / intensity / regionPicker',
  'schedule-states': 'timeRange / weekdays / intensity',
  headings: 'heading / sectionHeading',
  navigation: 'header / bottomTabs',
  facts: 'facts / identity / location / textSection',
  guardian: 'guardian / avatar',
  'input-composition': 'form / control / choiceGroup',
  'choice-groups': 'weekdays / navigationTabs / categoryTabs',
  lists: 'listRow / dogPicker',
  candidate: 'candidate',
  'chat-units': 'message / messageFailure / composer',
  'actions-badges': 'badge / actions / actionPair / button',
  'dog-registration':
    'registrationIntro / registrationSection / dogBasicForm / dogHealthForm',
  'compact-cards':
    'compactCard / dogCard / conversationCard / receivedInterest / sentInterest',
  'profile-composition':
    'dogProfile / profileHero / compatibility / walkingTime / guardianSurface / dogSummary',
  preferences: 'preferenceForm',
  'result-notices': 'interestSent / matchResult / resultNotice / emptyDog',
  'action-menu': 'actionMenu',
  'chat-context': 'chatPerson / chatContext',
};
const SCREEN_COMPONENTS = {
  login: ['fields', 'unit-input-composition', 'unit-headings'],
  signup: ['fields', 'choices', 'unit-input-composition', 'unit-headings', 'unit-regions', 'unit-schedule-states'],
  restore: ['feedback'],
  logout: ['confirm'],
  withdraw: ['confirm'],
  dogEmpty: ['unit-result-notices'],
  dogs: ['unit-compact-cards', 'buttons'],
  dogBasic: ['unit-dog-registration', 'unit-registration-progress'],
  dogHealth: ['unit-dog-registration', 'unit-registration-progress'],
  dogBehavior: [
    'unit-schedule-states',
    'unit-input-composition',
    'unit-registration-progress',
  ],
  dogIntro: ['unit-input-composition', 'unit-registration-progress'],
  dogDetail: ['unit-profile-composition', 'unit-facts'],
  guardianInfo: [
    'unit-profile-composition',
    'unit-facts',
    'unit-actions-badges',
  ],
  guardian: ['fields', 'choices', 'unit-input-composition', 'unit-regions', 'unit-schedule-states'],
  recommendations: ['unit-lists', 'unit-candidate'],
  filters: ['unit-preferences', 'unit-regions'],
  detail: ['unit-profile-composition', 'unit-actions-badges'],
  likeDetail: ['unit-profile-composition', 'unit-actions-badges'],
  sent: ['unit-result-notices'],
  mutual: ['unit-result-notices'],
  paused: ['unit-result-notices'],
  matches: ['unit-compact-cards', 'unit-choice-groups'],
  likes: ['unit-compact-cards', 'unit-lists', 'unit-choice-groups'],
  sentLikes: ['unit-compact-cards', 'unit-lists', 'unit-choice-groups'],
  chatSettings: ['unit-action-menu'],
  chat: ['unit-chat-context', 'unit-chat-units', 'appointments'],
  close: ['confirm'],
  appointments: ['appointments', 'unit-choice-groups'],
  appointment: ['unit-sheets'],
  receivedAppointment: ['appointments', 'unit-chat-units'],
  acceptedAppointment: ['appointments'],
  cancelAppointment: ['unit-input-composition'],
  review: ['unit-sheets', 'unit-rating'],
  block: ['confirm'],
  report: ['unit-input-composition'],
  f1Recommendations: ['feedback'],
  f1Matches: ['feedback'],
  f1Dogs: ['feedback'],
};
