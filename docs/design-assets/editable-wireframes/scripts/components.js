const U = PetmateUI;
const sample = (title, component, markup, view = 'guardian') =>
  `<article class="catalog-item"><h3>${title}</h3><code>${component}</code><div class="phone" data-view="${view}"><div class="content">${markup}</div></div></article>`;
const section = (id, title, description, items) =>
  `<section class="catalog-section" id="${id}"><h2>${title}</h2><p>${description}</p><div class="catalog-grid">${items.join('')}</div></section>`;
const profileOptions = [
  ['individual', '개인', 'user', '개인 보호자'],
  ['couple', '커플', 'users', '커플 보호자'],
  ['family', '가족', 'house', '가족 보호자'],
];
const discoveryOptions = [
  ['searching', '찾는 중', 'sun', '추천과 새로운 관심 보내기'],
  ['paused', '쉬는 중', 'moon', '기존 관심·대화·약속은 유지'],
];
const fieldSamples = [
  ['기본', {}],
  ['포커스', { extra: 'data-preview-focus="true"' }],
  ['오류', { feedback: '닉네임을 입력해 주세요.', tone: 'error' }],
  [
    '확인 완료',
    { value: '보리네', feedback: '입력한 내용을 확인했어요.', tone: 'success' },
  ],
  ['비활성', { value: '보리네', disabled: true }],
  ['읽기 전용', { value: '보리네', extra: 'readonly' }],
].map(([title, props], i) =>
  sample(
    title,
    'PetmateUI.field',
    U.field({
      id: 'catalog-field-' + i,
      name: 'field-' + i,
      label: '닉네임',
      placeholder: '닉네임을 입력해 주세요',
      ...props,
    }),
  ),
);
const fields = section(
  'fields',
  '입력 필드',
  '이메일·비밀번호·닉네임·선택 사진에 재사용합니다. 오류는 필드와 연결되고 이름(label)은 유지됩니다.',
  fieldSamples.concat([
    sample(
      '선택 사진',
      'PetmateUI.field',
      U.field({
        id: 'catalog-photo',
        name: 'photo',
        label: '보호자 사진 (선택)',
        type: 'file',
        required: false,
        extra: 'accept="image/jpeg,image/png,image/webp"',
      }),
    ),
  ]),
);
const buttons = section(
  'buttons',
  '행동 버튼',
  '문구에 맞춘 폭·12px 모서리·40px 표면/44px 터치 영역·얇은 하단 그림자. 비활성은 평평하게 표시합니다.',
  [
    ...[
      ['주요', '내 정보로', 'primary', false, 'settings'],
      ['보조', '취소', '', false, 'catalog'],
      ['위험', '매칭 종료', 'danger', false, 'catalog'],
      ['처리 중', '저장 중…', 'primary', true, 'catalog'],
      ['비활성', '저장', 'primary', true, 'catalog'],
    ].map(([title, label, kind, disabled, action]) =>
      sample(
        title,
        'PetmateUI.button',
        `<div class="ui-confirm">${U.button(label, action, kind, disabled)}</div>`,
      ),
    ),
    sample(
      '버튼 조합',
      'PetmateUI.button',
      `<div class="actions">${U.button('취소', 'catalog', '')}${U.button('저장', 'catalog')}</div>`,
    ),
  ],
);
const choices = section(
  'choices',
  '단일 선택 타일',
  '보호자 유형·찾기 상태의 미선택 및 선택 상태입니다. 성별의 최초 설정/읽기 전용은 아래 F1 화면 상태 표에서 확인합니다.',
  [
    sample(
      '보호자 유형 · 미선택',
      'PetmateUI.tiles',
      U.tiles('catalog-type-empty', '보호자 유형', profileOptions),
    ),
    ...['individual', 'couple', 'family'].map((value) =>
      sample(
        '보호자 유형 · ' + value,
        'PetmateUI.tiles',
        U.tiles('catalog-type-' + value, '보호자 유형', profileOptions, value),
      ),
    ),
    ...['', 'searching', 'paused'].map((value, i) =>
      sample(
        '찾기 상태 · ' + (value || '미선택'),
        'PetmateUI.tiles',
        U.tiles(
          'catalog-discovery-' + i,
          '찾기 상태',
          discoveryOptions,
          value,
          'discovery-tiles',
        ),
      ),
    ),
  ],
);
const feedback = section(
  'feedback',
  '안내·진행·실패 상태',
  '전체 진행·실패·재시도와 폼을 유지하는 부분 실패 안내를 구분합니다.',
  [
    sample('공통 안내 모달', 'PetmateUI.feedbackModal', `<div class="feedback-modal-sample">${U.feedbackModal({ title: '로그인하지 못했어요', copy: '이메일 또는 비밀번호를 확인해 주세요.' })}</div>`),
    sample('사진 실패 · 정보 저장 후', 'PetmateUI.feedbackModal', `<div class="feedback-modal-sample">${U.feedbackModal({ title: '사진을 올리지 못했어요', copy: '내 정보는 저장됐지만 사진은 올리지 못했어요.', actions: [['취소', 'catalog', ''], ['재시도', 'catalog']] })}</div>`),
    sample('공통 복원 스피너', 'PetmateUI.loading', U.loading()),
    sample(
      '전체 오류·복구',
      'PetmateUI.panel',
      `<div class="feedback-modal-sample">${U.panel({
        title: '불러오지 못했어요',
        copy: '연결을 확인하고 다시 시도해 주세요.',
        actions: [['재시도', 'catalog']],
      })}</div>`,
    ),
    sample(
      '부분 성공 / 결과 불명확',
      'PetmateUI.errorNotice',
      U.errorNotice('정보는 저장했지만 사진은 업로드하지 못했어요.'),
    ),
    sample(
      '폼 보조 안내',
      'PetmateUI.inlineNote',
      U.inlineNote(
        '쉬는 중에도 이전에 받은 관심에 응답하고, 이미 연결된 친구와 대화·약속을 이어갈 수 있어요.',
      ),
    ),
    sample(
      '완료',
      'PetmateUI.panel',
      `<div class="feedback-modal-sample">${U.panel({
        title: '저장했어요',
        copy: '확인된 정보가 반영되었어요.',
        actions: [['내 정보로', 'catalog']],
      })}</div>`,
    ),
  ],
);
const confirms = section(
  'confirm',
  '확인 대화상자',
  '화면에서도 같은 렌더러를 사용합니다. 진행·실패·결과 불명확은 F1 상태 표에서 확인할 수 있습니다.',
  [
    sample(
      '로그아웃',
      'PetmateUI.confirmation',
      `<div class="feedback-modal-sample">${U.confirmation({
        title: '로그아웃할까요?',
        copy: '이 기기에서 로그인 상태를 종료해요.',
        label: '로그아웃',
        action: 'catalog',
      })}</div>`,
    ),
    sample(
      '탈퇴',
      'PetmateUI.confirmation',
      `<div class="feedback-modal-sample">${U.confirmation({
        title: '탈퇴할까요?',
        copy: '탈퇴한 계정은 복구할 수 없어요.',
        label: '탈퇴',
        action: 'catalog',
        danger: true,
      })}</div>`,
    ),
  ],
);
const base = {
  id: 'catalog',
  otherDog: '두부',
  date: '2026-10-25',
  startTime: '09:00',
  endTime: '10:00',
  placeText: '망원공원 입구',
};
const cards = [
  ['받은 제안 · 수락/거절 가능', { status: 'proposed', direction: 'received' }],
  ['보낸 제안 · 응답 대기', { status: 'proposed', direction: 'sent' }],
  ['성사된 약속 · 취소 가능', { status: 'accepted', direction: 'received' }],
  ['거절된 제안', { status: 'rejected', direction: 'received' }],
  [
    '이전 기록 · 받은 제안',
    { status: 'proposed', direction: 'received', historical: true },
  ],
  [
    '이전 기록 · 보낸 제안',
    { status: 'proposed', direction: 'sent', historical: true },
  ],
  [
    '이전 기록 · 성사된 약속',
    { status: 'accepted', direction: 'sent', historical: true },
  ],
  [
    '취소된 약속 · 사유 보존',
    {
      status: 'canceled',
      direction: 'received',
      cancellationReason: '반려견 컨디션이 좋지 않아 취소해요.',
    },
  ],
  [
    '제안 응답 처리 중',
    { status: 'proposed', direction: 'received', busy: true },
  ],
  [
    '약속 취소 처리 중',
    { status: 'accepted', direction: 'received', busy: true },
  ],
  [
    '약속 취소 실패',
    { status: 'accepted', direction: 'received', error: true },
  ],
  [
    '제안 응답 실패',
    { status: 'proposed', direction: 'received', error: true },
  ],
];
const appointments = section(
  'appointments',
  'F6 · 약속·제안 카드 (기존 Sunshine)',
  'F1 구현 대상은 아닙니다. 수락/거절은 받은 제안에만 제공하며, 과거 기록에는 행동 버튼을 두지 않습니다. 현재 화면과 동일한 렌더러이며 처리 중/실패는 표시 예시입니다.',
  cards.map(([title, props]) =>
    sample(
      title,
      'PetmateUI.appointment',
      U.appointment(
        { ...base, ...props },
        '보리',
        props.status === 'accepted' && !props.historical,
      ),
      'chat',
    ),
  ),
);
const matrix = `<section class="catalog-section" id="f1-states"><h2>F1 · 화면별 전체 상태</h2><p>현재 인증 흐름에서 정의한 상태를 모두 링크했습니다. 화면 상태 선택기에서도 같은 목록을 사용합니다. 버튼은 모의 동작이며 실제 인증·업로드·저장 결과를 보장하지 않습니다.</p><table><thead><tr><th>화면</th><th>상태</th></tr></thead><tbody>${Object.entries(
  F1_STATES,
)
  .map(
    ([id, states]) =>
      `<tr><th>F1 · ${id === 'AUTH-03' ? '공통 복원 스피너' : id}</th><td>${Object.entries(
        states,
      )
        .map(
          ([value, label]) =>
            `<a href="sunshine.html?screen=${id}&state=${value}">${label}</a>`,
        )
        .join('')}</td></tr>`,
  )
  .join('')}</tbody></table></section>`;
