const params = new URLSearchParams(location.search);
params.delete('mode');
const state = {
  screen:
    params.get('screen') ||
    document.documentElement.dataset.startScreen ||
    'REC-01',
  width: params.get('width') || '390',
  font: params.get('font') || 'normal',
  status: params.get('state') || 'ready',
  discovery: params.get('discovery') || 'searching',
  dog: '보리',
  viewedDog: null,
  candidate: 0,
  received: [0, 1],
  sentInterests: [
    { dog: '보리', candidate: 0 },
    { dog: '콩이', candidate: 1 },
  ],
  matched: false,
  busy: false,
  stack: [],
  likesPage: 1,
  draft: {},
  filters: {},
  guardian:
    params.get('guardian') === 'family'
      ? { profileType: 'family', gender: null }
      : { profileType: 'individual', gender: 'female' },
  guardianActivity: { regionIds: ['locality-demo-mangwon', 'locality-demo-yeonnam'], availableTimeSlots: [{dayOfWeek: 'saturday', startTime: '09:00', endTime: '12:00'}, {dayOfWeek: 'sunday', startTime: '09:00', endTime: '11:00'}] },
  appointmentBox: 'received',
  appointmentId: 'accepted-demo',
  chatId: 'CHAT-01',
  chatDrafts: {},
  appointments: [
    {
      id: 'canceled-demo',
      chatId: 'CHAT-01',
      otherDog: '구름',
      direction: 'sent',
      status: 'canceled',
      date: '2026-10-24',
      startTime: '10:00',
      endTime: '11:00',
      placeText: '망원공원 입구',
      cancellationReason:
        '구름이 컨디션이 좋지 않아 오늘은 쉬어야 할 것 같아요.',
    },
    {
      id: 'accepted-demo',
      chatId: 'CHAT-02',
      otherDog: '두부',
      direction: 'received',
      status: 'accepted',
      date: '2026-10-25',
      startTime: '09:00',
      endTime: '10:00',
      placeText: '망원공원 입구',
      cancellationReason: null,
    },
  ],
  editing: false,
  nickname: '보리네',
  guardianPhoto: false,
  savedDogs: {},
};
const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
const link = (id, text, cls = '', current = false) =>
  `<a class="${cls}" href="?screen=${id}" data-screen="${id}"${current ? ' aria-current="page"' : ''}>${text}</a>`;
const btn = (text, action, cls = 'primary') =>
  ['이전', '닫기'].includes(text)
    ? PetmateUI.button(text, action, 'icon-button', false, {
        icon: text === '이전' ? 'arrow-left' : 'x',
        iconOnly: true,
      })
    : PetmateUI.button(text, action, cls);
const field = (name, label, type = 'text', value = '', extra = '') =>
  PetmateUI.field({
    id: 'field-' + name,
    name,
    label,
    type,
    value: type === 'file' ? '' : value,
    extra,
    required: extra.includes('required'),
  });
const choices = (name, label, options, selected = '', required = true) =>
  PetmatePatterns.choiceGroup({
    name,
    label,
    options,
    selected: selected ? [selected] : [],
    required,
  });
const select = (name, label, options, value = '') =>
  PetmatePatterns.control({ id: 'field-' + name, name, label, options, value });
const textarea = (name, label, value = '', max = 500) =>
  PetmatePatterns.control({
    id: 'field-' + name,
    name,
    label,
    type: 'textarea',
    value,
    max,
  });
const notice = (t) => `<div class="notice">${t}</div>`;
const form = (body, text, action) =>
  PetmatePatterns.form({ bodyHtml: body, label: text, action });
const timeFields = (id, start, end) =>
  PetmatePatterns.timeRange({ id, start, end });
const genderFields = (editing = false) =>
  choices(
    'gender',
    '성별',
    genderOptions,
    editing ? state.guardian.gender || '' : '',
  ) +
  PetmateUI.inlineNote(editing ? '최초 저장한 성별은 변경할 수 없어요. 유형을 바꿔도 처음 설정한 성별은 유지돼요.' : '한 번 설정한 성별은 바꿀 수 없어요.');
const DEMO_REGIONS = [
  { id: 'locality-demo-mangwon', name: '망원동' },
  { id: 'locality-demo-yeonnam', name: '연남동' },
  { id: 'locality-demo-hapjeong', name: '합정동' },
  { id: 'locality-demo-seogyo', name: '서교동' },
];
const regionPicker = (selected = [], label = '산책 지역') =>
  PetmatePatterns.regionPicker(
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
        options: DEMO_REGIONS.map((r) => [r.id, r.name]),
        value: '',
      },
    ],
    selected.map((id) => [
      id,
      DEMO_REGIONS.find((r) => r.id === id)?.name || id,
    ]),
    { label },
  );
let regionDraft = [];
function renderSelectedRegions() {
  const target = $('selected-regions');
  if (!target) return;
  target.innerHTML = PetmatePatterns.selectedItems(
    regionDraft.map((id) => [
      id,
      DEMO_REGIONS.find((r) => r.id === id)?.name || id,
    ]),
  );
  window.PetmateFormControls?.refresh(target.parentElement);
}
const activityRegions = (ids = state.guardianActivity.regionIds) =>
  ids.map((id) => ({
    id,
    displayName:
      '서울특별시 마포구 ' +
      (DEMO_REGIONS.find((r) => r.id === id)?.name || id),
  }));
const guardianActivityFields = (creating = false) => {
  const activity = creating
    ? state.signupActivity || { regionIds: [], availableTimeSlots: [] }
    : state.guardianActivity;
  regionDraft = [...activity.regionIds];
  return `<section class="guardian-activity">${creating ? '' : '<h3>산책할 수 있는 지역과 시간</h3>'}<p class="muted">저장한 정보로 산책 친구를 추천해요. 여러 반려견이 함께 사용해요.</p>${regionPicker(regionDraft, '주 활동 지역')}${PetmatePatterns.availabilityEditor(activity.availableTimeSlots, creating ? 'signup-activity' : 'guardian-activity')}</section>`;
};
function readAvailability(form) {
  return [...form.querySelectorAll('.availability-chip')].flatMap(chip => JSON.parse(chip.dataset.slots));
}
let activityErrorFocus = null;
function showActivityError(message, editor) {
  const dialog = $('feedback-dialog');
  if (dialog.dataset.activityError) return;
  activityErrorFocus = editor?.querySelector('[data-action="addAvailability"]');
  showF1Feedback('활동 시간을 확인해 주세요', message, [['확인', 'closeActivityFeedback']]);
  dialog.dataset.activityError = 'true';
}
function validateActivity(form, requireRegions = true, requireTime = true) {
  if (requireRegions && !regionDraft.length) {
    form.querySelector('.region-error').textContent =
      '주 활동 지역을 하나 이상 선택해 주세요.';
    return false;
  }
  if (requireTime) {
    const error = form.querySelector('[name="activityDays"]:checked') ? '선택한 시간을 추가하기로 등록해 주세요.' : PetmateActivity.validate(readAvailability(form));
    if (error) { showActivityError(error, form.querySelector('[data-availability-editor]')); return false; }
  }
  return true;
}
// 디자인용 데이터의 조건 적용만 보여준다. 궁합·안전 판단은 실제 서버가 담당한다.
function recommendationCandidates() {
  const regions = state.filters.regionIds?.length
    ? state.filters.regionIds
    : state.guardianActivity.regionIds;
  const slots = state.filters.availableTimeSlots?.length
    ? state.filters.availableTimeSlots
    : state.guardianActivity.availableTimeSlots;
  return DOGS.map((dog, index) => ({ dog, index })).filter(
    ({ dog, index }) =>
      index !== state.filters.passed &&
      dog.guardian.activityRegions.some((r) => regions.includes(r.id)) &&
      PetmateActivity.overlaps(slots, dog.guardian.availableTimeSlots) &&
      [
        ['sizeGroups', dog.sizeGroup],
        ['walkIntensities', dog.preferredWalkIntensity],
        ['unfamiliarDogReactions', dog.unfamiliarDogReaction],
        ['guardianIdentities', dog.guardianIdentity],
      ].every(
        ([key, value]) =>
          !state.filters[key]?.length || state.filters[key].includes(value),
      ),
  );
}
const recommendationSummary = () =>
  `<p class="recommendation-basis">${Object.keys(state.filters).some((key) => key !== 'passed' && state.filters[key]?.length) ? '이번에 지정한 조건으로 찾고 있어요.' : '저장한 활동 지역·시간과 반려견 성향을 바탕으로 추천해요.'}</p>`;
