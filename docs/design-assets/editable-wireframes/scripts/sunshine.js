/* 두 미리보기가 함께 읽는 화면 템플릿. 기능·상태는 app.js/F1 상태를 공유하며 테마는 CSS로만 구분한다. */
const sunIcon = PetmateUI.icon;
const sunWordmark = PetmatePatterns.wordmark;
const sunInput = (name, label, type, placeholder, extra = '') =>
  PetmateUI.field({ id: 'sun-' + name, name, label, type, placeholder, extra });
const sunSection = PetmatePatterns.sectionHeading;

views.login = () =>
  `<div class="login-layout">${sunWordmark()}<div class="login-visual">${photo('sun-login-photo')}</div><div class="login-copy"><h2>로그인</h2><p>이메일과 비밀번호를 입력해 주세요.</p></div>${form(sunInput('email', '이메일', 'email', '이메일 주소를 입력해 주세요', 'autocomplete="username"') + sunInput('password', '비밀번호', 'password', '비밀번호를 입력해 주세요', 'autocomplete="current-password"'), '로그인', 'login')}<p class="auth-switch">계정이 없나요? ${link('AUTH-02', '회원가입 ' + sunIcon('arrow-right'))}</p></div>`;

views.signup = () =>
  `<div class="signup-top">${link('AUTH-01', sunIcon('arrow-left') + '<span>로그인으로</span>', 'sun-back')}<span class="brand-mark">${sunIcon('paw-print')}</span></div><div class="signup-copy"><h2>회원가입</h2><p>계정 정보와 보호자 정보를 입력해 주세요.</p></div>${form(
    sunSection('01', '계정 정보', '로그인에 사용할 정보를 입력해 주세요.') +
      sunInput(
        'nickname',
        '닉네임',
        'text',
        '닉네임을 입력해 주세요',
        'maxlength="30" autocomplete="nickname"',
      ) +
      sunInput(
        'email',
        '이메일',
        'email',
        '이메일 주소',
        'autocomplete="email"',
      ) +
      sunInput(
        'password',
        '비밀번호',
        'password',
        '안전한 비밀번호를 입력해 주세요',
        'minlength="8" maxlength="72" autocomplete="new-password"',
      ) +
      '<p class="password-hint">8~72자 · 영문 대문자·소문자·숫자·특수문자(! @ # $ % ^ & *) 포함 · 공백 불가</p>' +
      sunInput(
        'passwordConfirmation',
        '비밀번호 확인',
        'password',
        '비밀번호를 한 번 더 입력해 주세요',
        'maxlength="72" autocomplete="new-password"',
      ) +
      sunSection('02', '보호자 유형', '현재 보호자 유형을 선택해 주세요.') +
      PetmateUI.tiles('profileType', '보호자 유형', F1_PROFILE_OPTIONS) +
      '<div id="gender-fields" hidden></div>' +
      sunSection(
        '03',
        '메이트 찾기 상태',
        '가입 후 내 정보에서 변경할 수 있어요.',
      ) +
      PetmateUI.tiles(
        'discoveryStatus',
        '메이트 찾기 상태',
        F1_DISCOVERY_OPTIONS,
        '',
        'discovery-tiles',
      ) +
      sunSection('04', '활동 지역과 시간', '내 정보에서 언제든 바꿀 수 있어요.') +
      guardianActivityFields(true) +
      PetmateUI.inlineNote(
        '쉬는 중에도 이전에 받은 관심에 응답하고, 이미 연결된 친구와 대화·약속을 이어갈 수 있어요.',
      ),
    '회원가입',
    'signup',
  )}<p class="auth-switch">이미 계정이 있나요? ${link('AUTH-01', '로그인')}</p>`;

const sunCandidate = (i) =>
  PetmatePatterns.candidate({
    dog: DOGS[i],
    index: i,
    photoHtml: photo('sun-candidate-photo'),
  });
views.recommendations = () =>
  state.discovery === 'paused'
    ? views.paused()
    : `<div class="recommendation-intro"><h2>추천 반려견</h2></div><div class="discovery-toolbar">${dogSelector()}${link('REC-02', sunIcon('sliders-horizontal') + '선호 조건', 'filter-trigger')}</div>${recommendationSummary()}<div class="recommendation-feed">${recommendationCandidates().map(({index}) => sunCandidate(index)).join('') || recommendationEmpty()}</div>`;