const inventory = `<section class="catalog-section" id="unit-index"><h2>재사용 UI 단위·상태 기준</h2><p>화면 연결은 현재 HTML 시안의 사용 여부입니다. 참고 예시는 앱 기능 구현이나 Sunshine 디자인 완료를 뜻하지 않습니다. 포커스·키보드는 실제 조작으로 확인합니다.</p><div class="catalog-table-wrap"><table><thead><tr><th>UI 단위</th><th>마일스톤·연결</th><th>확인할 상태·변형</th></tr></thead><tbody>${UI_SPECS.map((spec) => `<tr><th><a href="#unit-${spec.id}">${U.escape(spec.title)}</a></th><td>${U.escape(spec.milestone)}<br>${U.escape(spec.connection)}</td><td>${spec.examples.map(([label]) => U.escape(label)).join(' · ')}</td></tr>`).join('')}</tbody></table></div></section>`;
const reusable = UI_SPECS.map((spec) => ({
  id: 'unit-' + spec.id,
  html: section(
    'unit-' + spec.id,
    spec.title,
    `${spec.milestone} · ${spec.connection}. ${spec.rule}`,
    spec.examples.map(([label, markup]) =>
      sample(
        label,
        (spec.id === 'result-notices' ? ({ '관심 전송 완료 · 모달': 'PetmatePatterns.interestSent', '매칭 성사 · 바텀 시트': 'PetmatePatterns.matchResult', '잠시 쉬는 중': 'PetmatePatterns.resultNotice', '반려견 미등록': 'PetmateUI.emptyDog' }[label]) : spec.renderer) ||
          (spec.id === 'actions-badges'
            ? 'PetmateUI.button / actionPair · PetmatePatterns.actions / badge'
            : spec.id === 'guardian'
              ? 'PetmateUI.avatar · PetmatePatterns.guardian / photoEditor / choiceGroup'
              : 'PetmatePatterns.' + (COMPONENT_RENDERERS[spec.id] || spec.id)),
        markup,
        spec.view,
      ),
    ),
  ),
}));
const sectionEntries = [
  { id: 'fields', html: fields },
  { id: 'buttons', html: buttons },
  { id: 'choices', html: choices },
  { id: 'feedback', html: feedback },
  { id: 'confirm', html: confirms },
  { id: 'appointments', html: appointments },
  ...reusable,
];
const bySection = new Map(
  sectionEntries.map((entry) => [entry.id, entry.html]),
);
const displayNames = new Map([
  ...UI_SPECS.map((spec) => ['unit-' + spec.id, spec.title]),
  ['fields', '입력 필드'],
  ['buttons', '행동 버튼'],
  ['choices', '선택 타일'],
  ['feedback', '상태 안내'],
  ['confirm', '확인 대화상자'],
  ['appointments', '약속 카드'],
]);
const coverage = `<section class="catalog-section" id="screen-components"><h2>화면별 공유 구성</h2><p>각 화면이 사용하는 재사용 단위입니다. 화면과 목차는 같은 렌더러를 호출하며, 상태 예시는 아래 F1 상태 표에서 확인합니다.</p><div class="catalog-table-wrap"><table><thead><tr><th>화면</th><th>공유 구성</th></tr></thead><tbody>${SCREENS.map((screen) => `<tr><th><a href="sunshine.html?screen=${screen.id}">${screen.milestone} · ${screen.title}${screen.presentation === 'sheet' ? ' · 바텀 시트' : ''}</a></th><td>${(SCREEN_COMPONENTS[screen.view] || []).map((id) => `<a href="#${id}">${displayNames.get(id) || id}</a>`).join(' · ')}</td></tr>`).join('')}</tbody></table></div></section>`;
const groups = CATALOG_GROUPS.map(
  (group) =>
    `<section class="catalog-group" id="group-${group.id}"><h2 class="catalog-group-title">${group.title}</h2>${group.sections.map((id) => bySection.get(id) || '').join('')}</section>`,
).join('');
document.getElementById('catalog').innerHTML =
  inventory + groups + coverage + matrix;
