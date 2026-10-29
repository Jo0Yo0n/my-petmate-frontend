/* F1의 표시 상태만 제어한다. 인증·저장·업로드를 실제로 수행하지 않는다. */
const F1_PROFILE_OPTIONS = [
  ['individual', '개인', 'user', '개인 보호자'],
  ['couple', '커플', 'users', '커플 보호자'],
  ['family', '가족', 'house', '가족 보호자'],
];
const F1_DISCOVERY_OPTIONS = [
  ['searching', '찾는 중', 'sun', '추천과 새로운 관심 보내기'],
  ['paused', '쉬는 중', 'moon', '기존 관심·대화·약속은 유지'],
];
const originalStateOptions = $('state').innerHTML;
window.configureF1States = (screen) => {
  const variants =
    F1_STATES[screen.id] ||
    (screen.id.startsWith('F1-') ? { ready: '후속 기능 안내' } : null);
  $('state').innerHTML = variants
    ? Object.entries(variants)
        .map(([value, label]) => `<option value="${value}">${label}</option>`)
        .join('')
    : originalStateOptions;
  if (variants && !(state.status in variants)) state.status = 'ready';
  $('state').value = state.status;
};
const f1Guardian = () => ({
  ...state.guardian,
  ...(['couple', 'family'].includes(state.status)
    ? { profileType: state.status }
    : {}),
  ...(state.status === 'gender-unset'
    ? { profileType: 'individual', gender: null }
    : {}),
});
views.guardianInfo = () =>
  `${PetmatePatterns.heading('내 정보', '보호자 정보와 산책할 지역·시간을 확인해요.')}${PetmatePatterns.guardianSurface({ nickname: state.nickname, ...state.guardian, discovery: state.discovery, photoUrl: state.guardianPhotoUrl || null, activityRegions: activityRegions(), availableTimeSlots: state.guardianActivity.availableTimeSlots })}<div class="guardian-edit-actions">${btn('내 정보 수정', 'editGuardian', 'guardian-edit')}</div><div class="ui-account-actions">${link('AUTH-04', '로그아웃')}${link('GUARDIAN-02', '탈퇴하기', 'ui-danger-link')}</div>`;
views.guardian = () => {
  const g = f1Guardian();
  return `${PetmatePatterns.heading('내 정보 수정', '사진은 선택 사항이에요. 보호자 정보를 수정해 주세요.')}${form(
    PetmatePatterns.photoEditor({
      idPrefix: 'guardian',
      photoUrl: state.guardianPhotoUrl || null,
    }) +
      PetmateUI.field({
        id: 'sun-nickname',
        name: 'nickname',
        label: '닉네임',
        value: state.nickname,
        extra: 'maxlength="30" autocomplete="nickname"',
      }) +
      PetmateUI.tiles(
        'profileType',
        '보호자 유형',
        F1_PROFILE_OPTIONS,
        g.profileType,
      ) +
      `<div id="gender-fields" ${g.profileType !== 'individual' ? 'hidden' : ''}>${g.profileType === 'individual' ? genderFields(true) : ''}</div>` +
      PetmateUI.tiles(
        'discoveryStatus',
        '메이트 찾기 상태',
        F1_DISCOVERY_OPTIONS,
        state.status === 'paused' ? 'paused' : state.discovery,
        'discovery-tiles',
      ) +
      guardianActivityFields() +
      PetmateUI.inlineNote(
        '쉬는 중에도 이전에 받은 관심에 응답하고, 이미 연결된 친구와 대화·약속을 이어갈 수 있어요.',
      ),
    '저장',
    'saveGuardian',
  )}`;
};
views.restore = () => PetmateUI.loading();
views.logout = () =>
  PetmateUI.confirmation({
    title: '로그아웃할까요?',
    copy: '이 기기에서 로그인 상태를 종료해요.',
    action: 'loginPage',
    label: '로그아웃',
  });
views.withdraw = () =>
  PetmateUI.confirmation({
    title: '탈퇴할까요?',
    copy: '탈퇴 후 서비스를 이용할 수 없으며 계정을 복구할 수 없어요.',
    action: 'loginPage',
    label: '탈퇴',
    danger: true,
  });
const shellPanel = (title, milestone) =>
  PetmateUI.panel({
    title,
    copy: `이 기능은 ${milestone}에서 제공 예정`,
    actions: [['내 정보로', 'settings']],
  });
