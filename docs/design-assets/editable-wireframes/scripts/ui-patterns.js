/* 재사용할 UI 단위의 HTML 참조. *Html 인자는 코드에서 만든 마크업만 받는다. */
const PetmateTime = {
  minutes(value) {
    const [h, m] = value.split(':').map(Number);
    return h * 60 + m;
  },
  format(value) {
    return (
      String(Math.floor(value / 60)).padStart(2, '0') +
      ':' +
      String(value % 60).padStart(2, '0')
    );
  },
  step: 10,
  max: 1430,
  ordered(start, end, changed = 'end') {
    const step = this.step;
    start = Math.max(
      0,
      Math.min(this.max - step, Math.round(start / step) * step),
    );
    end = Math.max(step, Math.min(this.max, Math.round(end / step) * step));
    return changed === 'start'
      ? [Math.min(start, end - step), end]
      : [start, Math.max(end, start + step)];
  },
};
// HTML 시안의 활동 정보 표현·검증. 실제 추천·저장은 서버 계약을 따른다.
const PetmateActivity = {
  days: [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ],
  labels: ['월', '화', '수', '목', '금', '토', '일'],
  groups(slots = []) {
    const groups = [];
    for (const slot of slots) {
      let group = groups.find(
        (g) => g.startTime === slot.startTime && g.endTime === slot.endTime,
      );
      if (!group)
        groups.push(
          (group = {
            startTime: slot.startTime,
            endTime: slot.endTime,
            days: [],
          }),
        );
      group.days.push(slot.dayOfWeek);
    }
    return groups;
  },
  summary(slots = []) {
    return this.groups(slots)
      .map(
        (g) =>
          `${g.days.map((d) => this.labels[this.days.indexOf(d)]).join('·')} ${g.startTime}–${g.endTime}`,
      )
      .join('\n');
  },
  validate(slots) {
    if (!slots.length)
      return '활동 가능한 요일과 시간을 하나 이상 선택해 주세요.';
    if (slots.length > 21)
      return '요일별 시간대는 최대 21개까지 설정할 수 있어요.';
    for (let i = 0; i < slots.length; i++) {
      const a = slots[i];
      if (
        !this.days.includes(a.dayOfWeek) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(a.startTime) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(a.endTime) ||
        Number(a.startTime.slice(3)) % 10 ||
        Number(a.endTime.slice(3)) % 10 ||
        a.startTime >= a.endTime
      )
        return '가능한 요일과 시작·종료 시간을 확인해 주세요.';
      if (
        slots
          .slice(0, i)
          .some(
            (b) =>
              b.dayOfWeek === a.dayOfWeek &&
              a.startTime < b.endTime &&
              b.startTime < a.endTime,
          )
      )
        return '같은 요일의 시간대가 겹쳐요. 시간을 조정해 주세요.';
    }
    return '';
  },
  overlaps(left, right) {
    return left.some((a) =>
      right.some(
        (b) =>
          a.dayOfWeek === b.dayOfWeek &&
          a.startTime < b.endTime &&
          b.startTime < a.endTime,
      ),
    );
  },
};
const PetmatePatterns = (() => {
  const U = PetmateUI,
    e = U.escape;
  const photo = ({ src, alt = '반려견 사진', className = '' }) =>
    `<img class="${e(className)}" src="${e(src)}" alt="${e(alt)}">`;
  const heading = (title, copy = '', className = 'ui-page-heading') =>
    `<div class="${e(className)}"><h2>${e(title)}</h2>${copy ? `<p>${e(copy)}</p>` : ''}</div>`;
  const sectionHeading = (number, title, copy = '') =>
    `<div class="sun-section-heading">${number ? `<span>${e(number)}</span>` : ''}<div><h3>${e(title)}</h3>${copy ? `<p>${e(copy)}</p>` : ''}</div></div>`;
  const facts = (rows) =>
    `<dl class="profile-facts">${rows
      .filter(Boolean)
      .map(
        ([label, value]) =>
          `<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`,
      )
      .join('')}</dl>`;
  const todayDate = () =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  const ageFromBirthDate = (birthDate, today = todayDate()) => {
    const valid = (value) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value + 'T00:00:00Z')) &&
      new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;
    if (!valid(birthDate) || !valid(today) || birthDate > today) return null;
    return (
      Number(today.slice(0, 4)) -
      Number(birthDate.slice(0, 4)) -
      (today.slice(5) < birthDate.slice(5) ? 1 : 0)
    );
  };
  const identity = (dog, level = 3) => {
    const age = dog.birthDate ? ageFromBirthDate(dog.birthDate) : dog.age;
    const ageLabel =
      age === null || age === undefined ? '나이 확인 필요' : e(age) + '살';
    return `<div class="identity-line"><h${level === 2 ? 2 : 3}>${e(dog.name)}</h${level === 2 ? 2 : 3}><span>${ageLabel} · ${e(dog.size)}</span></div>`;
  };
  const location = (area) =>
    `<p class="location-line">${U.icon('map-pin')} ${e(area)}</p>`;
  const guardian = (nickname, identity, photoUrl = null) =>
    `<div class="sun-guardian"><span class="guardian-symbol">${photoUrl ? `<img src="${e(photoUrl)}" alt="${e(nickname)}의 보호자 사진">` : U.icon('user')}</span><span><strong>${e(nickname)}</strong><small>${e(identity)}</small></span></div>`;
  const badge = (label) => `<span class="pill">${e(label)}</span>`;
  const actions = (bodyHtml, className = 'actions') =>
    `<div class="${e(className)}">${bodyHtml}</div>`;
  const header = ({ leftHtml = '', titleHtml = '', rightHtml = '' }) =>
    `${leftHtml}${titleHtml}${rightHtml}`;
  const bottomTabs = (items, active, icons = false) =>
    `<nav aria-label="앱 탭">${items.map(([id, label, tab, symbol]) => `<a href="?screen=${e(id)}" data-screen="${e(id)}" class="${active === tab ? 'active' : ''}"${active === tab ? ' aria-current="page"' : ''}>${icons ? U.icon(symbol) : ''}<span>${e(label)}</span></a>`).join('')}</nav>`;
  const navigationTabs = (items, selected) =>
    `<div class="tabs">${items.map(([id, label]) => `<a href="?screen=${e(id)}" data-screen="${e(id)}" class="${id === selected ? 'selected' : ''}"${id === selected ? ' aria-current="page"' : ''}>${e(label)}</a>`).join('')}</div>`;
  const listRow = ({
    name,
    copy,
    photoHtml = '',
    screen,
    action = '',
    selected = false,
  }) =>
    `<a class="row${selected ? ' selected-row' : ''}" href="?screen=${e(screen)}" ${action ? `data-action="${e(action)}"` : `data-screen="${e(screen)}"`}>${photoHtml}<div class="grow"><strong>${e(name)}</strong><small>${e(copy)}</small></div><span aria-hidden="true">›</span></a>`;
  const compactCard = ({
    name,
    copy,
    photoHtml = '',
    screen = 'REC-03',
    candidate = null,
    received = false,
    action = '',
    className = '',
    actionsHtml = '',
  }) =>
    `<article class="compact-card ${e(className)}"><a class="row" href="?screen=${e(screen)}" ${action ? `data-action="${e(action)}"` : `data-screen="${e(screen)}"`}${candidate === null ? '' : ` data-candidate="${e(candidate)}"`}${received ? ' data-received="true"' : ''}>${photoHtml}<div class="grow"><strong>${e(name)}</strong><small>${e(copy)}</small></div>${U.icon('caret-right')}</a>${actionsHtml}</article>`;
  const dogCard = ({ name, selected = false, photoHtml = '' }) =>
    compactCard({
      name,
      copy: selected ? '현재 기준 반려견' : '상세 프로필 보기',
      screen: 'DOG-06',
      action: 'openDog:' + name,
      photoHtml,
      className: 'dog-card',
    });
  const conversationCard = (props) =>
    compactCard({ ...props, className: 'conversation-card' });
  const sentInterest = ({ name, candidate, photoHtml = '' }) =>
    compactCard({
      name,
      candidate,
      photoHtml,
      copy: '보낸 관심 · 응답 대기',
      className: 'sent-interest',
      actionsHtml: U.button(
        name + '에게 보낸 관심 취소',
        'cancelSentInterest:' + candidate,
        'sent-interest-cancel',
        false,
        { icon: 'x', iconOnly: true },
      ),
    });
  const receivedInterest = ({
    name,
    candidate,
    photoHtml = '',
    receivedAt = '10월 22일 오전 9:30',
  }) =>
    compactCard({
      name,
      candidate,
      photoHtml,
      copy: '받은 관심 · ' + receivedAt,
      received: true,
      className: 'received-interest',
      actionsHtml: U.actionPair({
        leftLabel: '거절',
        leftAction: 'receivedPass:' + candidate,
        rightLabel: '수락',
        rightAction: 'receivedLike:' + candidate,
      }),
    });
  const choiceGroup = ({
    name,
    label,
    options,
    selected = [],
    multiple = false,
    disabled = false,
    required = false,
  }) =>
    `<fieldset class="ui-checkbox-group" ${disabled ? 'disabled' : ''}><legend>${e(label)}</legend><div class="choice-options">${options.map(([value, text]) => `<label><input type="${multiple ? 'checkbox' : 'radio'}" name="${e(name)}" value="${e(value)}" ${selected.includes(value) ? 'checked' : ''} ${required ? 'required' : ''}><span class="choice-label">${e(text)}</span></label>`).join('')}</div></fieldset>`;
  const checkboxGroup = (props) => choiceGroup({ multiple: true, ...props });
  const step = (current, total, title) =>
    `<p class="step" aria-label="전체 ${e(total)}단계 중 ${e(current)}단계 · ${e(title)}">${e(current)} / ${e(total)} · ${e(title)}</p>`;
  const message = (text, sent = false) =>
    `<div class="bubble${sent ? ' mine' : ''}">${e(text)}</div>`;
  const inlineError = U.inlineError;
  const messageFailure = (copy = '전송하지 못했어요.', retryAction = 'ready') =>
    `<div class="message-failure ui-inline-error" role="alert"><span class="appointment-error-icon" aria-hidden="true">!</span><span class="message-failure-copy">${e(copy)}</span>${U.button('다시 보내기', retryAction, '')}</div>`;
  const composer = ({
    id = 'sun-message',
    disabled = false,
    value = '',
    availability = 'ready',
  } = {}) => {
    const state =
      disabled && availability === 'ready' ? 'reconnecting' : availability;
    const unavailable = state !== 'ready';
    const status =
      state === 'closed'
        ? '종료된 대화예요. 메시지를 보낼 수 없어요.'
        : '연결 중이에요. 입력한 내용은 유지돼요.';
    const symbol =
      state === 'closed'
        ? 'lock-simple'
        : state === 'reconnecting'
          ? 'wifi-slash'
          : 'paper-plane-tilt';
    return `<div class="sun-composer sun-dock" data-availability="${e(state)}">${unavailable ? `<p class="composer-status" role="status">${U.icon(symbol)}<span>${status}</span></p>` : ''}<div class="composer-controls">${state === 'closed' ? `<span class="propose-action" aria-label="종료된 대화 · 약속 제안 불가">${U.icon('calendar-blank')}</span>` : `<a href="?screen=APPT-01" data-screen="APPT-01" class="propose-action">${U.icon('calendar-blank')}<span class="sr-only">약속 제안</span></a>`}<form data-submit="send"><label class="sr-only" for="${e(id)}">메시지</label><textarea id="${e(id)}" name="message" rows="1" placeholder="메시지를 입력해 주세요" maxlength="2000" required ${state === 'closed' ? 'readonly' : ''}>${e(value)}</textarea><button type="submit" class="primary ui-button" aria-label="${unavailable ? '전송할 수 없어요' : '보내기'}" ${unavailable ? 'disabled' : ''}>${U.icon(symbol)}</button></form></div></div>`;
  };
  const control = ({
    id,
    name,
    label,
    type = 'select',
    options = [],
    value = '',
    feedback = '',
    error = false,
    disabled = false,
    readOnly = false,
    required = true,
    max = 500,
    placeholder = '',
  }) => {
    const common = `id="${e(id)}" name="${e(name)}" aria-labelledby="${e(id)}-label" aria-describedby="${e(id)}-feedback" ${error ? 'aria-invalid="true"' : ''} ${disabled ? 'disabled' : ''} ${required ? 'required' : ''}`;
    const input =
      type === 'textarea'
        ? `<textarea ${common} placeholder="${e(placeholder)}" maxlength="${e(max)}" ${readOnly ? 'readonly' : ''}>${e(value)}</textarea>`
        : `<select ${common}${readOnly ? ' disabled' : ''}><option value="">선택해 주세요</option>${options.map(([v, t]) => `<option value="${e(v)}" ${v === value ? 'selected' : ''}>${e(t)}</option>`).join('')}</select>`;
    return `<label class="sun-field"><span class="sun-field-label" id="${e(id)}-label">${e(label)}</span>${input}<span class="sun-field-feedback" id="${e(id)}-feedback" data-tone="${error ? 'error' : ''}" aria-live="polite">${error && feedback ? U.errorNotice(feedback) : e(feedback)}</span></label>`;
  };
  const form = ({
    bodyHtml,
    label,
    action,
    errorId = 'form-error',
    busy = false,
    error = '',
  }) =>
    `<form data-submit="${e(action)}" ${busy ? 'aria-busy="true"' : ''}>${busy ? `<fieldset disabled class="ui-form-fields">${bodyHtml}</fieldset>` : bodyHtml}<p class="error ui-inline-error" role="alert" id="${e(errorId)}">${e(error)}</p>${U.button(label, '', 'primary wide', busy, { submit: true })}</form>`;
  const wordmark = () =>
    `<div class="sun-wordmark"><span class="brand-mark">${U.icon('paw-print')}</span><span>my petmate<span class="brand-caption">반려견 산책 메이트</span></span></div>`;
  const dogPicker = ({ selected, options, photoHtml = '' }) =>
    `<label class="sun-dog-picker">${photoHtml}<span><small>기준 반려견</small><select name="dog" aria-label="기준 반려견">${options.map((name) => `<option value="${e(name)}" ${name === selected ? 'selected' : ''}>${e(name)}</option>`).join('')}</select></span></label>`;
  const textSection = (title, text) =>
    `<section class="profile-section"><h3>${e(title)}</h3><p>${e(text)}</p></section>`;
  const sheetHeader = (title) =>
    `<div class="sheet-heading"><h2>${e(title)}</h2>${U.button('닫기', 'closePopup', 'sheet-close', false, { icon: 'x', iconOnly: true })}</div>`;
  const selectedItems = (items, disabled = false) =>
    items
      .map(
        ([id, label]) =>
          `<button class="region-chip" type="button" data-action="removeRegion:${e(id)}" data-region-id="${e(id)}" aria-label="${e(label)} 삭제" ${disabled ? 'disabled' : ''}>${e(label)}${U.icon('x')}</button>`,
      )
      .join('');
  const rating = ({
    name = 'rating',
    id = 'rating-value',
    value = 0,
    disabled = false,
  } = {}) =>
    `<fieldset class="tail-rating" ${disabled ? 'disabled' : ''}><legend>좋았던 만큼 꼬리를 흔들어 주세요.</legend><p class="rating-privacy">평가 내용과 점수는 상대에게 공개되지 않아요.</p><div class="rating-options">${[1, 2, 3, 4, 5].map((n) => `<label class="${n <= value ? 'filled' : ''}"><input type="radio" name="${e(name)}" value="${n}" required aria-label="${n}점" ${n === value ? 'checked' : ''}><img class="tail-outline" src="assets/tail-outline.png" alt=""><img class="tail-selected" src="assets/tail-selected.png" alt=""></label>`).join('')}</div><output id="${e(id)}" aria-live="polite">${value} / 5</output></fieldset>`;
  const proposalForm = ({
    idPrefix = 'proposal',
    action = 'propose',
    date = '',
    start = '10:00',
    end = '11:00',
    busy = false,
    error = '',
  } = {}) =>
    `<p class="sheet-copy">함께 걸을 날짜와 시간을 정해요.</p><div class="proposal-form">${form({ action, label: busy ? '제안 중…' : '약속 제안', busy, error, errorId: idPrefix + '-error', bodyHtml: U.field({ id: idPrefix + '-date', name: 'date', label: '날짜', type: 'date', value: date }) + timeRange({ id: idPrefix + '-time', start, end }) + U.field({ id: idPrefix + '-place', name: 'place', label: '만날 장소', value: '망원공원 입구', extra: 'maxlength="200"' }) })}</div>`;
  const reviewForm = ({
    idPrefix = 'review',
    action = 'review',
    value = 0,
    busy = false,
    error = '',
  } = {}) =>
    form({
      action,
      label: busy ? '평가 중…' : '평가 제출',
      busy,
      error,
      errorId: idPrefix + '-error',
      bodyHtml:
        rating({ id: idPrefix + '-rating-value', value }) +
        `<fieldset class="review-tags"><legend>경험 태그 (선택)</legend><div class="review-tag-options">${['시간 약속을 잘 지켰어요', '소통이 배려 깊었어요', '반려견을 안전하게 돌봤어요', '프로필 정보가 정확했어요', '다시 만나고 싶어요'].map((text) => `<label><input type="checkbox" name="tags">${text}</label>`).join('')}</div></fieldset>` +
        control({
          id: idPrefix + '-comment',
          name: 'comment',
          label: '한 줄 의견 (선택)',
          type: 'textarea',
          placeholder: '함께 걸으며 어땠는지 남겨 주세요.',
          required: false,
        }) +
        '<output class="review-comment-count">0 / 500</output><p class="review-once">종료된 약속에 한 번만 작성할 수 있어요.</p>',
    });

  const categoryTabs = (items, selected) =>
    `<div class="tabs appointment-boxes" aria-label="약속 분류">${items.map(([value, label]) => `<button type="button" aria-pressed="${value === selected}" data-action="appointmentBox:${e(value)}">${e(label)}</button>`).join('')}</div>`;
  const candidate = ({ dog, index, photoHtml, received = false }) =>
    received
      ? receivedInterest({ name: dog.name, candidate: index, photoHtml })
      : `<article class="sun-candidate"><a href="?screen=${received ? 'LIKES-02' : 'REC-03'}" data-screen="${received ? 'LIKES-02' : 'REC-03'}" data-candidate="${e(index)}"><div class="candidate-visual">${photoHtml}${received ? '' : `<span class="match-label">${U.icon('sun')} 아주 잘 맞아요</span>`}<span class="photo-corner">${U.icon('arrow-right')}</span></div><div class="candidate-copy">${identity(dog)}${location(dog.guardian?.activityRegions?.map((r) => r.displayName).join(' · ') || '활동 지역 확인 필요')}<p class="candidate-reason">${received ? '10월 22일 오전에 도착한 관심' : '산책 속도가 비슷해요 · 주말 오전 가능'}</p><div class="candidate-bottom">${guardian(dog.guardian.nickname, dog.identity, dog.guardian.photoUrl)}<span class="detail-link">자세히 ${U.icon('caret-right')}</span></div></div></a></article>`;
  const regionPicker = (
    options,
    selected = [],
    { idPrefix = '', disabled = false, error = '', label = '산책 지역' } = {},
  ) =>
    `<fieldset class="schedule-region" data-region-picker ${disabled ? 'disabled' : ''}><legend>${e(label)} <span data-region-count>${selected.length}/3</span></legend><details ${disabled ? 'inert' : ''}><summary aria-label="산책 지역 선택">${options
      .slice(0, 2)
      .map(({ options: values, value }) =>
        e(values.find(([v]) => v === value)?.[1] || '지역 선택'),
      )
      .join(
        ` ${U.icon('caret-right')} `,
      )}${U.icon('caret-down')}</summary><div class="region-selection">${options.map(({ name, label, options: values, value }) => `<label class="region-field"><span class="region-field-label">${e(label)}</span><span class="region-field-control"><select name="${e(name)}"><option value="">선택해 주세요</option>${values.map(([v, t]) => `<option value="${e(v)}" ${v === value ? 'selected' : ''}>${e(t)}</option>`).join('')}</select>${U.icon('caret-down')}</span></label>`).join('')}<div class="region-picker-actions">${U.button('지역 추가', 'addRegion', 'primary')}</div></div></details><div class="region-chips" id="${e(idPrefix)}selected-regions">${selectedItems(selected, disabled)}</div><p class="region-help">한 곳 이상, 최대 3개까지 선택해 주세요.</p><p class="region-error" role="alert" id="${e(idPrefix)}region-error">${e(error)}</p></fieldset>`;
  const weekdays = ({
    name = 'availableDays',
    selected = [],
    multiple = true,
    disabled = false,
    required = false,
    label = '함께 걷는 날',
    values = null,
  } = {}) =>
    `<fieldset class="weekday-choice" ${disabled ? 'disabled' : ''}><legend>${e(label)}</legend><div>${[
      ['monday', '월'],
      ['tuesday', '화'],
      ['wednesday', '수'],
      ['thursday', '목'],
      ['friday', '금'],
      ['saturday', '토'],
      ['sunday', '일'],
    ]
      .map(([defaultValue, text], i) => {
        const value = values?.[i] || defaultValue;
        return `<label><input type="${multiple ? 'checkbox' : 'radio'}" name="${e(name)}" value="${e(value)}" aria-label="${text}요일" ${selected.includes(value) ? 'checked' : ''} ${required ? 'required' : ''}><span>${text}</span></label>`;
      })
      .join('')}</div></fieldset>`;
  const intensity = ({
    name = 'preferredWalkIntensity',
    value = '',
    disabled = false,
    required = true,
  } = {}) =>
    `<fieldset class="intensity-choice" ${disabled ? 'disabled' : ''}><legend>산책 강도</legend><div>${[
      ['slow', '느긋하게'],
      ['moderate', '보통'],
      ['active', '활발하게'],
    ]
      .map(
        ([v, label]) =>
          `<label><input type="radio" name="${e(name)}" value="${v}" ${v === value ? 'checked' : ''} ${required ? 'required' : ''}><span class="intensity-point" aria-hidden="true"></span><span>${label}</span></label>`,
      )
      .join('')}</div></fieldset>`;
  const timeRange = ({
    id = 'walk-time',
    start = '09:00',
    end = '12:00',
    disabled = false,
  } = {}) => {
    const [startMinutes, endMinutes] = PetmateTime.ordered(
      PetmateTime.minutes(start),
      PetmateTime.minutes(end),
    );
    start = PetmateTime.format(startMinutes);
    end = PetmateTime.format(endMinutes);
    const step = PetmateTime.step;
    const left = (startMinutes / PetmateTime.max) * 100,
      right = (endMinutes / PetmateTime.max) * 100;
    return `<fieldset class="time-range" data-time-range data-time-step="${step}" ${disabled ? 'disabled' : ''} style="--range-start:${left}%;--range-end:${right}%"><legend>가능한 시간</legend><div class="time-values"><label><span>시작</span><input id="${e(id)}-start" type="time" step="${step * 60}" name="startTime" value="${e(start)}" required aria-label="시작 시간"><strong data-time-display="start" aria-hidden="true">${e(start)}</strong></label><label><span>종료</span><input id="${e(id)}-end" type="time" step="${step * 60}" name="endTime" value="${e(end)}" required aria-label="종료 시간"><strong data-time-display="end" aria-hidden="true">${e(end)}</strong></label></div><div class="time-track"><span class="time-track-selected" aria-hidden="true"></span><input type="range" data-range="start" aria-label="시작 시간 조절" aria-valuetext="${e(start)}" min="0" max="${PetmateTime.max}" step="${step}" value="${PetmateTime.minutes(start)}"><input type="range" data-range="end" aria-label="종료 시간 조절" aria-valuetext="${e(end)}" min="0" max="${PetmateTime.max}" step="${step}" value="${PetmateTime.minutes(end)}"></div><div class="time-ticks" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div><p class="time-help">10분 단위로 조절할 수 있어요.<br>시간을 눌러 직접 수정할 수도 있어요.</p></fieldset>`;
  };

  const availabilityRow = (
    { days = [], startTime = '09:00', endTime = '12:00' } = {},
    id = 'activity-time',
  ) =>
    `<section class="availability-row" data-availability-row>${weekdays({ name: 'activityDays', selected: days, label: '활동 가능한 시간' })}${timeRange({ id, start: startTime, end: endTime }).replaceAll(' required', '').replace('<legend>가능한 시간</legend>', '<legend>시간 범위</legend>')}<div class="availability-entry-footer"><span>요일과 시간을 선택한 뒤</span>${U.button('추가하기', 'addAvailability', 'primary')}</div></section>`;
  const availabilityChip = (slots) => {
    const group = PetmateActivity.groups(slots)[0];
    const days = group.days.map(day => PetmateActivity.labels[PetmateActivity.days.indexOf(day)]).join(' · ');
    return `<div class="availability-chip" data-slots="${e(JSON.stringify(slots))}"><span class="availability-days">${e(days)}</span><strong class="availability-hours">${e(group.startTime)}–${e(group.endTime)}</strong><button type="button" class="availability-remove" data-action="removeAvailabilityChip" aria-label="${e(PetmateActivity.summary(slots))} 시간 삭제">${U.icon('x')}</button></div>`;
  };
  const availabilityEditor = (slots = [], idPrefix = 'activity') =>
    `<div class="availability-editor" data-availability-editor><div data-availability-rows>${availabilityRow({}, idPrefix + '-draft')}</div><div class="availability-chips" aria-label="설정한 활동 시간">${PetmateActivity.groups(slots).map(g => availabilityChip(g.days.map(dayOfWeek => ({dayOfWeek,startTime:g.startTime,endTime:g.endTime})))).join('')}</div><p class="muted">요일과 시간을 정하고 추가해 주세요.</p><p class="activity-error" role="alert"></p></div>`;
  const resultNotice = ({
    title,
    copy,
    badge = '',
    note = '',
    photoHtml = '',
    actions: items = [],
  }) =>
    `<section class="result-notice">${badge ? `<span class="pill">${e(badge)}</span>` : ''}${heading(title)}${photoHtml}<p>${e(copy)}</p>${note ? U.inlineNote(note) : ''}${actions(items.map(([label, action, kind]) => U.button(label, action, kind ?? 'primary')).join(''))}</section>`;
  const interestSent = ({ name, action = 'sentDone' }) =>
    `<div class="interest-sent">${U.feedbackModal({ title: '관심을 보냈어요', copy: [`${name}에게 마음을 전했어요.`, '상대도 관심을 보내면 연결돼요.'], action })}</div>`;
  const matchResult = ({ ownDog, otherDog, photoHtml = '', actions: items = [] }) =>
    `<section class="match-sheet">${sheetHeader('함께 걷고 싶은 마음이 만났어요')}<div class="match-sheet-content">${photoHtml}<div class="match-dogs"><strong>${e(ownDog)}</strong>${U.icon('paw-print')}<strong>${e(otherDog)}</strong></div><p>새로운 산책 친구로 연결됐어요.</p>${actions(items.map(([label, action, kind]) => U.button(label, action, kind ?? 'primary')).join(''))}</div></section>`;
  const actionMenu = ({ title, items }) =>
    `${heading(title)}<nav class="ui-action-menu">${items.map(([screen, label, danger = false]) => `<a href="?screen=${e(screen)}" data-screen="${e(screen)}"${danger ? ' class="ui-danger-link"' : ''}>${e(label)}${U.icon('caret-right')}</a>`).join('')}</nav>${U.button('닫기', 'closePopup', 'sheet-close', false, { icon: 'x', iconOnly: true })}`;
  const compatibility = (reasons) =>
    `<section class="compatibility"><div class="compatibility-heading">${U.icon('sun')}<div><small>산책 궁합</small><strong>아주 잘 맞아요</strong></div></div>${reasons.map((reason) => `<p>${U.icon('check')} ${e(reason)}</p>`).join('')}</section>`;
  const profileHero = ({ photoHtml, label }) =>
    `<div class="sun-detail-hero">${photoHtml}<span class="detail-photo-label">${e(label)}</span></div>`;
  const walkingTime = (time) =>
    `<div class="walking-time">${U.icon('calendar-blank')}<div><small>산책 가능한 시간</small><strong>${e(time)}</strong></div></div>`;
  const dogProfile = ({
    dog,
    photoHtml,
    intro = dog.intro,
    introTitle = dog.name + ' 소개',
    received = false,
    factRows = [],
    reasons = [],
  }) =>
    `${profileHero({ photoHtml, label: received ? '받은 관심' : '추천 반려견' })}<div class="sun-profile">${identity(dog, 2)}${location(dog.guardian?.activityRegions?.map((r) => r.displayName).join(' · ') || '활동 지역 확인 필요')}${guardian(dog.guardian.nickname, dog.identity, dog.guardian.photoUrl)}${received ? '<p class="received-detail-note">나에게 관심을 보냈어요.</p>' : compatibility(reasons)}${textSection(introTitle, intro)}<section class="profile-section"><h3>산책 조건</h3>${walkingTime(PetmateActivity.summary(dog.guardian?.availableTimeSlots))}${facts(factRows)}</section></div>`;
  const dogSummary = ({
    dog,
    photoHtml,
    intro = dog.intro,
    own = false,
    received = false,
    introTitle = '반려견을 소개해요',
    guardianHtml = '',
  }) =>
    `${photoHtml}${identity(dog, 2)}<p class="muted">${own ? '활동 지역·시간은 내 정보에서 확인해요.' : e(dog.guardian?.activityRegions?.map((r) => r.displayName).join(' · ') || '') + ' · ' + e(dog.identity)}</p>${own ? '' : guardianHtml}${own ? '' : `<span class="pill">${received ? '나에게 관심을 보냈어요' : '아주 잘 맞아요'}</span>`}${textSection(introTitle, intro)}<h3>함께 걷는 조건</h3><p>${own ? '' : e(PetmateActivity.summary(dog.guardian?.availableTimeSlots)) + '<br>'}믹스견 · 수컷 · 12kg · 중성화 완료<br>보통 산책 강도 · 낯선 반려견에게 차분함<br>예방접종 완료 · 반려동물등록 완료</p>`;
  const guardianSurface = ({
    nickname,
    profileType,
    gender,
    discovery,
    photoUrl = null,
    activityRegions = [],
    availableTimeSlots = [],
  }) =>
    `<section class="guardian-info-surface" aria-label="보호자 정보"><div class="ui-guardian-summary">${U.avatar(photoUrl)}<h3>${e(nickname)}</h3></div>${facts([['보호자 유형', profileType === 'individual' ? '개인' : profileType === 'couple' ? '커플' : '가족'], profileType === 'individual' && ['성별', gender === 'male' ? '남성' : '여성'], ['메이트 찾기', discovery === 'searching' ? '찾는 중' : '쉬는 중'], ['주 활동 지역', activityRegions.map((r) => r.displayName).join('\n')], ['활동 가능 시간', PetmateActivity.summary(availableTimeSlots)]])}</section>`;
  const chatContext = ({ dog, otherDog }) =>
    `<div class="chat-context"><span>${e(dog)} ${U.icon('paw-print')} ${e(otherDog)}</span><p>메시지와 약속을 확인할 수 있어요.</p></div>`;
  const chatPerson = ({ name, copy, photoHtml }) =>
    `<div class="chat-person">${photoHtml}<span><strong>${e(name)}</strong><small>${e(copy)}</small></span></div>`;
  const preferenceForm = ({
    filters = {},
    regionHtml = '',
    availabilityHtml = '',
    action = 'applyFilters',
    idPrefix = '',
  }) =>
    form({
      action,
      errorId: idPrefix + 'filter-error',
      label: '적용',
      bodyHtml:
        [
          [
            'sizeGroups',
            '크기',
            [
              ['small', '소형'],
              ['medium', '중형'],
              ['large', '대형'],
            ],
          ],
          [
            'walkIntensities',
            '산책 강도',
            [
              ['slow', '느긋하게'],
              ['moderate', '보통'],
              ['active', '활발하게'],
            ],
          ],
          [
            'unfamiliarDogReactions',
            '낯선 반려견 반응',
            [
              ['calm', '차분함'],
              ['cautious', '조심스러움'],
              ['excited', '흥분함'],
            ],
          ],
          [
            'guardianIdentities',
            '보호자 정보',
            [
              ['female', '여성'],
              ['male', '남성'],
              ['couple', '커플'],
              ['family', '가족'],
            ],
          ],
        ]
          .map(([name, label, options]) =>
            choiceGroup({ name, label, options, selected: filters[name] || [] }),
          )
          .join('') +
        `<label class="activity-override"><input type="checkbox" name="overrideRegions" ${filters.regionIds?.length ? 'checked' : ''}>이번에는 다른 지역에서 찾기</label><p class="muted">선택하지 않으면 저장한 주 활동 지역을 사용해요.</p><fieldset data-region-override ${filters.regionIds?.length ? '' : 'disabled hidden'}>${regionHtml}</fieldset>` +
        `<label class="activity-override"><input type="checkbox" name="overrideAvailability" ${filters.availableTimeSlots?.length ? 'checked' : ''}>이번에는 다른 요일·시간으로 찾기</label><p class="muted">선택하지 않으면 저장한 활동 가능 시간을 사용해요.</p><fieldset data-time-override ${filters.availableTimeSlots?.length ? '' : 'disabled hidden'}>${availabilityHtml || availabilityEditor(filters.availableTimeSlots, idPrefix + 'activity')}</fieldset>` +
        '<button class="ui-button" type="reset">조건 초기화</button>',
    });
  const registrationIntro = ({ current, title, copy }) =>
    `<div class="registration-intro">${step(current, 4, current === 1 ? '기본 정보' : '신체와 건강')}<div class="registration-progress" aria-hidden="true">${[1, 2, 3, 4].map((index) => `<span${index <= current ? ' class="complete"' : ''}></span>`).join('')}</div>${heading(title, copy)}</div>`;
  const registrationSection = ({
    title,
    copy = '',
    symbol = 'paw-print',
    bodyHtml,
  }) =>
    `<section class="registration-section"><div class="registration-section-heading">${U.icon(symbol)}<div><h3>${e(title)}</h3>${copy ? `<p>${e(copy)}</p>` : ''}</div></div>${bodyHtml}</section>`;
  const breedOtherField = ({ idPrefix, value = '', visible = false }) =>
    `<div data-other-breed ${visible ? '' : 'hidden'}>${U.field({ id: idPrefix + '-breed-other', name: 'breedOther', label: '견종 직접 입력 (선택)', value, placeholder: '견종명을 적어 주세요', required: false, disabled: !visible })}</div>`;
  const photoEditor = ({ idPrefix = 'guardian', photoUrl = null }) =>
    `<section class="profile-photo-editor" data-photo-editor="${e(idPrefix)}"><div class="profile-photo-control"><div data-photo-preview>${U.avatar(photoUrl)}</div><button type="button" class="photo-edit-button" data-photo-toggle aria-haspopup="dialog" aria-label="보호자 사진 변경" aria-expanded="false" aria-controls="${e(idPrefix)}-photo-sources">${U.icon('camera')}</button></div><dialog id="${e(idPrefix)}-photo-sources" class="photo-source-sheet" data-photo-dialog aria-label="사진 선택 방법"><h3>프로필 사진</h3><div class="photo-source-options"><button type="button" class="ui-button" data-photo-source="camera">사진 찍기</button><button type="button" class="ui-button" data-photo-source="album">앨범에서 선택</button></div><button type="button" class="ui-button photo-source-cancel" data-photo-close>취소</button></dialog><input type="file" name="guardianPhoto" accept="image/jpeg,image/png,image/webp" data-photo-file hidden><div class="photo-editor-feedback" role="status" aria-live="polite"></div></section>`;
  const dogBasicForm = ({
    idPrefix = 'dog-basic',
    draft = {},
    editing = false,
  }) =>
    `<div class="registration-form">${form({
      action: 'stepHealth',
      label: '다음',
      errorId: idPrefix + '-error',
      bodyHtml:
        registrationSection({
          title: '사진과 이름',
          copy: '우리 친구를 알아볼 수 있게 알려 주세요.',
          bodyHtml:
            U.field({
              id: idPrefix + '-photo',
              name: 'photo',
              label: '반려견 사진',
              type: 'file',
              required: !editing,
              extra: 'accept="image/*"',
            }) +
            U.field({
              id: idPrefix + '-name',
              name: 'name',
              label: '이름',
              value: draft.name || '',
              extra: 'maxlength="30"',
            }),
        }) +
        registrationSection({
          title: '기본 정보',
          symbol: 'dog',
          bodyHtml:
            control({
              id: idPrefix + '-breed',
              name: 'breed',
              label: '견종',
              value: draft.breed || '',
              options: [
                ['mixed_breed', '믹스견'],
                ['maltese', '말티즈'],
                ['poodle', '푸들'],
                ['pomeranian', '포메라니안'],
                ['shih_tzu', '시추'],
                ['bichon_frise', '비숑 프리제'],
                ['chihuahua', '치와와'],
                ['yorkshire_terrier', '요크셔테리어'],
                ['dachshund', '닥스훈트'],
                ['beagle', '비글'],
                ['french_bulldog', '프렌치 불도그'],
                ['welsh_corgi', '웰시코기'],
                ['golden_retriever', '골든 리트리버'],
                ['labrador_retriever', '래브라도 리트리버'],
                ['jindo', '진돗개'],
                ['other', '기타'],
              ],
            }) +
            breedOtherField({
              idPrefix,
              value: draft.breedOther || '',
              visible: draft.breed === 'other',
            }) +
            U.field({
              id: idPrefix + '-birth-date',
              name: 'birthDate',
              label: '생년월일',
              type: 'date',
              value: draft.birthDate || '',
              feedback: '나이는 생년월일을 기준으로 표시해요.',
              extra: `max="${todayDate()}"`,
            }) +
            choiceGroup({
              name: 'sex',
              label: '반려견 성별',
              options: [
                ['female', '암컷'],
                ['male', '수컷'],
              ],
              selected: [draft.sex],
              required: true,
            }),
        }),
    })}</div>`;
  const dogHealthForm = ({ idPrefix = 'dog-health', draft = {} }) =>
    `<div class="registration-form">${form({
      action: 'stepBehavior',
      label: '다음',
      errorId: idPrefix + '-error',
      bodyHtml:
        registrationSection({
          title: '몸무게와 크기',
          symbol: 'dog',
          bodyHtml:
            U.field({
              id: idPrefix + '-weight',
              name: 'weightKg',
              label: '몸무게 (kg)',
              type: 'number',
              value: draft.weightKg ?? '',
              extra: 'min="0.1" max="100" step="0.1"',
            }) +
            choiceGroup({
              name: 'sizeGroup',
              label: '크기',
              options: [
                ['small', '소형'],
                ['medium', '중형'],
                ['large', '대형'],
              ],
              selected: [draft.sizeGroup],
              required: true,
            }),
        }) +
        registrationSection({
          title: '건강 정보',
          copy: '현재 상태를 선택해 주세요.',
          symbol: 'leaf',
          bodyHtml: ['중성화', '예방접종', '반려동물등록']
            .map((label, index) =>
              choiceGroup({
                name: 'health' + index,
                label,
                options: [
                  ['true', '완료'],
                  ['false', '미완료'],
                ],
                selected: [draft['health' + index]],
                required: true,
              }),
            )
            .join(''),
        }),
    })}</div>`;
  return {
    todayDate,
    ageFromBirthDate,
    breedOtherField,
    photoEditor,
    registrationIntro,
    registrationSection,
    dogBasicForm,
    dogHealthForm,
    dogCard,
    photo,
    compactCard,
    conversationCard,
    choiceGroup,
    resultNotice,
    interestSent,
    matchResult,
    actionMenu,
    compatibility,
    profileHero,
    walkingTime,
    dogProfile,
    dogSummary,
    guardianSurface,
    chatContext,
    chatPerson,
    preferenceForm,
    heading,
    sectionHeading,
    facts,
    identity,
    location,
    guardian,
    badge,
    actions,
    header,
    bottomTabs,
    navigationTabs,
    listRow,
    sentInterest,
    receivedInterest,
    checkboxGroup,
    step,
    message,
    inlineError,
    composer,
    control,
    form,
    wordmark,
    dogPicker,
    textSection,
    sheetHeader,
    selectedItems,
    rating,
    categoryTabs,
    candidate,
    regionPicker,
    weekdays,
    intensity,
    timeRange,
    availabilityRow,
    availabilityEditor,
    availabilityChip,
    messageFailure,
    proposalForm,
    reviewForm,
  };
})();