const recommendationEmpty = () =>
  PetmateUI.panel({
    title: '조건에 맞는 친구가 아직 없어요',
    copy: '지역이나 시간·조건을 조정해 보세요. 저장한 정보는 내 정보에서 바꿀 수 있어요.',
    actions: [
      ['조건 조정', 'filters'],
      ['내 정보', 'settings', ''],
    ],
  });
const finderOptions = [
  ['searching', '찾는 중'],
  ['paused', '쉬는 중'],
];
const typeOptions = [
  ['individual', '개인'],
  ['couple', '커플'],
  ['family', '가족'],
];
const genderOptions = [
  ['female', '여성'],
  ['male', '남성'],
];
const finderHelp = notice(
  '찾는 중에는 서로 추천되고 보호자 유형 정보가 표시돼요. 쉬는 중에도 이전에 받은 관심에 응답하고 기존 대화·약속을 이어갈 수 있어요.',
);
const dogSelector = () =>
  PetmatePatterns.dogPicker({
    selected: state.dog,
    options: ['보리', '콩이'],
    photoHtml: photo('picker-photo'),
  });
const tabs = (selected) =>
  PetmatePatterns.navigationTabs(
    [
      ['MATCH-01', '대화'],
      ['LIKES-01', '받은 관심'],
      ['LIKES-SENT', '보낸 관심'],
      ['APPT-LIST', '약속'],
    ],
    {
      matches: 'MATCH-01',
      likes: 'LIKES-01',
      sentLikes: 'LIKES-SENT',
      appointments: 'APPT-LIST',
    }[selected],
  );
const currentAppointment = () =>
  state.appointments.find((a) => a.id === state.appointmentId) ||
  state.appointments[0];
const appointmentCard = (a) =>
  PetmateUI.appointment(
    a,
    state.dog,
    !['CHAT-01', 'CHAT-02'].includes(state.screen),
  );
const photo = (cls = 'dog-photo') =>
  PetmatePatterns.photo({
    src: PHOTO,
    className: cls,
    alt: '하네스를 착용하고 공원에서 산책하는 반려견',
  });
const petName = () => state.draft.name || state.viewedDog || state.dog;
const objectParticle = (name) => {
  const c = name.charCodeAt(name.length - 1);
  return c >= 0xac00 && c <= 0xd7a3
    ? (c - 0xac00) % 28
      ? '이를'
      : '를'
    : '을(를)';
};
const guardianPhoto = () =>
  `<div class="guardian-photo" role="img" aria-label="보호자 사진 자리">보호자 사진${state.guardianPhoto ? ' 선택됨' : ' 영역'}</div>`;
const publicGuardian = (dog) =>
  PetmatePatterns.guardian(
    dog.guardian.nickname,
    dog.identity,
    dog.guardian.photoUrl,
  );
const profile = (dog, received = false, own = false) =>
  PetmatePatterns.dogSummary({
    dog,
    received,
    own,
    photoHtml: photo('hero detail-photo'),
    intro: params.has('long')
      ? '처음에는 충분한 거리를 두고 천천히 인사해요. 익숙해지면 나란히 걸어요. '
          .repeat(20)
          .slice(0, 500)
      : dog.intro,
    introTitle: own
      ? '우리 ' + dog.name + objectParticle(dog.name) + ' 소개해요'
      : '반려견을 소개해요',
    guardianHtml: publicGuardian(dog),
  });
const candidate = (index, received = false) =>
  received
    ? PetmatePatterns.receivedInterest({
        name: DOGS[index].name,
        candidate: index,
        photoHtml: photo(),
        receivedAt: index === 0 ? '10월 22일 오전 9:30' : '10월 22일 오전 8:10',
      })
    : PetmatePatterns.candidate({
        dog: DOGS[index],
        index,
        photoHtml: photo(),
      });
const confirm = (title, copy, action, label) =>
  PetmateUI.confirmation({ title, copy, action, label, danger: true });
