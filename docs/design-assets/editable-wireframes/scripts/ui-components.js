/* HTML 시안의 공통 표현. API 호출·업무 상태 전이는 app.js가 담당한다. */
const PetmateUI = (() => {
  const escape = (value = '') =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c],
    );
  const icon = (name) =>
    `<span class="sun-icon" style="--icon:url('/docs/design-assets/editable-wireframes/assets/icons/${escape(name)}.svg')" aria-hidden="true"></span>`;
  const button = (
    label,
    action,
    kind = 'primary',
    disabled = false,
    options = {},
  ) => {
    const forward =
      !options.iconOnly &&
      !options.icon &&
      kind === 'primary' &&
      action === 'settings';
    const classes = [
      kind,
      !options.iconOnly && 'ui-button',
      forward && 'ui-button-forward',
    ]
      .filter(Boolean)
      .join(' ');
    return `<button type="${options.submit ? 'submit' : 'button'}" class="${escape(classes)}" ${options.submit ? '' : `data-action="${escape(action)}"`} ${disabled ? 'disabled' : ''}${options.iconOnly ? ` aria-label="${escape(label)}"` : ''}>${options.icon ? icon(options.icon) : ''}${options.iconOnly ? `<span class="sr-only">${escape(label)}</span>` : `<span class="ui-button-label">${escape(label)}</span>`}${forward ? icon('arrow-right') : ''}</button>`;
  };
  const actionPair = ({
    leftLabel = '패스',
    leftAction = 'pass',
    rightLabel = '관심 있어요',
    rightAction = 'like',
    rightIcon = '',
    leftKind = 'pass-action',
    disabled = false,
    className = '',
  } = {}) =>
    `<div class="ui-action-pair ${escape(className)}">${button(leftLabel, leftAction, leftKind, disabled)}${button(rightLabel, rightAction, 'primary', disabled, rightIcon ? { icon: rightIcon } : {})}</div>`;
  const emptyDog = () =>
    `<section class="empty-dog"><div class="empty-dog-art" aria-hidden="true">${icon('paw-print')}<span>첫 산책의 시작</span></div><h2>우리 강아지의<br>산책 친구를 찾아요</h2><p>반려견을 등록하면 성향과 산책 시간이<br>잘 맞는 친구를 만날 수 있어요.</p><ul><li>${icon('user')} 사진과 이름</li><li>${icon('leaf')} 성향과 산책 속도</li><li>${icon('calendar-blank')} 함께 걷는 시간</li></ul><div class="actions">${button('반려견 등록', 'dogStart')}</div></section>`;
  const field = ({
    id,
    name,
    label,
    type = 'text',
    value = '',
    placeholder = '',
    extra = '',
    feedback = '',
    tone = '',
    disabled = false,
    required = true,
  }) =>
    `<label class="sun-field"><span class="sun-field-label" id="${id}-label">${escape(label)}</span><input id="${id}" name="${name}" type="${type}" value="${escape(value)}" placeholder="${escape(placeholder)}" ${required ? 'required' : ''} ${disabled ? 'disabled' : ''} aria-labelledby="${id}-label" aria-describedby="${id}-feedback" ${tone === 'error' ? 'aria-invalid="true"' : ''} ${extra}><span class="sun-field-feedback" id="${id}-feedback" data-tone="${tone}" aria-live="polite" ${name === 'passwordConfirmation' ? 'data-password-confirmation-feedback' : ''}>${tone === 'error' && feedback ? errorNotice(feedback) : escape(feedback)}</span></label>`;
  const errorNotice = (copy) =>
    `<span class="ui-inline-error" role="alert"><span class="appointment-error-icon" aria-hidden="true">!</span><span>${escape(copy)}</span></span>`;
  const inlineNote = (copy) =>
    `<div class="sun-note">${icon('leaf')}<p>${escape(copy)}</p></div>`;
  const loading = (label = '로그인 상태를 확인하고 있어요.') =>
    `<div class="ui-loading" role="status" aria-busy="true"><span class="spinner" aria-hidden="true"></span><span class="sr-only">${escape(label)}</span></div>`;
  const panel = ({ title, copy, busy = false, actions = [] }) =>
    `<section class="ui-state" ${busy ? 'role="status" aria-busy="true"' : ''}>${busy ? '<span class="spinner" aria-hidden="true"></span>' : `<span class="feedback-modal-icon">${icon('paw-print')}</span>`}<h2>${escape(title)}</h2><p>${escape(copy)}</p><div class="actions">${actions.map(([label, action, kind]) => button(label, action, kind ?? 'primary')).join('')}</div></section>`;
  const feedbackModal = ({ title, copy, action = 'dismissFeedback', actions = [['확인', action]] }) =>
    `<section class="feedback-modal"><span class="feedback-modal-icon">${icon('paw-print')}</span><h2>${escape(title)}</h2><p>${Array.isArray(copy) ? copy.map(escape).join('<br>') : escape(copy)}</p><div class="feedback-actions">${actions.map(([label, name, kind]) => button(label, name, kind ?? 'primary')).join('')}</div></section>`;
  const tiles = (name, label, options, selected = '', layout = 'type-tiles') =>
    `<fieldset class="${layout}"><legend>${escape(label)}</legend>${options.map(([value, text, symbol, caption]) => `<label><input name="${name}" type="radio" value="${value}" ${selected === value ? 'checked' : ''} required><span>${symbol ? icon(symbol) : ''}<span><strong>${escape(text)}</strong> ${caption ? `<small>${escape(caption)}</small>` : ''}</span></span></label>`).join('')}</fieldset>`;
  const avatar = (photoUrl = null, label = '보호자 사진 미설정') =>
    photoUrl
      ? `<img class="ui-avatar" src="${escape(photoUrl)}" alt="보호자 사진">`
      : `<span class="ui-avatar" role="img" aria-label="${escape(label)}">${icon('user')}</span>`;
  const confirmation = ({ title, copy, action, label, danger = false }) =>
    `<section class="ui-confirm"><span class="feedback-modal-icon">${icon('paw-print')}</span><h2>${escape(title)}</h2><p>${escape(copy)}</p><div class="actions">${button('취소', 'closePopup', '')}${button(label, action, danger ? 'danger danger-solid' : 'primary')}</div></section>`;
  const inlineError = (
    copy,
    { retryAction = '', className = 'ui-inline-error' } = {},
  ) =>
    `<p class="${escape(className)}" role="alert"><span class="appointment-error-icon" aria-hidden="true">!</span><span>${escape(copy)}${retryAction ? ` ${button('다시 보내기', retryAction, '')}` : ''}</span></p>`;
  const appointment = (a, dog = '보리', chatLink = false) => {
    const title =
      a.status === 'accepted'
        ? '성사된 약속'
        : a.status === 'canceled'
          ? '취소된 약속'
          : a.status === 'rejected'
            ? '거절된 제안'
            : a.direction === 'sent'
              ? '보낸 제안'
              : '받은 제안';
    const directionSymbol =
      a.status === 'proposed'
        ? a.direction === 'sent'
          ? '→'
          : '←'
        : a.status === 'accepted'
          ? '↔'
          : icon(a.status === 'canceled' ? 'calendar-slash' : 'prohibit');
    const context = !a.historical && a.status === 'proposed' ? '응답 대기' : '';
    const canCancel = a.status === 'accepted' && !a.historical;
    const cardActions =
      canCancel && chatLink
        ? actionPair({
            leftLabel: '약속 취소',
            leftAction: 'appointmentCancel:' + a.id,
            leftKind: 'danger',
            rightLabel: '대화로 이동',
            rightAction: 'appointmentChat:' + a.id,
            disabled: a.busy,
            className: 'appointment-actions',
          })
        : canCancel || chatLink
          ? `<div class="appointment-actions">${canCancel ? button('약속 취소', 'appointmentCancel:' + a.id, 'danger', a.busy) : ''}${chatLink ? button('대화로 이동', 'appointmentChat:' + a.id, 'primary', a.busy) : ''}</div>`
          : '';

    return `<section class="appointment-card" data-status="${a.status}" data-direction="${a.direction}" data-historical="${Boolean(a.historical)}" ${a.busy ? 'aria-busy="true"' : ''}><div class="appointment-heading"><span class="pill">${title}</span>${context ? `<span class="appointment-context">${context}</span>` : ''}</div><h3 class="appointment-dogs"><span>${escape(dog)}</span><span class="appointment-direction" aria-label="${a.status === 'proposed' ? (a.direction === 'sent' ? '보낸 제안' : '받은 제안') : title}">${directionSymbol}</span><span>${escape(a.otherDog || '구름')}</span></h3><p>${escape(a.date)} · ${escape(a.startTime)}–${escape(a.endTime)}<br>${escape(a.placeText)}</p>${a.status === 'canceled' ? `<p><strong>취소 사유</strong><br>${escape(a.cancellationReason)}</p>` : ''}${a.status === 'proposed' && a.direction === 'received' && !a.historical ? actionPair({ leftLabel: '거절', leftAction: 'appointmentReject:' + a.id, rightLabel: '수락', rightAction: 'appointmentAccept:' + a.id, disabled: a.busy, className: 'appointment-response-actions' }) : ''}${cardActions}${a.error ? inlineError('처리하지 못했어요. 다시 시도해 주세요.', { className: 'appointment-error' }) : ''}</section>`;
  };
  return {
    escape,
    icon,
    button,
    actionPair,
    emptyDog,
    field,
    errorNotice,
    inlineNote,
    loading,
    panel,
    feedbackModal,
    tiles,
    avatar,
    confirmation,
    appointment,
    inlineError,
  };
})();