views.f1Recommendations = () => shellPanel('추천 준비 중', 'F3');
views.f1Matches = () => shellPanel('매칭 준비 중', 'F4');
views.f1Dogs = () => shellPanel('반려견 관리 준비 중', 'F2');
function showF1Feedback(title, copy, actions = [['확인', 'dismissFeedback']]) {
  const dialog = $('feedback-dialog');
  dialog.setAttribute('aria-label', title);
  dialog.innerHTML = PetmateUI.feedbackModal({ title, copy, actions });
  const rect = $('phone').getBoundingClientRect();
  dialog.style.width = Math.min(300, rect.width - 32) + 'px';
  dialog.style.left = rect.left + rect.width / 2 + 'px';
  dialog.style.top = Math.min(rect.top + rect.height / 2, window.innerHeight / 2) + 'px';
  if (!dialog.open) dialog.showModal();
}
window.applyF1State = (screen, target) => {
  if (!F1_STATES[screen.id]) return;
  $('state-help').textContent =
    'F1 화면의 표시 상태입니다. API·인증·저장을 실제로 수행하지 않습니다.';
  const value = state.status;
  if ((screen.id === 'AUTH-01' && ['invalid-credentials', 'account-restricted', 'withdrawn', 'error', 'storage-error'].includes(value)) || (screen.id === 'AUTH-02' && ['error', 'result-unknown', 'storage-error'].includes(value))) {
    const messages = {
      'invalid-credentials': ['로그인하지 못했어요', '이메일 또는 비밀번호를 확인해 주세요.'],
      'account-restricted': ['계정이 정지되어 있어요', '현재 이 계정으로 서비스를 이용할 수 없어요.'],
      withdrawn: ['탈퇴한 계정이에요', '탈퇴한 계정으로는 서비스를 이용할 수 없어요.'],
      error: ['로그인하지 못했어요', '연결을 확인하고 다시 시도해 주세요.'],
      'storage-error': ['로그인하지 못했어요', '다시 로그인해 주세요.'],
    };
    if (screen.id === 'AUTH-02') {
      messages.error = ['가입하지 못했어요', '잠시 후 다시 시도해 주세요.'];
      messages['result-unknown'] = ['가입 여부를 확인할 수 없어요', '로그인해 확인해 주세요.'];
      messages['storage-error'] = ['로그인해 주세요', '가입을 완료했어요. 로그인해 주세요.'];
    }
    showF1Feedback(messages[value][0], messages[value][1], [[
      '확인', screen.id === 'AUTH-02' && value !== 'error' ? 'loginPage' : 'dismissFeedback',
    ]]);
    return;
  }
  if (screen.id === 'AUTH-03' && value !== 'ready') {
    const login = [['로그인으로', 'loginPage']];
    const retry = [['다시 로그인', 'loginPage', ''], ['재시도', 'restore']];
    const messages = {
      'read-error': ['로그인 상태를 확인하지 못했어요', '다시 시도하거나 로그인해 주세요.', retry],
      'refresh-error': ['로그인 상태를 확인하지 못했어요', '연결을 확인한 뒤 다시 시도해 주세요.', retry],
      'storage-error': ['다시 로그인해 주세요', '계속하려면 다시 로그인해 주세요.', login],
      'me-error': ['내 정보를 불러오지 못했어요', '다시 시도해 주세요.', retry],
      'invalid-session': ['다시 로그인해 주세요', '로그인 상태가 종료되었어요.', login],
      expired: ['로그인이 종료되었어요', '계속하려면 다시 로그인해 주세요.', login],
    };
    if (messages[value]) showF1Feedback(...messages[value]);
    return;
  }
  if (screen.id === 'GUARDIAN-01' && value === 'error') {
    showF1Feedback('내 정보를 불러오지 못했어요', '연결을 확인하고 다시 시도해 주세요.', [['재시도', 'retryGuardianLoad']]);
    return;
  }
  if (screen.id === 'GUARDIAN-EDIT' && value === 'conflict') {
    showF1Feedback('저장하지 못했어요', '최신 정보를 확인한 뒤 다시 수정해 주세요.', [['취소', 'settings', ''], ['재시도', 'retryConflict']]);
    return;
  }
  if (screen.id === 'GUARDIAN-EDIT' && ['error', 'photo-error'].includes(value)) {
    const photoOnly = value === 'photo-error' && params.get('saved') === '1';
    showF1Feedback(value === 'error' ? '저장하지 못했어요' : '사진을 올리지 못했어요', photoOnly ? '내 정보는 저장됐지만 사진은 올리지 못했어요.' : '다시 시도해 주세요.', [['취소', 'dismissFeedback', ''], ['재시도', photoOnly ? 'retryPhoto' : 'retryGuardian']]);
    return;
  }
  const isExit = ['AUTH-04', 'GUARDIAN-02'].includes(screen.id);
  if (isExit && value === 'submitting') {
    for (const child of target.children) child.inert = true;
    target.insertAdjacentHTML('beforeend', `<div class="dialog-loading-overlay" role="status" aria-label="${screen.id === 'GUARDIAN-02' ? '탈퇴 중' : '로그아웃 중'}"><span class="spinner" aria-hidden="true"></span></div>`);
    return;
  }
  if (isExit && value !== 'ready') {
    const withdrawal = screen.id === 'GUARDIAN-02';
    const copy = {
      submitting: [
        withdrawal ? '탈퇴 처리 중' : '로그아웃 중',
        '처리가 끝날 때까지 잠시 기다려 주세요.',
      ],
      'server-unconfirmed': [
        '기기에서 로그아웃했어요',
        '기기 로그인 정보는 지웠지만 서버의 로그아웃 처리는 확인하지 못했어요.',
      ],
      'cleanup-error': [
        withdrawal
          ? '탈퇴했지만 기기 정리가 필요해요'
          : '기기 로그아웃을 완료하지 못했어요',
        '로그인 정보 삭제를 다시 시도해 주세요.',
      ],
      'result-unknown': [
        '탈퇴 결과를 확인하지 못했어요',
        '연결이 끊겨 탈퇴 여부가 불명확해요. 계정 상태를 확인하거나 다시 시도해 주세요.',
      ],
      error: [
        '탈퇴하지 못했어요',
        '요청이 거부되었어요. 내용을 확인한 뒤 다시 시도해 주세요.',
      ],
      success: [
        withdrawal ? '탈퇴했어요' : '로그아웃했어요',
        '로그인 화면으로 돌아가 주세요.',
      ],
    }[value];
    $('content').innerHTML = PetmateUI.panel({
      title: '계정 기능을 이용할 수 없어요',
      copy: '로그인 상태 종료 결과를 확인해 주세요.',
    });
    $('footer').hidden = true;
    if (copy)
      target.innerHTML = PetmateUI.panel({
        title: copy[0],
        copy: copy[1],
        busy: value === 'submitting',
        actions:
          value === 'submitting'
            ? []
            : value === 'cleanup-error'
              ? [['기기 정리 재시도', 'ready']]
              : value === 'result-unknown'
                ? [
                    ['계정 상태 확인', 'ready'],
                    ['다시 시도', 'ready', ''],
                  ]
                : value === 'error'
                  ? [
                      ['다시 시도', 'ready'],
                      ['취소', 'closePopup', ''],
                    ]
                  : [['로그인으로', 'loginPage']],
      });
    return;
  }
  if (value === 'submitting') {
    target
      .querySelectorAll('input,select,textarea,button')
      .forEach((el) => (el.disabled = true));
    return;
  }
  if (['duplicate-email', 'password-mismatch'].includes(value)) {
    const name = value === 'duplicate-email' ? 'email' : 'passwordConfirmation';
    const input = target.querySelector(`[name="${name}"]`);
    const feedback = target.querySelector(`#sun-${name}-feedback`);
    input.setAttribute('aria-invalid', 'true');
    feedback.dataset.tone = 'error';
    feedback.innerHTML = PetmateUI.errorNotice(
      value === 'duplicate-email' ? '이미 사용 중인 이메일이에요.' : '비밀번호가 일치하지 않아요.',
    );
  }
  if (value === 'gender-unset') {
    target.querySelectorAll('[name="gender"]').forEach((el) => {
      el.disabled = false;
      el.checked = false;
    });
  }

};

// 최초 개인 설정 예시에서도 유형을 왕복하면 다시 직접 성별을 선택한다.
document.addEventListener('change', (event) => {
  if (
    event.target.name === 'profileType' &&
    event.target.value === 'individual' &&
    state.status === 'gender-unset'
  ) {
    document.querySelectorAll('[name="gender"]').forEach((input) => {
      input.disabled = false;
      input.checked = false;
    });
  }
});