const views = {
  login: () =>
    `${photo('hero')}<h2>우리에게 맞는<br>산책 친구를 만나요</h2><p class="muted">반려견의 속도에 맞춰서,즐겁게.</p>${form(field('email', '이메일', 'email', '', 'required autocomplete="username"') + field('password', '비밀번호', 'password', '', 'required autocomplete="current-password"'), '로그인', 'login')}<p>${link('AUTH-02', '처음 오셨나요? 회원가입')}</p>`,
  signup: () =>
    `<h2>함께 걸을 준비</h2><p class="muted">유형·성별·찾기 상태를 직접 선택해 주세요.</p>${form(field('nickname', '닉네임', 'text', '', 'required maxlength="30"') + field('email', '이메일', 'email', '', 'required autocomplete="email"') + field('password', '비밀번호', 'password', '', 'required minlength="8" maxlength="72" autocomplete="new-password"') + field('passwordConfirmation', '비밀번호 확인', 'password', '', 'required maxlength="72" autocomplete="new-password"') + '<p class="muted">8~72자 · 영문 대문자·소문자·숫자·특수문자(! @ # $ % ^ & *) 포함 · 공백 불가</p>' + choices('profileType', '보호자 유형', typeOptions) + '<div id="gender-fields" hidden></div>' + choices('discoveryStatus', '메이트 찾기 상태', finderOptions) + finderHelp + guardianActivityFields(true), '회원가입', 'signup')}<p>${link('AUTH-01', '로그인으로')}</p>`,
  restore: () =>
    `<div class="restoring" role="status" aria-busy="true"><span class="spinner" aria-hidden="true"></span><p>안전하게 로그인 상태를 확인하고 있어요.</p></div>`,
  authError: () =>
    `<h2>로그인할 수 없어요</h2><p role="alert">계정이 제한되어 이용할 수 없어요.</p>${btn('로그인으로', 'loginPage')}`,
  restoreError: () =>
    `<h2>연결을 확인해 주세요</h2><p role="alert">로그인 상태를 확인하지 못했어요.</p><div class="actions">${btn('재시도', 'restore')}${btn('다시 로그인', 'loginPage', '')}</div>`,
  logout: () =>
    confirm(
      '로그아웃할까요?',
      '이 기기에서 로그아웃할까요?',
      'loginPage',
      '로그아웃',
    ),
  withdraw: () =>
    confirm(
      '정말 탈퇴할까요?',
      '탈퇴하면 서비스를 이용할 수 없으며 계정을 복구할 수 없어요.',
      'loginPage',
      '탈퇴',
    ),
  dogEmpty: () =>
    `${PetmateUI.emptyDog()}<p class="empty-dog-links">${link('GUARDIAN-01', '보호자 설정')} · ${link('AUTH-04', '로그아웃')}</p>`,
  dogs: () =>
    `${PetmatePatterns.heading('나의 반려견', '반려견을 누르면 상세 프로필을 볼 수 있어요.')}<div class="dog-list">${['보리', '콩이'].map((name) => PetmatePatterns.dogCard({ name, selected: state.dog === name, photoHtml: photo() })).join('')}</div><div class="actions dog-add-actions">${btn('반려견 추가', 'dogStart')}</div>`,
  dogBasic: () =>
    `${PetmatePatterns.registrationIntro({ current: 1, title: '어떤 친구인가요?', copy: '사진과 기본 정보로 우리 친구를 소개해요.' })}${PetmatePatterns.dogBasicForm({ draft: state.draft, editing: state.editing })}`,
  dogHealth: () =>
    `${PetmatePatterns.registrationIntro({ current: 2, title: '건강하게 함께 걸어요', copy: '몸무게와 건강 상태에 맞춰 산책을 준비해요.' })}${PetmatePatterns.dogHealthForm({ draft: state.draft })}`,
  dogBehavior: () =>
    `${PetmatePatterns.step(3, 4, '성향과 행동')} <h2>${esc(petName())}의 속도</h2>${form(
      PetmatePatterns.intensity({
        value: state.draft.preferredWalkIntensity || '',
      }) +
        select('unfamiliarDogReaction', '낯선 반려견 반응', [
          ['calm', '차분함'],
          ['cautious', '조심스러움'],
          ['excited', '흥분함'],
        ]),
      '다음',
      'stepIntro',
    )}`,
  dogIntro: () =>
    `${PetmatePatterns.step(4, 4, '소개')} <h2>우리의 산책을 소개해요</h2><p class="muted">활동 지역·시간은 내 정보에서 함께 관리해요.</p>${form(textarea('selfIntroduction', '반려견 소개 (최대 500자)', state.draft.selfIntroduction || DOGS[0].intro), state.editing ? '수정 완료' : '등록 완료', 'saveDog')}`,
  dogDetail: () =>
    `${profile({ ...DOGS[0], ...state.savedDogs[state.viewedDog || state.dog], name: state.viewedDog || state.dog }, false, true)}${btn('프로필 수정', 'editDog')}`,
  guardianInfo: () =>
    `<h2>내 정보</h2>${guardianPhoto()}<h3>${esc(state.nickname)}</h3><p>${state.guardian.profileType === 'individual' ? (state.guardian.gender === 'male' ? '개인 · 남성' : '개인 · 여성') : state.guardian.profileType === 'couple' ? '커플' : '가족'}</p><p>메이트 ${state.discovery === 'searching' ? '찾는 중' : '쉬는 중'}</p>${btn('내 정보 수정', 'editGuardian')}<p>${link('AUTH-04', '로그아웃')}</p><p>${link('GUARDIAN-02', '탈퇴하기')}</p>`,
  guardian: () => `<h2>내 정보 수정</h2>${guardianPhoto()}${form(
    field(
      'nickname',
      '닉네임',
      'text',
      state.nickname,
      'required maxlength="30"',
    ) +
      field(
        'guardianPhoto',
        '보호자 사진 (선택)',
        'file',
        '',
        'accept="image/jpeg,image/png,image/webp"',
      ) +
      choices(
        'profileType',
        '보호자 유형',
        typeOptions,
        state.guardian.profileType,
      ) +
      `<div id="gender-fields" ${state.guardian.profileType !== 'individual' ? 'hidden' : ''}>` +
      (state.guardian.profileType === 'individual' ? genderFields(true) : '') +
      '</div>' +
      choices(
        'discoveryStatus',
        '메이트 찾기 상태',
        finderOptions,
        state.discovery,
      ) +
      finderHelp + guardianActivityFields(),
    '저장',
    'saveGuardian',
  )}
    <p>${link('AUTH-04', '로그아웃')}</p><p>${link('GUARDIAN-02', '탈퇴하기')}</p>`,
  recommendations: () => state.discovery === 'paused' ? views.paused() : `<h2>추천 반려견</h2>${dogSelector()}${link('REC-02', '선호 조건')}${recommendationSummary()}${recommendationCandidates().map(({index}) => candidate(index)).join('') || recommendationEmpty()}`,
  filters: () => `${PetmatePatterns.heading('우리에게 맞는 조건')}<p class="muted">이번 추천에만 적용돼요. 내 정보와 반려견 정보는 바뀌지 않아요.</p>${PetmatePatterns.preferenceForm({filters: state.filters, regionHtml: regionPicker(state.filters.regionIds || []), availabilityHtml: PetmatePatterns.availabilityEditor(state.filters.availableTimeSlots || state.guardianActivity.availableTimeSlots, 'filter-activity')})}`,
  detail: () =>
    `${profile(DOGS[state.candidate])}<div class="actions">${btn('패스', 'pass', '')}${btn('관심 있어요', 'like')}</div>`,
  mutual: () =>
    PetmatePatterns.matchResult({
      ownDog: state.dog,
      otherDog: DOGS[state.candidate].name,
      photoHtml: photo(),
      actions: [['목록으로', 'list', ''], ['메시지 보내기', 'chat']],
    }),
  paused: () =>
    PetmatePatterns.resultNotice({
      badge: '쉬는 중',
      title: '지금은 새로운 만남을 쉬고 있어요',
      copy: '나도 추천받지 않고 다른 사람의 추천에도 나오지 않아요.',
      note: '이전에 받은 관심에는 응답할 수 있어요. 연결된 친구와 대화·약속도 계속할 수 있어요.',
      actions: [
        ['받은 관심 보기', 'likes'],
        ['설정에서 재개', 'settings', ''],
      ],
    }),
  appointments: () =>
    `${tabs('appointments')}<h2>산책 약속</h2>${PetmatePatterns.categoryTabs(
      [
        ['sent', '보낸 제안'],
        ['received', '받은 제안'],
        ['accepted', '성사된 약속'],
        ['canceled', '취소된 약속'],
      ],
      state.appointmentBox,
    )}${
      state.appointments
        .filter((a) =>
          state.appointmentBox === 'canceled'
            ? a.status === 'canceled'
            : state.appointmentBox === 'accepted'
              ? a.status === 'accepted'
              : !['canceled', 'accepted'].includes(a.status) &&
                a.direction === state.appointmentBox,
        )
        .map(appointmentCard)
        .join('') || '<p>아직 이 분류의 약속이 없어요.</p>'
    }`,
  matches: () =>
    `${tabs('matches')}<h2>함께 걷는 친구</h2>${[
      ['CHAT-01', '구름', '내가 제안한 약속 · 상대가 취소했어요'],
      ['CHAT-02', '두부', '받은 제안 · 약속이 성사됐어요'],
    ]
      .map(([id, name, text]) =>
        PetmatePatterns.conversationCard({
          name,
          copy: text,
          screen: id,
          photoHtml: photo(),
        }),
      )
      .join('')}`,
  likes: () =>
    `${tabs('likes')}<h2>${esc(state.dog)}에게 온 관심</h2>${dogSelector()}<p class="muted">찾기 상태와 상관없이 이전 관심에 응답할 수 있어요.</p>${
      state.received.length
        ? state.received
            .slice(0, state.likesPage)
            .map((i) => candidate(i, true))
            .join('')
        : '<p>아직 받은 관심이 없어요.</p>'
    }${state.likesPage < state.received.length ? btn('관심 더 보기', 'nextLikes', '') : ''}`,
  sentLikes: () =>
    `${tabs('sentLikes')}<h2>보낸 관심</h2>${dogSelector()}<p class="muted">상대의 응답을 기다리고 있어요. 보낸 관심을 취소할 수 있어요.</p>${
      state.sentInterests
        .filter((item) => item.dog === state.dog)
        .map(
          (item) =>
            `${PetmatePatterns.sentInterest({ name: DOGS[item.candidate].name, candidate: item.candidate, photoHtml: photo() })}`,
        )
        .join('') || '<p>아직 보낸 관심이 없어요.</p>'
    }`,
  likeDetail: () =>
    `${profile(DOGS[state.candidate], true)}<div class="actions">${btn('패스', 'receivedPass', '')}${btn('관심 있어요', 'receivedLike')}</div><p class="muted">지금 쉬는 중이어도 이 관심에 응답할 수 있어요.</p>`,
  chat: () => {
    const first = state.chatId === 'CHAT-01';
    const base = state.appointments.find(
      (a) => a.id === (first ? 'canceled-demo' : 'accepted-demo'),
    );
    const proposed = appointmentCard({
      ...base,
      status: 'proposed',
      cancellationReason: null,
      historical: true,
    });
    const accepted = appointmentCard({
      ...base,
      status: 'accepted',
      cancellationReason: null,
      historical: true,
    });
    const history = first
      ? `${PetmatePatterns.message('토요일 오전 10시에 망원공원에서 함께 걸을까요?', true)}${proposed}${PetmatePatterns.message('좋아요! 구름이도 그 시간에 산책해요. 약속 수락했어요.', false)}${accepted}${PetmatePatterns.message('그럼 입구에서 만나요. 처음에는 거리를 두고 인사해요.', true)}${PetmatePatterns.message('네, 좋아요. 그런데 오늘 구름이 컨디션이 좋지 않아서 쉬어야 할 것 같아요. 미안하지만 약속을 취소할게요.', false)}${appointmentCard(base)}`
      : `${PetmatePatterns.message('일요일 오전 9시에 망원공원에서 산책할까요?', false)}${proposed}${PetmatePatterns.message('좋아요! 두부와 함께 걸어요. 약속 수락했어요.', true)}${appointmentCard(base)}${PetmatePatterns.message('좋아요. 입구에서 천천히 인사하고 같이 걸어요!', false)}`;
    return `<p class="muted">${esc(state.dog)} ↔ ${first ? '구름' : '두부'}</p><div id="chat-appointments">${history}${state.appointments
      .filter((a) => a.chatId === state.chatId && a.id !== base.id)
      .map(appointmentCard)
      .join(
        '',
      )}</div><div id="messages"></div>${PetmatePatterns.composer({ value: state.chatDrafts[state.chatId] || '' })}`;
  },
  chatSettings: () =>
    PetmatePatterns.actionMenu({
      title: '채팅 설정',
      items: [
        ['MATCH-CLOSE-01', '매칭 종료', true],
        ['SAFE-01', '차단', true],
        ['SAFE-02', '신고'],
      ],
    }),
  sent: () => PetmatePatterns.interestSent({ name: DOGS[state.candidate].name }),
  close: () =>
    confirm(
      '매칭을 종료할까요?',
      '이 대화에서 메시지를 조회하거나 보낼 수 없게 돼요. 차단·신고와는 달라요.',
      'matches',
      '매칭 종료',
    ),
  appointment: () =>
    `<h2>약속 제안</h2>${PetmatePatterns.proposalForm({ idPrefix: 'proposal', start: '10:00', end: '11:00' })}`,
  receivedAppointment: () => views.chat(),
  acceptedAppointment: () =>
    appointmentCard({ ...currentAppointment(), status: 'accepted' }),
  cancelAppointment: () =>
    `<h2>약속을 취소할까요?</h2>${form(textarea('reason', '취소 사유'), '취소 확인', 'cancelAppointment')}`,
  review: () => `<h2>만남 평가</h2>${PetmatePatterns.reviewForm()}`,
  block: () =>
    confirm(
      '보호자를 차단할까요?',
      '관련 추천·채팅 상호작용이 종료돼요.',
      'matches',
      '차단',
    ),
  report: () =>
    `<h2>어떤 일이 있었나요?</h2>${form(
      select('reason', '신고 사유', [
        ['inappropriate_language', '부적절한 언어'],
        ['harassment', '괴롭힘'],
        ['threatening_behavior', '위협적 행동'],
        ['unsafe_dog_handling', '위험한 반려견 관리'],
        ['false_profile', '허위 프로필'],
        ['no_show', '약속 불참'],
        ['other', '기타'],
      ]) +
        '<label>추가 설명 (선택 · 최대 1000자)<textarea name="comment" maxlength="1000"></textarea></label>',
      '신고 제출',
      'report',
    )}`,
};
function closeFilters() {
  $('filter-dialog').close();
  $('filter-content').innerHTML = '';
  window.PreviewNavigation?.update({ screen: 'REC-01', state: state.status });
  params.set('screen', 'REC-01');
  history.replaceState(null, '', '?' + params);
}
function openFilters() {
  const dialog = $('filter-dialog');
  regionDraft = [...(state.filters.regionIds || [])];
  $('filter-content').innerHTML = views
    .filters()
    .replace('<h2>우리에게 맞는 조건</h2>', '');
  renderSelectedRegions();
  $('phone').scrollIntoView({ block: 'center', behavior: 'instant' });
  const rect = $('phone').getBoundingClientRect();
  dialog.style.width = Math.min(350, rect.width - 32) + 'px';
  dialog.style.left = rect.left + rect.width / 2 + 'px';
  dialog.style.top =
    Math.max(20, Math.min(rect.top + rect.height / 2, window.innerHeight / 2)) +
    'px';
  dialog.showModal();
  window.PreviewNavigation?.update({ screen: 'REC-02', state: state.status });
  const shown = $('phone').getBoundingClientRect();
  dialog.style.top =
    Math.min(shown.top + shown.height / 2, window.innerHeight / 2) + 'px';
}
$('feedback-dialog').addEventListener('cancel', (event) => {
  event.preventDefault();
  if ($('feedback-dialog').dataset.activityError) { action('closeActivityFeedback'); return; }
  if (state.screen === 'GUARDIAN-01' && state.status === 'error') return;
  if (state.screen === 'GUARDIAN-EDIT' && state.status === 'conflict') { action('settings'); return; }
  action(state.screen === 'AUTH-03' || (state.screen === 'AUTH-02' && ['result-unknown', 'storage-error'].includes(state.status)) ? 'loginPage' : 'dismissFeedback');
});
$('filter-dialog').addEventListener('cancel', (e) => {
  e.preventDefault();
  closeFilters();
});
function navigate(id) {
  if ($('feedback-dialog').open) $('feedback-dialog').close();
  closePopup();
  if ($('filter-dialog').open) closeFilters();

  if (id !== state.screen) state.stack.push(state.screen);
  state.screen = id;
  state.status = 'ready';
  state.busy = false;
  params.set('screen', id === 'REC-02' ? 'REC-01' : id);
  params.set('state', 'ready');
  params.delete('saved');
  history.replaceState(null, '', '?' + params);
  render();
}
const popupBases = {
  'AUTH-04': 'GUARDIAN-01',
  'GUARDIAN-02': 'GUARDIAN-01',
  'MATCH-CLOSE-01': 'CHAT-01',
  'SAFE-01': 'CHAT-01',
  'CHAT-SETTINGS': 'CHAT-01',
  'REC-SENT': 'REC-01',
  'REC-04': 'REC-03',
  'APPT-01': 'CHAT-01',
  'APPT-03': 'CHAT-01',
  'APPT-04': 'CHAT-01',
  'SAFE-02': 'CHAT-01',
};
function closePopup() {
  if ($('action-dialog').open) $('action-dialog').close();
  delete $('action-dialog').dataset.previewScreen;
  window.PreviewNavigation?.update({ screen: state.screen, state: 'ready' });
}
function openPopup(id) {
  const screen = SCREENS.find((x) => x.id === id);
  $('action-content').innerHTML = views[screen.view]();
  const dialog = $('action-dialog');
  dialog.dataset.presentation = screen.presentation === 'sheet' ? 'sheet' : 'alert';
  dialog.setAttribute('aria-label', screen.title);
  if (dialog.dataset.presentation === 'sheet' && id !== 'REC-04') {
    const heading = $('action-content').querySelector('h2');
    const title = heading?.textContent || screen.title;
    heading?.remove();
    $('action-content').insertAdjacentHTML(
      'afterbegin',
      PetmatePatterns.sheetHeader(title),
    );
  }
  $('phone').scrollIntoView({ block: 'center', behavior: 'instant' });
  const r = $('phone').getBoundingClientRect();
  dialog.style.width =
    (dialog.dataset.presentation === 'sheet'
      ? r.width
      : Math.min($('action-content').querySelector('.ui-confirm, .feedback-modal') ? 300 : 350, r.width - 32)) + 'px';
  dialog.style.left = r.left + r.width / 2 + 'px';
  dialog.style.top =
    Math.min(r.top + r.height / 2, window.innerHeight / 2) + 'px';
  dialog.style.bottom = 'auto';
  dialog.style.transform = 'translate(-50%, -50%)';
  if (dialog.dataset.presentation === 'sheet') {
    dialog.style.top = 'auto';
    dialog.style.bottom =
      Math.max(0, window.innerHeight - Math.min(r.bottom, window.innerHeight)) +
      'px';
    dialog.style.transform = 'translateX(-50%)';
  }
  dialog.dataset.previewScreen = id;
  window.configureF1States?.(screen);
  window.applyF1State?.(screen, $('action-content'));
  window.PetmateFormControls?.refresh(dialog);
  if (!dialog.open) dialog.showModal();
  // showModal activates the fixed-height export frame; position against that frame.
  const shown = $('phone').getBoundingClientRect();
  dialog.style.maxHeight =
    (id === 'APPT-04'
      ? shown.height
      : Math.min(
          window.innerHeight *
            (dialog.dataset.presentation === 'sheet' ? 0.88 : 0.75),
          shown.height - 48,
        )) + 'px';
  if (dialog.dataset.presentation === 'sheet')
    dialog.style.bottom =
      Math.max(
        0,
        window.innerHeight - Math.min(shown.bottom, window.innerHeight),
      ) + 'px';
  else
    dialog.style.top =
      Math.min(shown.top + shown.height / 2, window.innerHeight / 2) + 'px';
  $('screen-caption').textContent =
    screen.id + ' · ' + screen.milestone + ' · ' + screen.title + (screen.presentation === 'sheet' ? ' · 바텀 시트' : '');
  $('screen-picker').value = id;
  window.PreviewNavigation?.update({
    screen: id,
    state: state.status,
    width: state.width,
    font: state.font,
    discovery: state.discovery,
  });
  if (['AUTH-04', 'GUARDIAN-02'].includes(id))
    $('api-scope').textContent =
      'M1 · 기존 로그아웃·탈퇴 API 서버 검증 기록 있음 · 앱 연동 대기';
}
$('action-dialog').addEventListener('cancel', (e) => {
  e.preventDefault();
  closePopup();
});
function render() {
  $('header').inert = false;
  $('footer').inert = false;
  if (state.screen === 'APPT-02') {
    state.screen = 'CHAT-02';
    render();
    return;
  }

  if (popupBases[state.screen]) {
    const id = state.screen;
    const popupStatus = state.status;
    state.status = 'ready';
    state.screen = popupBases[id] === 'CHAT-01' ? state.chatId : popupBases[id];
    render();
    state.status = popupStatus;
    openPopup(id);
    return;
  }

  if (state.screen === 'REC-02') {
    state.screen = 'REC-01';
    render();
    openFilters();
    return;
  }
  if (['CHAT-01', 'CHAT-02'].includes(state.screen))
    state.chatId = state.screen;
  const screen = SCREENS.find((s) => s.id === state.screen) || SCREENS[0];
  const retainedInputs =
    $('phone').dataset.previewScreen === screen.id
      ? [
          ...$('content').querySelectorAll(
            'form input:not([type="file"]):not([type="radio"]):not([type="checkbox"]):not([type="range"]), form textarea, form select',
          ),
        ].map((el) => [el.id, el.name, el.value])
      : [];
  $('phone').dataset.previewScreen = screen.id;
  state.screen = screen.id;
  document.body.className = [
    state.font === 'large' ? 'large' : '',
    params.has('export') ? 'export' : '',
  ].join(' ');
  $('phone').style.setProperty('--phone-width', state.width + 'px');
  $('phone').dataset.view = screen.view;
  $('phone').dataset.state = state.status;
  $('api-scope').textContent = [
    'AUTH-01',
    'AUTH-03',
  ].includes(screen.id)
    ? 'M1 · 기존 인증 API 서버 검증 기록 있음 · 앱 연동 대기'
    : ['AUTH-02', 'GUARDIAN-01', 'GUARDIAN-EDIT'].includes(screen.id)
      ? 'M1 · 기존 유형·찾기 상태 검증 기록 있음 / 보호자 프로필·지역·시간 계약 구현 대기'
      : '후속 API 구현·검증 대기 · 디자인 예시';
  $('screen-caption').textContent =
    screen.id +
    ' · ' +
    screen.milestone +
    ' · ' +
    screen.title +
    (screen.dependencies ? ' · 연계 ' + screen.dependencies : '');
  $('screen-picker').innerHTML =
    (screen.kind === 'state'
      ? `<option value="${screen.id}" selected disabled>공통 상태 · ${screen.title}</option>`
      : '') +
    SCREENS.filter((s) => s.kind !== 'state')
      .map(
        (s) =>
          `<option value="${s.id}" ${s.id === screen.id ? 'selected' : ''}>${s.milestone} · ${s.id} · ${s.title}${s.presentation === 'sheet' ? ' · 바텀 시트' : ''}</option>`,
      )
      .join('');
  $('screen-list').innerHTML = SCREENS.filter((s) => s.kind !== 'state')
    .map(
      (s) =>
        `<a href="?screen=${s.id}" data-screen="${s.id}" ${s.id === screen.id ? 'aria-current="page"' : ''}>${s.milestone} · ${s.id} · ${s.title}${s.presentation === 'sheet' ? ' · 바텀 시트' : ''}</a>`,
    )
    .join('');
  $('header').hidden = screen.tab === 'auth';
  $('header').innerHTML = PetmatePatterns.header({
    leftHtml: btn('이전', 'back', ''),
    titleHtml: `<h1>${state.editing && screen.id.startsWith('DOG-0') && ['DOG-02', 'DOG-03', 'DOG-04', 'DOG-05'].includes(screen.id) ? screen.title.replace('등록', '수정') : screen.id === 'CHAT-01' ? '구름' : screen.id === 'CHAT-02' ? '두부' : screen.title}</h1>`,
    rightHtml: ['CHAT-01', 'CHAT-02'].includes(state.screen)
      ? link('CHAT-SETTINGS', '채팅 설정')
      : '',
  });
  let html = views[screen.view]();
  $('content').innerHTML = html;
  window.configureF1States?.(screen);
  const previewForm =
    screen.view === 'chat' ? null : $('content').querySelector('form');
  const previewField = previewForm?.querySelector(
    'input:not([type="file"]):not([type="radio"]):not([type="checkbox"]), select, textarea',
  );
  const supportedStates = {
    'field-error': Boolean(previewField),
    submitting: Boolean(previewForm?.querySelector('button[type="submit"]')),
    'chat-error': screen.view === 'chat',
    'chat-long': screen.view === 'chat',
  };
  for (const option of $('state').options) {
    option.disabled = supportedStates[option.value] === false;
  }
  const unsupported = supportedStates[state.status] === false;
  if (unsupported) state.status = 'ready';
  $('state-help').textContent =
    (unsupported
      ? '요청한 상태는 이 화면에 적용되지 않아 기본 상태로 표시합니다. '
      : '') +
    '필드 오류·제출 중은 폼 화면, 연결·전송 실패는 채팅에서 확인할 수 있어요. 적용할 수 없는 항목은 비활성화됩니다.';
  const f1FormError =
    window.applyF1State &&
    screen.milestone === 'F1' &&
    state.status === 'error' &&
    (previewForm || screen.id === 'GUARDIAN-01');
  if (['loading', 'empty', 'error'].includes(state.status) && !f1FormError && !(screen.id === 'GUARDIAN-01' && state.status === 'loading')) {
    const empty = {
      recommendations: [
        '아직 맞는 친구가 없어요',
        '선호 조건이나 기준 반려견을 바꿔서 다시 찾아보세요.',
        '선호 조건 보기',
        'filters',
      ],
      dogs: [
        '등록된 반려견이 없어요',
        '반려견을 등록하고 함께 걸을 친구를 찾아보세요.',
        '반려견 등록',
        'dogStart',
      ],
      matches: [
        '아직 연결된 친구가 없어요',
        '서로 관심을 보내면 여기에서 대화를 시작할 수 있어요.',
        '추천 보기',
        'list',
      ],
      likes: [
        '아직 받은 관심이 없어요',
        '관심이 도착하면 여기에서 확인할 수 있어요.',
        '기본 화면으로',
        'ready',
      ],
      chat: [
        '첫 인사를 건네 보세요',
        '상대 반려견의 속도에 맞춰 천천히 대화를 시작해요.',
        '대화로 돌아가기',
        'ready',
      ],
    }[screen.view] || [
      '아직 표시할 내용이 없어요',
      '이 상태는 목록의 빈 결과를 확인하는 디자인 예시예요.',
      '기본 화면으로',
      'ready',
    ];
    html =
      state.status === 'loading'
        ? PetmateUI.panel({
            title: '불러오는 중이에요',
            copy: '잠시만 기다려 주세요.',
            busy: true,
          })
        : state.status === 'empty'
          ? PetmateUI.panel({
              title: empty[0],
              copy: empty[1],
              actions: [[empty[2], empty[3]]],
            })
          : PetmateUI.panel({
              title: '불러오지 못했어요',
              copy: '연결을 확인한 뒤 다시 시도해 주세요.',
              actions: [['재시도', 'ready']],
            });
  }
  if (screen.id === 'GUARDIAN-01' && ['loading', 'error'].includes(state.status)) html = '';
  $('content').innerHTML = html;
  if (state.status === 'field-error') {
    const input = $('content').querySelector('form .sun-field input:not([type="file"]), form .sun-field select, form .sun-field textarea');
    if (input) showFieldError(input);
  }
  if (state.status === 'submitting' && !['AUTH-01', 'AUTH-02', 'GUARDIAN-EDIT'].includes(screen.id)) {
    const form = $('content').querySelector('form');
    if (form) {
      form.setAttribute('aria-busy', 'true');
      form
        .querySelectorAll('input,select,textarea,button')
        .forEach((el) => (el.disabled = true));
      form.querySelector('button[type="submit"]').textContent =
        '처리 중이에요…';
      form.insertAdjacentHTML(
        'beforeend',
        '<p role="status" class="muted">잠시만 기다려 주세요.</p>',
      );
    }
  }
  if (state.status === 'chat-error' && screen.view === 'chat') {
    $('messages').innerHTML =
      PetmatePatterns.message('조금 일찍 도착할 것 같아요.', true) +
      PetmatePatterns.messageFailure();
    $('content').querySelector('button[type="submit"]').disabled = true;
  }
  $('content').scrollTop = 0;
  $('footer').hidden = screen.tab === 'auth';
  $('footer').innerHTML = PetmatePatterns.bottomTabs(
    [
      [
        screen.milestone === 'F1' ? 'F1-REC' : 'REC-01',
        '추천',
        'recommendations',
        'paw-print',
      ],
      [
        screen.milestone === 'F1' ? 'F1-MATCH' : 'MATCH-01',
        '매칭',
        'matches',
        'chat-circle',
      ],
      [
        screen.milestone === 'F1' ? 'F1-DOG' : 'DOG-01',
        '내 반려견',
        'dogs',
        'dog',
      ],
      ['GUARDIAN-01', '내 정보', 'guardian', 'user'],
    ],
    screen.tab,
    true,
  );
  ['width', 'font', 'discovery'].forEach((k) => ($(k).value = state[k]));
  $('state').value = state.status;
  if (screen.view === 'guardian') lockGender();
  if (state.editing && screen.view === 'dogBasic') {
    const input = document.querySelector('[name="photo"]');
    input.required = false;
    input.insertAdjacentHTML(
      'afterend',
      '<small>사진을 선택하지 않으면 기존 사진을 유지해요.</small>',
    );
  }
  if (
    ['dogBasic', 'dogHealth', 'dogBehavior', 'dogIntro'].includes(screen.view)
  ) {
    for (const el of $('content').querySelectorAll('input,select,textarea')) {
      if (el.type === 'file') continue;
      const v = state.draft[el.name];
      if (v === undefined) continue;
      if (el.type === 'radio') el.checked = el.value === v;
      else el.value = v;
    }
  }
  for (const [id, name, value] of retainedInputs) {
    const input = id ? $(id) : $('content').querySelector(`[name="${name}"]`);
    if (input) input.value = value;
  }
  if ((['AUTH-01', 'AUTH-02', 'GUARDIAN-EDIT'].includes(screen.id) && state.status === 'submitting') || (screen.id === 'GUARDIAN-EDIT' && state.status === 'photo-uploading') || (screen.id === 'GUARDIAN-01' && state.status === 'loading')) {
    for (const child of $('content').children) child.inert = true;
    $('header').inert = true;
    $('footer').inert = true;
    $('content').insertAdjacentHTML('beforeend', `<div class="login-loading-overlay" role="status" aria-label="${screen.id === 'AUTH-01' ? '로그인 중' : screen.id === 'AUTH-02' ? '가입 중' : screen.id === 'GUARDIAN-01' ? '내 정보 조회 중' : state.status === 'photo-uploading' ? '사진 업로드 중' : '저장 중'}"><span class="spinner" aria-hidden="true"></span></div>`);
  }
  window.applyF1State?.(screen, $('content'));
  window.decorateDesign?.(screen);
  window.PetmateFormControls?.refresh($('phone'));
  window.PreviewNavigation?.update({
    screen: screen.id,
    state: state.status,
    width: state.width,
    font: state.font,
    discovery: state.discovery,
  });
}
function lockGender() {
  document
    .querySelectorAll('[name=gender]')
    .forEach((el) => (el.disabled = state.guardian.gender !== null));
}
function action(name) {
  if (name === 'closeActivityFeedback') {
    const dialog = $('feedback-dialog');
    dialog.close();
    delete dialog.dataset.activityError;
    activityErrorFocus?.focus();
    activityErrorFocus = null;
    return;
  }
  if (name === 'retryConflict') {
    navigate('GUARDIAN-01');
    state.status = 'loading';
    render();
    setTimeout(() => { if (state.screen === 'GUARDIAN-01' && state.status === 'loading') { state.status = 'ready'; render(); } }, 300);
    return;
  }
  if (name === 'retryPhoto') {
    $('feedback-dialog').close();
    state.status = 'ready';
    params.delete('saved');
    params.set('state', 'ready');
    history.replaceState(null, '', '?' + params);
    $('content').querySelector('[data-photo-toggle]').click();
    return;
  }
  if (name === 'retryGuardian' || name === 'retryGuardianLoad') {
    $('feedback-dialog').close();
    if (name === 'retryGuardian') {
      state.status = 'ready';
      $('content').querySelector('form').requestSubmit();
    } else {
      state.status = 'loading';
      render();
      setTimeout(() => { if (state.screen === 'GUARDIAN-01' && state.status === 'loading') { state.status = 'ready'; render(); } }, 300);
    }
    return;
  }
  if (name === 'dismissFeedback') {
    $('feedback-dialog').close();
    state.status = 'ready';
    params.delete('saved');
    params.set('state', 'ready');
    history.replaceState(null, '', '?' + params);
    render();
    return;
  }
  if (name === 'ready' && $('action-dialog').open) {
    state.status = 'ready';
    openPopup($('action-dialog').dataset.previewScreen);
    return;
  }
  if (name === 'addAvailability') {
    const editor = document.querySelector('dialog[open] [data-availability-editor]') || document.querySelector('#content [data-availability-editor]');
    const row = editor.querySelector('[data-availability-row]');
    const slots = [...row.querySelectorAll('[name="activityDays"]:checked')].map(input => ({dayOfWeek:input.value,startTime:row.querySelector('[name="startTime"]').value,endTime:row.querySelector('[name="endTime"]').value}));
    const error = !slots.length ? '요일을 선택해 주세요.' : PetmateActivity.validate([...readAvailability(editor),...slots]);
    if (error) { showActivityError(error, editor); return; }
    editor.querySelector('.availability-chips').insertAdjacentHTML('beforeend', PetmatePatterns.availabilityChip(slots));
    editor.querySelector('[data-availability-rows]').innerHTML = PetmatePatterns.availabilityRow({}, 'activity-draft-' + Date.now());
    editor.querySelectorAll('[name="startTime"], [name="endTime"]').forEach(input => input.value = '');
    window.PetmateFormControls?.refresh(editor);
    return;
  }
  if (name === 'addRegion') {
    const id = (document.querySelector('dialog[open] [name=locality]') || document.querySelector('#content [name=locality]')).value;
    if (!id) {
      $('region-error').textContent = '읍·면·동을 선택해 주세요.';
      return;
    }
    if (regionDraft.includes(id)) {
      $('region-error').textContent = '이미 선택한 지역이에요.';
      return;
    }
    if (regionDraft.length >= 3) {
      $('region-error').textContent = '지역은 최대 3개까지 선택할 수 있어요.';
      return;
    }
    regionDraft.push(id);
    $('region-error').textContent = '';
    renderSelectedRegions();
    return;
  }
  if (name.startsWith('removeRegion:')) {
    regionDraft = regionDraft.filter((id) => id !== name.split(':')[1]);
    $('region-error').textContent = '';
    renderSelectedRegions();
    return;
  }

  if (name.startsWith('appointmentBox:')) {
    state.appointmentBox = name.split(':')[1];
    render();
    return;
  }
  if (
    name.startsWith('appointmentAccept:') ||
    name.startsWith('appointmentReject:')
  ) {
    const [operation, id] = name.split(':');
    state.appointmentId = id;
    const a = currentAppointment();
    if (a.status !== 'proposed' || a.direction !== 'received') return;
    a.status = operation === 'appointmentAccept' ? 'accepted' : 'rejected';
    if (a.status === 'accepted' && state.screen === 'APPT-LIST')
      state.appointmentBox = 'accepted';
    render();
    return;
  }
  if (name.startsWith('appointmentCancel:')) {
    state.appointmentId = name.split(':')[1];
    navigate('APPT-03');
    return;
  }
  if (name.startsWith('appointmentChat:')) {
    state.appointmentId = name.split(':')[1];
    navigate(currentAppointment().chatId);
    return;
  }

  if (name === 'closePopup') {
    closePopup();
    return;
  }
  if (name === 'sentDone') {
    closePopup();
    navigate('REC-01');
    return;
  }
  if (name === 'editGuardian') {
    navigate('GUARDIAN-EDIT');
    return;
  }
  if (name === 'saveDog') {
    const name = state.draft.name || petName();
    state.savedDogs[name] = {
      ...state.draft,
      name,
      intro: state.draft.selfIntroduction || DOGS[0].intro,
    };
    state.viewedDog = name;
    navigate('DOG-06');
    return;
  }

  if (name === 'closeFilters') {
    closeFilters();
    return;
  }
  if (name.startsWith('openDog:')) {
    state.viewedDog = name.slice('openDog:'.length);
    navigate('DOG-06');
    return;
  }

  if (name === 'editDog') {
    state.editing = true;
    state.draft = {
      name: state.viewedDog || state.dog,
      breed: 'mixed_breed',
      birthDate: '',
      sex: 'male',
      weightKg: '12',
      sizeGroup: 'medium',
      health0: 'true',
      health1: 'true',
      health2: 'true',
      preferredWalkIntensity: 'moderate',
      unfamiliarDogReaction: 'calm',
      selfIntroduction: DOGS[0].intro,
    };
    Object.assign(
      state.draft,
      state.savedDogs[state.viewedDog || state.dog] || {},
    );
  } else if (name === 'dogStart') {
    state.editing = false;
    state.draft = {};
  }

  const map = {
    loginPage: 'AUTH-01',
    restore: 'AUTH-03',
    dogStart: 'DOG-02',
    stepHealth: 'DOG-03',
    stepBehavior: 'DOG-04',
    stepIntro: 'DOG-05',
    saveDog: 'DOG-06',
    editDog: 'DOG-02',
    applyFilters: 'REC-01',
    filters: 'REC-02',
    chat: state.chatId,
    likes: 'LIKES-01',
    matches: 'MATCH-01',
    settings: 'GUARDIAN-01',
    recommendations: 'REC-01',
    propose: 'APPT-02',
    accept: 'APPT-ACCEPTED',
    cancelAppointment: 'CHAT-01',
  };
  if (name.startsWith('selectDog:')) {
    state.dog = name.split(':')[1];
    render();
    return;
  }
  if (name === 'back') {
    const prev = state.stack.pop() || 'REC-01';
    state.screen = prev;
    params.set('screen', prev);
    history.replaceState(null, '', '?' + params);
    render();
    return;
  }
  if (name.startsWith('cancelSentInterest:')) {
    const candidate = Number(name.split(':')[1]);
    state.sentInterests = state.sentInterests.filter(
      (item) => !(item.dog === state.dog && item.candidate === candidate),
    );
    render();
    return;
  }
  if (name === 'nextLikes') {
    state.likesPage++;
    render();
    return;
  }
  if (name === 'ready') {
    state.status = 'ready';
    render();
    return;
  }
  if (name === 'list') {
    navigate(state.fromLikes ? 'LIKES-01' : 'REC-01');
    return;
  }
  if (name === 'like' && state.discovery === 'paused') {
    navigate('REC-PAUSED');
    return;
  }
  if (/^received(Like|Pass):/.test(name)) {
    state.candidate = Number(name.split(':')[1]);
    name = name.split(':')[0];
  }
  if (['receivedLike', 'receivedPass'].includes(name)) {
    state.received = state.received.filter((i) => i !== state.candidate);
    state.fromLikes = true;
    navigate(name === 'receivedLike' ? 'REC-04' : 'LIKES-01');
    return;
  }
  if (name === 'like') {
    if (
      !state.sentInterests.some(
        (item) => item.dog === state.dog && item.candidate === state.candidate,
      )
    )
      state.sentInterests.push({ dog: state.dog, candidate: state.candidate });
    state.fromLikes = false;
    navigate('REC-SENT');
    return;
  }
  if (name === 'pass') {
    state.filters.passed = state.candidate;
    navigate('REC-01');
    return;
  }
  if (name === 'reject' || name === 'report' || name === 'review') {
    $('content').innerHTML =
      '<h2>제출 완료</h2>'.replace(
        '제출 완료',
        name === 'reject' ? '약속을 거절했어요' : '제출했어요',
      ) + btn('대화로', 'chat');
    return;
  }
  if (map[name]) navigate(map[name]);
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-screen]');
  if (a) {
    e.preventDefault();
    if (a.dataset.candidate !== undefined) {
      state.candidate = Number(a.dataset.candidate);
      state.receivedDetail = a.dataset.received === 'true';
    }
    navigate(a.dataset.screen);
    return;
  }
  const b = e.target.closest('[data-action]');
  if (b) {
    e.preventDefault();
    if (b.dataset.action === 'removeAvailabilityChip') { b.closest('.availability-chip').remove(); return; }
    action(b.dataset.action);
  }
});
document.addEventListener('change', (e) => {
  const activityEditor = e.target.closest('[data-availability-editor]');
  if (activityEditor) activityEditor.querySelector('.activity-error').textContent = '';
  if (['overrideRegions', 'overrideAvailability'].includes(e.target.name)) {
    const group = e.target.form.querySelector(e.target.name === 'overrideRegions' ? '[data-region-override]' : '[data-time-override]');
    group.disabled = !e.target.checked;
    group.hidden = !e.target.checked;
  }
  if (['sido', 'sigungu'].includes(e.target.name)) {
    const sido = document.querySelector('select[name="sido"]');
    const sigungu = document.querySelector('select[name="sigungu"]');
    const locality = document.querySelector('select[name="locality"]');
    if (e.target.name === 'sido') {
      sigungu.value = '';
      sigungu.disabled = !sido.value;
    }
    locality.value = '';
    locality.disabled = !sido.value || !sigungu.value;
  }

  if (e.target.name === 'profileType') {
    const isIndividual = e.target.value === 'individual';
    $('gender-fields').hidden = !isIndividual;
    const editing = state.screen === 'GUARDIAN-EDIT';
    $('gender-fields').innerHTML = isIndividual ? genderFields(editing) : '';
    if (editing) lockGender();
  }
  if (e.target.name === 'dog') {
    state.dog = e.target.value;
    state.received = [0, 1];
    render();
  }
});
document.addEventListener('reset', (event) => {
  if (event.target.dataset.submit !== 'applyFilters') return;
  event.preventDefault();
  regionDraft = [];
  $('filter-content').innerHTML = PetmatePatterns.preferenceForm({ regionHtml: regionPicker(), availabilityHtml: PetmatePatterns.availabilityEditor(state.guardianActivity.availableTimeSlots, 'filter-activity') });
  window.PetmateFormControls?.refresh($('filter-content'));
});
// 필드 가까이에 공통 오류를 표시하고 입력과 접근성 설명을 연결한다.
function showFieldError(input, message = '') {
  const field = input.closest('.sun-field');
  if (!field) return;
  const feedback = field.querySelector('.sun-field-feedback');
  if (!feedback) return;
  const label = field.querySelector('.sun-field-label')?.textContent || '내용';
  const last = label.charCodeAt(label.length - 1);
  const particle = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 ? '을' : '를';
  const copy = message || (input.validity.typeMismatch ? '올바른 이메일을 입력해 주세요.' : input.validity.valueMissing ? `${label}${particle} ${input.tagName === 'SELECT' ? '선택' : '입력'}해 주세요.` : '입력 내용을 확인해 주세요.');
  input.setAttribute('aria-invalid', 'true');
  feedback.dataset.tone = 'error';
  feedback.innerHTML = PetmateUI.errorNotice(copy);
}
document.addEventListener('invalid', (event) => {
  const input = event.target;
  const activityEditor = input.closest('[data-availability-editor]');
  if (activityEditor) {
    event.preventDefault();
    showActivityError('시작·종료 시간을 10분 단위로 확인해 주세요.', activityEditor);
    return;
  }
  if (!input.form) return;
  const group = input.type === 'radio' && input.closest('fieldset');
  if (!input.closest('.sun-field') && !group) return;
  event.preventDefault();
  const firstError = !input.form.querySelector('[aria-invalid="true"]');
  if (group) {
    if (!group.querySelector('.choice-error')) {
      const label = group.querySelector('legend')?.textContent || '항목';
      const error = document.createElement('div');
      error.className = 'choice-error';
      error.innerHTML = PetmateUI.errorNotice(`${label}을 선택해 주세요.`);
      group.append(error);
    }
    input.setAttribute('aria-invalid', 'true');
  } else showFieldError(input);
  if (firstError) input.focus();
}, true);
document.addEventListener('change', (event) => {
  if (event.target.type !== 'radio') return;
  const group = event.target.closest('fieldset');
  group?.querySelector('.choice-error')?.remove();
  group?.querySelectorAll('[aria-invalid="true"]').forEach((input) => input.removeAttribute('aria-invalid'));
});
document.addEventListener('input', (event) => {
  const input = event.target;
  if (!input.matches('.sun-field input[aria-invalid="true"], .sun-field textarea[aria-invalid="true"], .sun-field select[aria-invalid="true"]')) return;
  const feedback = input.closest('.sun-field').querySelector('.sun-field-feedback');
  if (feedback && !feedback.hasAttribute('data-password-confirmation-feedback')) {
    feedback.textContent = '';
    feedback.dataset.tone = '';
    input.removeAttribute('aria-invalid');
  }
});