const sectionTitles = new Map(
  [...document.querySelectorAll('.catalog-section')].map((el) => [
    el.id,
    el.querySelector('h2').textContent,
  ]),
);
document.getElementById('component-nav').innerHTML =
  CATALOG_GROUPS.map(
    (group) =>
      `<div class="catalog-nav-group"><a class="catalog-nav-title" href="#group-${group.id}">${group.title}</a>${group.sections.map((id) => `<a href="#${id}">${sectionTitles.get(id)}</a>`).join('')}</div>`,
  ).join('') +
  '<div class="catalog-nav-group"><a href="#unit-index">재사용 기준</a><a href="#screen-components">화면별 공유 구성</a><a href="#f1-states">F1 화면 상태</a></div>';
document
  .getElementById('catalog-width')
  .addEventListener('change', (event) =>
    document.body.style.setProperty(
      '--sample-width',
      event.target.value + 'px',
    ),
  );
document
  .getElementById('catalog-large')
  .addEventListener('change', (event) =>
    document.body.classList.toggle('large', event.target.checked),
  );
document.addEventListener('click', (event) => {
  if (event.target.closest('[data-action]'))
    document.getElementById('catalog-feedback').textContent =
      '컴포넌트 표시 예시입니다. API를 호출하거나 계정·약속을 변경하지 않았어요.';
});

// 목차 예시는 화면 이동·제출을 수행하지 않고 표시와 선택만 확인한다.
document.addEventListener('submit', (event) => {
  event.preventDefault();
  document.getElementById('catalog-feedback').textContent =
    '입력 표시 예시입니다. 서버에 전송하지 않았어요.';
});
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-screen],a[data-action]');
  if (link) {
    event.preventDefault();
    document.getElementById('catalog-feedback').textContent =
      '화면 이동 링크의 표시 예시입니다. 실제 화면은 화면별 디자인 목차에서 확인해 주세요.';
  }
  const category = event.target.closest('.appointment-boxes button');
  if (category)
    category.parentElement
      .querySelectorAll('button')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button === category)),
      );
});

window.PetmateFormControls.refresh();
if (new URLSearchParams(location.search).get('preview') === 'schedule') {
  document.body.classList.add('schedule-preview');
  document.title = '산책 조건 · 승인한 폼';
}
document.addEventListener('input', (event) => {
  const intro = event.target.closest('.schedule-intro');
  if (intro)
    intro.querySelector('output').textContent =
      event.target.value.length + ' / 500';
});