views.detail = () => {
  const d = DOGS[state.candidate];
  const received = state.receivedDetail || state.screen === 'LIKES-02';
  const intro = params.has('long')
    ? '처음에는 충분한 거리를 두고 천천히 인사해요. 익숙해지면 나란히 걸어요. '
        .repeat(20)
        .slice(0, 500)
    : d.intro;
  return `${PetmatePatterns.dogProfile({
    dog: d,
    photoHtml: photo('sun-detail-photo'),
    intro,
    introTitle: d.name + objectParticle(d.name) + ' 소개해요',
    received,
    factRows: [
      ['기본 정보', '믹스견 · 수컷 · 12kg'],
      ['산책 강도', '보통'],
      ['낯선 친구에게', '차분하게 인사해요'],
      ['건강·안전', '중성화·예방접종·등록 완료'],
    ],
    reasons: ['산책 속도가 비슷해요.', '주말 가능 시간이 겹쳐요.'],
  })}${PetmateUI.actionPair({ leftLabel: received ? '거절' : '패스', leftAction: received ? 'receivedPass' : 'pass', rightLabel: received ? '수락' : '관심 있어요', rightAction: received ? 'receivedLike' : 'like', rightIcon: received ? '' : 'heart', className: 'sun-detail-actions sun-dock' })}`;
};

views.likeDetail = () => views.detail();

// Preserve the two conversations and appointment transitions from the wireframe.
const originalSunChat = views.chat;
views.chat = () => {
  const original = document.createElement('div');
  original.innerHTML = originalSunChat();
  const history = original.querySelector('#chat-appointments').innerHTML;
  return `${PetmatePatterns.chatContext({ dog: state.dog, otherDog: state.chatId === 'CHAT-01' ? '구름' : '두부' })}<div id="chat-appointments" class="sun-conversation">${history}</div><div id="messages" class="sun-conversation"></div>${PetmatePatterns.composer({ availability: state.status === 'chat-error' ? 'reconnecting' : 'ready', value: state.chatDrafts[state.chatId] ?? (state.status === 'chat-long' ? '안녕하세요! 토요일 오전에 망원공원 입구에서 만날까요? 처음에는 충분한 거리를 두고 천천히 인사해요. 익숙해지면 나란히 걸으면 좋겠어요.' : '') })}`;
};

window.decorateDesign = (screen) => {
  const phone = $('phone'),
    content = $('content');
  phone.querySelectorAll(':scope > .sun-dock').forEach((el) => el.remove());
  const dock = content.querySelector('.sun-dock');
  if (dock) phone.insertBefore(dock, $('footer'));
  if (screen.view === 'chat') {
    $('header').innerHTML = PetmatePatterns.header({
      leftHtml: PetmateUI.button('이전', 'back', 'icon-button', false, {
        icon: 'arrow-left',
        iconOnly: true,
      }),
      titleHtml: PetmatePatterns.chatPerson({
        name: state.chatId === 'CHAT-01' ? '구름' : '두부',
        copy: state.dog + '와 연결된 친구',
        photoHtml: photo('chat-avatar'),
      }),
      rightHtml: link(
        'CHAT-SETTINGS',
        sunIcon('dots-three') + '<span class="sr-only">채팅 설정</span>',
        'icon-button',
      ),
    });
  } else if (screen.view === 'recommendations') {
    $('header').innerHTML = PetmatePatterns.header({
      leftHtml: sunWordmark(),
      rightHtml: PetmateUI.button('이전', 'back', 'icon-button', false, {
        icon: 'arrow-left',
        iconOnly: true,
      }),
    });
  } else if (['detail', 'likeDetail'].includes(screen.view)) {
    $('header').innerHTML = PetmatePatterns.header({
      leftHtml: PetmateUI.button('이전', 'back', 'icon-button', false, {
        icon: 'arrow-left',
        iconOnly: true,
      }),
      titleHtml: '<h1>산책 친구</h1>',
      rightHtml: '<span class="header-spacer"></span>',
    });
  }
};
document.documentElement.dataset.capture = params.get('capture') || 'frame';
render();

// Keep feedback next to the confirmation field, including when the first password changes.
document.addEventListener('input', (event) => {
  if (!['password', 'passwordConfirmation'].includes(event.target.name)) return;
  const form = event.target.closest('form[data-submit="signup"]');
  if (form) validatePasswordConfirmation(form);
});
document.addEventListener('focusout', (event) => {
  if (event.target.name !== 'passwordConfirmation') return;
  const form = event.target.closest('form[data-submit="signup"]');
  if (form) validatePasswordConfirmation(form, true);
});