// Confirmation is an input convenience: compare locally without storing either value.
function validatePasswordConfirmation(form, showFeedback = false) {
  const confirmation = form.elements.namedItem('passwordConfirmation');
  if (!confirmation) return true;
  const password = form.elements.namedItem('password');
  const matches =
    confirmation.value.length > 0 && confirmation.value === password.value;
  const feedback = form.querySelector('[data-password-confirmation-feedback]');
  const reveal = showFeedback || confirmation.value.length > 0;
  confirmation.setAttribute('aria-invalid', String(reveal && !matches));
  if (feedback) {
    const message = !reveal ? '' : matches ? '비밀번호가 일치해요.' : confirmation.value ? '비밀번호가 일치하지 않아요.' : '비밀번호를 한 번 더 입력해 주세요.';
    feedback.innerHTML = reveal && !matches ? PetmateUI.errorNotice(message) : message;
    feedback.dataset.tone = matches ? 'success' : 'error';
  }
  if (!matches && showFeedback && !feedback)
    $('form-error').textContent = '비밀번호가 일치하지 않아요.';
  return matches;
}

document.addEventListener('submit', (e) => {
  e.preventDefault();
  if (state.busy) return;
  const f = e.target;
  if (!f.reportValidity()) return;
  const data = new FormData(f);
  const formError = f.querySelector('[role="alert"].error');
  if (
    ['stepHealth', 'stepBehavior', 'stepIntro', 'saveDog'].includes(
      f.dataset.submit,
    )
  ) {
    for (const [k, v] of data) if (k !== 'photo') state.draft[k] = v;
  }
  if (
    !f.querySelector('[data-availability-editor]') &&
    data.has('startTime') &&
    data.has('endTime') &&
    data.get('startTime') >= data.get('endTime')
  ) {
    formError.textContent = '종료 시간은 시작 시간보다 늦어야 해요.';
    return;
  }
  const name = f.dataset.submit;
  if (data.has('nickname') && !data.get('nickname').trim()) {
    showFieldError(f.elements.namedItem('nickname'), '닉네임을 입력해 주세요.');
    return;
  }
  if (name === 'cancelAppointment') {
    if (!data.get('reason').trim()) {
      formError.textContent = '취소 사유를 입력해 주세요.';
      return;
    }
    const a = currentAppointment();
    a.status = 'canceled';
    a.cancellationReason = data.get('reason').trim();
    state.appointmentBox = 'canceled';
    navigate('APPT-LIST');
    return;
  }
  if (name === 'propose') {
    const a = {
      id: 'sent-' + Date.now(),
      chatId: state.chatId,
      otherDog: state.chatId === 'CHAT-02' ? '두부' : '구름',
      direction: 'sent',
      status: 'proposed',
      date: data.get('date'),
      startTime: data.get('startTime'),
      endTime: data.get('endTime'),
      placeText: data.get('place'),
      cancellationReason: null,
    };
    state.appointments.unshift(a);
    state.appointmentId = a.id;
    state.appointmentBox = 'sent';
    navigate('APPT-LIST');
    return;
  }
  if (name === 'send') {
    $('messages').insertAdjacentHTML(
      'beforeend',
      PetmatePatterns.message(data.get('message'), true),
    );
    state.chatDrafts[state.chatId] = '';
    f.elements.namedItem('message').value = '';
    window.PetmateFormControls?.refresh(f);
    return;
  }
  if (name === 'applyFilters') {
    const useRegions = data.has('overrideRegions'), useTime = data.has('overrideAvailability');
    if (!validateActivity(f, useRegions, useTime)) return;
    const filters = {};
    for (const key of ['sizeGroups', 'walkIntensities', 'unfamiliarDogReactions', 'guardianIdentities']) filters[key] = data.getAll(key);
    if (useRegions) filters.regionIds = [...regionDraft];
    if (useTime) filters.availableTimeSlots = readAvailability(f);
    if (state.filters.passed !== undefined) filters.passed = state.filters.passed;
    state.filters = filters;
    closeFilters(); render(); return;
  }
  if (['signup', 'saveGuardian'].includes(name) && !validateActivity(f)) return;
  if (name === 'saveGuardian') {
    const photoDraft = window.PetmateFormControls?.getPhotoDraft('guardian');
    if (photoDraft?.file && !photoDraft.ready) {
      formError.textContent =
        photoDraft.error || '사진을 불러오는 중이에요. 잠시 후 저장해 주세요.';
      return;
    }
    state.guardianActivity = {regionIds: [...regionDraft], availableTimeSlots: readAvailability(f)};
    state.nickname = data.get('nickname').trim();
    if (data.get('guardianPhoto')?.size || photoDraft?.file)
      state.guardianPhoto = true;
    if (photoDraft?.url) state.guardianPhotoUrl = photoDraft.url;
    state.guardian.profileType = data.get('profileType');
    if (
      state.guardian.profileType === 'individual' &&
      state.guardian.gender === null
    )
      state.guardian.gender = data.get('gender');
    state.discovery = data.get('discoveryStatus');
    state.busy = true;
    state.status = 'submitting';
    render();
    setTimeout(() => {
      if (!state.busy || state.screen !== 'GUARDIAN-EDIT' || state.status !== 'submitting') return;
      navigate('GUARDIAN-01');
    }, 300);
    return;
  }
  if (name === 'signup') {
    if (!validatePasswordConfirmation(f, true)) {
      f.elements.namedItem('passwordConfirmation').focus();
      return;
    }
    const pw = data.get('password');
    if (
      !/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,72}$/.test(
        pw,
      )
    ) {
      showFieldError(f.elements.namedItem('password'), '비밀번호 조건을 확인해 주세요.');
      return;
    }
    state.guardianActivity = {regionIds: [...regionDraft], availableTimeSlots: readAvailability(f)};
    state.signupActivity = state.guardianActivity;
    state.discovery = data.get('discoveryStatus');
    state.nickname = data.get('nickname').trim();
    state.guardian = {
      profileType: data.get('profileType'),
      gender:
        data.get('profileType') === 'individual' ? data.get('gender') : null,
    };
    state.busy = true;
    state.status = 'submitting';
    render();
    setTimeout(() => {
      if (state.busy && state.screen === 'AUTH-02' && state.status === 'submitting') navigate('F1-REC');
    }, 300);
    return;
  }
  if (name === 'login') {
    state.busy = true;
    state.status = 'submitting';
    render();
    setTimeout(() => {
      if (state.busy && state.screen === 'AUTH-01' && state.status === 'submitting')
        navigate('F1-REC');
    }, 300);
    return;
  }
  state.busy = true;
  f.querySelector('button[type=submit]').disabled = true;
  setTimeout(() => {
    state.busy = false;
    action(name);
  }, 250);
});
['width', 'font', 'discovery'].forEach((k) =>
  $(k).addEventListener('change', (e) => {
    const popupId = $('action-dialog').open
      ? $('action-dialog').dataset.previewScreen
      : null;
    const popupStatus = state.status;
    state[k] = e.target.value;
    params.set(k, state[k]);
    history.replaceState(null, '', '?' + params);
    render();
    if (popupId) {
      state.status = popupStatus;
      openPopup(popupId);
    }
  }),
);
$('screen-picker').addEventListener('change', (e) => navigate(e.target.value));
$('state').addEventListener('change', (e) => {
  state.status = e.target.value;
  params.set('state', state.status);
  history.replaceState(null, '', '?' + params);
  if ($('action-dialog').open) {
    const id = $('action-dialog').dataset.previewScreen;
    const selectedStatus = state.status;
    state.status = 'ready';
    render();
    state.status = selectedStatus;
    openPopup(id);
  } else render();
});
views.f1Recommendations ||= () => notice('추천은 F3에서 제공할 예정이에요.');
views.f1Matches ||= () => notice('매칭은 F4에서 제공할 예정이에요.');
views.f1Dogs ||= () => notice('반려견 관리는 F2에서 제공할 예정이에요.');

document.addEventListener('input', (event) => {
  if (event.target.matches('.sun-composer textarea[name="message"]'))
    state.chatDrafts[state.chatId] = event.target.value;
});
