const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '../docs/design-assets/editable-wireframes');
const context = vm.createContext({});
vm.runInContext(
  readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
    '\nthis.UI=PetmateUI;',
  context,
);
const UI = context.UI;
const base = {
  id: 'proposal',
  otherDog: '두부',
  date: '2026-10-25',
  startTime: '09:00',
  endTime: '10:00',
  placeText: '망원공원 입구',
};
test('수락/거절은 현재 받은 제안에만 제공한다', () => {
  for (const direction of ['sent', 'received'])
    for (const historical of [false, true]) {
      const html = UI.appointment({
        ...base,
        status: 'proposed',
        direction,
        historical,
      });
      const canRespond = direction === 'received' && !historical;
      assert.equal(html.includes('appointmentAccept:'), canRespond);
      assert.equal(html.includes('appointmentReject:'), canRespond);
    }
});
test('취소는 현재 성사 약속에만 제공하고 사유와 이력은 보존한다', () => {
  for (const status of ['proposed', 'accepted', 'rejected', 'canceled'])
    for (const historical of [false, true]) {
      const html = UI.appointment({
        ...base,
        status,
        direction: 'sent',
        historical,
        cancellationReason: '반려견 컨디션 확인 후 취소',
      });
      assert.equal(
        html.includes('appointmentCancel:'),
        status === 'accepted' && !historical,
      );
      assert.doesNotMatch(html, /이전 기록/);
      assert.match(html, new RegExp('data-historical="' + historical + '"'));
      if (status === 'canceled')
        assert.match(html, /반려견 컨디션 확인 후 취소/);
      assert.doesNotMatch(html, /성사된 약속 · 성사됨/);
    }
});
test('처리 중인 제안의 응답 버튼은 비활성화된다', () => {
  const html = UI.appointment({
    ...base,
    status: 'proposed',
    direction: 'received',
    busy: true,
  });
  assert.equal((html.match(/disabled/g) || []).length, 2);
  assert.doesNotMatch(html, /처리 중이에요/);
  assert.match(html, /aria-busy="true"/);
});
test('입력 이름과 오류 연결은 유지하고 입력 값은 HTML로 실행되지 않는다', () => {
  const html = UI.field({
    id: 'nickname',
    name: 'nickname',
    label: '닉네임',
    value: '<script>bad</script>',
    tone: 'error',
    feedback: '입력을 확인해 주세요.',
  });
  assert.match(html, /aria-labelledby="nickname-label"/);
  assert.match(html, /aria-describedby="nickname-feedback"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
test('단일 선택은 미선택에서 시작하고 지정한 값 하나만 선택한다', () => {
  const options = [
    ['one', '첫째'],
    ['two', '둘째'],
  ];
  assert.equal(
    (UI.tiles('choice', '선택', options).match(/checked/g) || []).length,
    0,
  );
  assert.equal(
    (UI.tiles('choice', '선택', options, 'two').match(/checked/g) || []).length,
    1,
  );
});
test('각 화면의 마일스톤과 기존 Sunshine 범위가 구분된다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/screens.js'), 'utf8') +
      '\nthis.screens=SCREENS;',
    ctx,
  );
  const screens = ctx.screens;
  assert.equal(new Set(screens.map((s) => s.id)).size, screens.length);
  for (const [id, milestone] of [
    ['AUTH-04', 'F1'],
    ['GUARDIAN-EDIT', 'F1'],
    ['DOG-02', 'F2'],
    ['REC-01', 'F3'],
    ['LIKES-01', 'F4'],
    ['CHAT-02', 'F5'],
    ['APPT-01', 'F6'],
    ['SAFE-01', 'F7'],
  ])
    assert.equal(screens.find((s) => s.id === id).milestone, milestone);
  assert.equal(screens.find((s) => s.id === 'DOG-02').designed, false);
  assert.equal(screens.find((s) => s.id === 'GUARDIAN-EDIT').designed, true);
  assert.equal(screens.find((s) => s.id === 'AUTH-03').kind, 'state');
  assert.equal(
    screens.some((s) => ['AUTH-ERROR', 'AUTH-RETRY'].includes(s.id)),
    false,
  );
});

test('복원은 제목 없는 스피너, 찾기 안내는 박스 없는 공통 표현을 사용한다', () => {
  const loading = UI.loading();
  assert.match(loading, /role="status"/);
  assert.match(loading, /aria-busy="true"/);
  assert.doesNotMatch(loading, /<h[123]/);
  assert.match(UI.inlineNote('기존 대화와 약속 유지'), /class="sun-note"/);
  assert.doesNotMatch(UI.inlineNote('기존 대화와 약속 유지'), /ui-notice/);
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/f1-states.js'), 'utf8') +
      '\nthis.states=F1_STATES;',
    ctx,
  );
  assert.equal('expired' in ctx.states['AUTH-03'], true);
  assert.equal('account-restricted' in ctx.states['AUTH-01'], true);
  assert.equal('account-restricted' in ctx.states['AUTH-03'], false);
});

test('공통 메시지는 입력을 HTML로 실행하지 않고 실패는 별도 경고로 표시한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;this.U=PetmateUI;',
    ctx,
  );
  assert.match(ctx.P.message('<img src=x onerror=alert(1)>', true), /&lt;img/);
  assert.doesNotMatch(ctx.P.message('<script>bad</script>'), /<script>/);
  const failure = ctx.U.inlineError('전송 실패', { retryAction: 'ready' });
  assert.match(failure, /role="alert"/);
  assert.match(failure, /data-action="ready"/);
  assert.doesNotMatch(failure, /class="ui-notice"/);
});
test('앱 탭은 활성 링크 하나와 F1 이동 경로를 보존한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const html = ctx.P.bottomTabs(
    [
      ['F1-REC', '추천', 'rec', 'paw-print'],
      ['GUARDIAN-01', '내 정보', 'guardian', 'user'],
    ],
    'guardian',
    true,
  );
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
  assert.match(html, /href="\?screen=F1-REC"/);
  assert.match(
    html,
    /data-screen="GUARDIAN-01" class="active" aria-current="page"/,
  );
  assert.doesNotMatch(html, /<nav[^>]+data-screen=/);
});
test('공통 정보 목록은 조건부 항목을 보존하고 받은 관심에 궁합을 붙이지 않는다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  assert.match(
    ctx.P.facts([
      ['보호자 유형', '개인'],
      ['성별', '여성'],
      ['메이트 찾기', '쉬는 중'],
    ]),
    /<dt>성별<\/dt><dd>여성<\/dd>/,
  );
  assert.doesNotMatch(
    ctx.P.facts([['보호자 유형', '가족'], false]),
    /false|undefined/,
  );
  const received = ctx.P.candidate({
    dog: {
      name: '두부',
      age: 2,
      size: '소형',
      distance: '1km',
      identity: '가족',
      guardian: { nickname: '두부네' },
    },
    index: 1,
    photoHtml: '',
    received: true,
  });
  assert.match(received, /data-screen="REC-03"/);
  assert.match(received, /data-received="true"/);
  assert.match(received, /받은 관심 · 10월 22일 오전 9:30/);
  assert.match(received, /<\/a><div class="ui-action-pair /);
  assert.match(received, /data-action="receivedPass:1"/);
  assert.match(received, /data-action="receivedLike:1"/);
  assert.doesNotMatch(received, /잘 맞아요|산책 속도/);
});

test('모든 시간 입력은 10분 단위로 맞추며 두 끝점이 서로 넘어가지 않는다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.T=PetmateTime;this.P=PetmatePatterns;',
    ctx,
  );
  for (const value of ['00:00', '09:01', '13:15', '23:59'])
    assert.equal(ctx.T.format(ctx.T.minutes(value)), value);
  assert.deepEqual(Array.from(ctx.T.ordered(800, 720, 'start')), [710, 720]);
  assert.deepEqual(Array.from(ctx.T.ordered(540, 400, 'end')), [540, 550]);
  const html = ctx.P.timeRange({
    id: 'test-time',
    start: '09:01',
    end: '13:15',
  });
  assert.equal((html.match(/type="range"/g) || []).length, 2);
  assert.match(html, /name="startTime" value="09:00"/);
  assert.match(html, /name="endTime" value="13:20"/);
  assert.match(html, /aria-label="시작 시간 조절"/);
});
test('요일은 일곱 개를 짧게 표시하고 강도는 세 범주 중 하나만 선택한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const days = ctx.P.weekdays({
    name: 'dayOfWeek',
    multiple: false,
    required: true,
    selected: ['saturday'],
  });
  assert.equal((days.match(/type="radio"/g) || []).length, 7);
  assert.equal((days.match(/checked/g) || []).length, 1);
  assert.match(days, /aria-label="월요일"/);
  assert.doesNotMatch(days, /<span>월요일<\/span>/);
  const intensity = ctx.P.intensity({ value: 'moderate' });
  assert.equal((intensity.match(/type="radio"/g) || []).length, 3);
  assert.equal((intensity.match(/checked/g) || []).length, 1);
  for (const value of ['slow', 'moderate', 'active'])
    assert.match(intensity, new RegExp('value="' + value + '"'));
  assert.doesNotMatch(ctx.P.intensity(), /checked/);
  const chip = ctx.P.selectedItems([['mangwon', '망원동']]);
  assert.match(chip, /<button[^>]+aria-label="망원동 삭제"[^>]*>망원동/);
  assert.doesNotMatch(chip, />삭제<\/button>/);
});

test('전송 불가는 연결·종료 아이콘과 보존한 입력으로 구분한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const reconnect = ctx.P.composer({
    availability: 'reconnecting',
    value: '<입력 유지>',
  });
  assert.match(reconnect, /wifi-slash/);
  assert.match(reconnect, /disabled/);
  assert.match(reconnect, /&lt;입력 유지&gt;/);
  const closed = ctx.P.composer({ availability: 'closed' });
  assert.match(closed, /lock-simple/);
  assert.match(closed, /readonly/);
  assert.doesNotMatch(closed, /data-screen="APPT-01"/);
  assert.match(ctx.P.messageFailure(), /message-failure/);
});
test('꼬리 평가는 단일 1~5 값, 비공개, 기존 태그·의견을 보존한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const html = ctx.P.reviewForm({ value: 3 });
  assert.equal((html.match(/type="radio"/g) || []).length, 5);
  assert.equal((html.match(/class="filled"/g) || []).length, 3);
  assert.equal((html.match(/type="checkbox"/g) || []).length, 5);
  assert.match(html, /상대에게 공개되지 않아요/);
  assert.match(html, /maxlength="500"/);
  assert.match(html, /한 번만/);
  assert.doesNotMatch(html, /[★☆]/);
  assert.match(ctx.P.reviewForm({ busy: true }), /fieldset disabled/);
});
test('제안 시트의 입력 계약과 실패 후 입력을 유지한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const html = ctx.P.proposalForm({
    date: '2026-10-31',
    start: '09:00',
    end: '10:00',
    error: '제안하지 못했어요.',
  });
  for (const name of ['date', 'startTime', 'endTime', 'place'])
    assert.match(html, new RegExp('name="' + name + '"'));
  assert.match(html, /value="2026-10-31"/);
  assert.match(html, /제안하지 못했어요/);
  assert.doesNotMatch(html, /sheet-toolbar|지도|autocomplete/);
  assert.match(ctx.P.sheetHeader('약속 제안'), /aria-label="닫기"/);
});

test('제안 방향과 완료 상태는 색 이외의 화살표·상태 문구도 구분한다', () => {
  const states = [
    ['proposed', 'sent', '보낸 제안', '→'],
    ['proposed', 'received', '받은 제안', '←'],
    ['accepted', 'received', '성사된 약속', '↔'],
    ['rejected', 'received', '거절된 제안', 'prohibit.svg'],
    ['canceled', 'sent', '취소된 약속', 'calendar-slash.svg'],
  ];
  for (const [status, direction, title, symbol] of states) {
    const html = UI.appointment({ ...base, status, direction });
    assert.match(html, new RegExp('data-direction="' + direction + '"'));
    assert.ok(html.includes(title));
    assert.match(html, new RegExp('aria-label="' + title + '">'));
    assert.ok(html.includes(symbol));
    if (['rejected', 'canceled'].includes(status))
      assert.doesNotMatch(html, /×/);
  }
});
test('약속 제안은 10분 단위를 안내하며 경계에서도 시간 순서를 지킨다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;this.T=PetmateTime;',
    ctx,
  );
  const html = ctx.P.proposalForm();
  assert.match(html, /10분 단위/);
  assert.equal((html.match(/type="time" step="600"/g) || []).length, 2);
  assert.equal((html.match(/max="1430" step="10"/g) || []).length, 2);
  assert.deepEqual(Array.from(ctx.T.ordered(660, 660, 'start')), [650, 660]);
  assert.deepEqual(Array.from(ctx.T.ordered(0, 0, 'end')), [0, 10]);
  assert.deepEqual(Array.from(ctx.T.ordered(1420, 1400, 'end')), [1420, 1430]);
});

test('목차의 단독 시간과 종합 폼·제안 시트는 같은 10분 입력과 안내를 사용한다', () => {
  const ctx = vm.createContext({});
  for (const file of [
    'scripts/ui-components.js',
    'scripts/ui-patterns.js',
    'scripts/component-specs.js',
  ])
    vm.runInContext(readFileSync(path.join(root, file), 'utf8'), ctx);
  vm.runInContext('this.specs=UI_SPECS;', ctx);
  const examples = ctx.specs
    .flatMap((spec) => spec.examples)
    .filter(([, html]) => html.includes('data-time-range'));
  assert.ok(examples.length >= 7);
  for (const [label, html] of examples) {
    assert.equal(
      (html.match(/type="time" step="600"/g) || []).length,
      2,
      label,
    );
    assert.equal((html.match(/max="1430" step="10"/g) || []).length, 2, label);
    assert.match(html, /10분 단위로 조절할 수 있어요/);
    assert.match(html, /시간을 눌러 직접 수정할 수도 있어요/);
  }
  const minimum = examples.find(
    ([label]) => label === '시간 · 최소 간격 (10분)',
  )[1];
  assert.match(minimum, /name="startTime" value="10:00"/);
  assert.match(minimum, /name="endTime" value="10:10"/);
});
test('긴 채팅 입력은 여러 줄과 특수 문자를 보존하며 같은 전송 폼을 사용한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const html = ctx.P.composer({ value: '첫 줄\n<script>둘째 줄</script>' });
  assert.match(html, /<textarea[^>]+name="message"[^>]+maxlength="2000"/);
  assert.match(html, /첫 줄\n&lt;script&gt;둘째 줄&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<input|<script>/);
  assert.match(html, /data-submit="send"/);
});

test('보낸 관심 행은 상세 링크와 독립된 오른쪽 취소 버튼을 사용한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const html = ctx.P.sentInterest({
    name: '구름',
    candidate: 1,
    photoHtml: '<img alt="구름">',
  });
  assert.match(html, /<a[^>]+data-screen="REC-03" data-candidate="1"/);
  assert.match(html, /<\/a><button/);
  assert.doesNotMatch(html, /<a[^>]*>[\s\S]*<button[\s\S]*<\/a>/);
  assert.match(html, /aria-label="구름에게 보낸 관심 취소"/);
  assert.match(html, /data-action="cancelSentInterest:1"/);
  assert.match(html, /icons\/x.svg/);
});
test('두 미리보기는 동일 스크립트·시작 화면을 사용하며 기능을 테마로 분기하지 않는다', () => {
  const index = readFileSync(path.join(root, 'index.html'), 'utf8');
  const design = readFileSync(path.join(root, 'sunshine.html'), 'utf8');
  const scripts = (html) =>
    [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(scripts(index), scripts(design));
  for (const html of [index, design])
    assert.match(html, /data-start-screen="AUTH-01"/);
  assert.doesNotMatch(
    readFileSync(path.join(root, 'scripts/app.js'), 'utf8'),
    /\bsunshine\b/,
  );
});
test('보기 전환 링크는 현재 화면·상태·폭을 보존하고 내보내기 옵션은 제외한다', () => {
  const links = [
    'index.html',
    'sunshine.html',
    'components.html',
    'sunshine-board.html',
  ].map((page) => ({
    dataset: { previewPage: page },
    href: '',
    setAttribute() {},
    removeAttribute() {},
  }));
  const ctx = vm.createContext({
    URLSearchParams,
    window: {},
    location: {
      pathname: '/preview/index.html',
      search: '?screen=CHAT-02&state=chat-long&width=320&export=1&capture=full',
    },
    document: {
      addEventListener() {},
      querySelectorAll() {
        return links;
      },
    },
  });
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/preview-navigation.js'), 'utf8'),
    ctx,
  );
  ctx.window.PreviewNavigation.update();
  for (const link of links.slice(0, 2)) {
    assert.match(link.href, /screen=CHAT-02/);
    assert.match(link.href, /state=chat-long/);
    assert.match(link.href, /width=320/);
    assert.doesNotMatch(link.href, /export|capture/);
  }
  assert.equal(links[2].href, 'components.html');
  assert.equal(links[3].href, 'sunshine-board.html');
  ctx.window.PreviewNavigation.update({ screen: 'APPT-01', state: 'ready' });
  assert.match(links[1].href, /screen=APPT-01&state=ready/);
});

test('선호 선택 그룹은 단일 선택을 지원하고 함께 걷는 날은 다중 선택을 유지한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const group = ctx.P.checkboxGroup({
    name: 'sizes',
    label: '크기',
    options: [
      ['small', '소형'],
      ['large', '대형'],
    ],
    multiple: false,
    selected: ['small'],
  });
  assert.equal((group.match(/type="radio"/g) || []).length, 2);
  assert.doesNotMatch(group, /type="checkbox"/);
  assert.match(group, /value="small" checked/);
  assert.equal((ctx.P.weekdays().match(/type="checkbox"/g) || []).length, 7);
});

test('하단 행동은 화면과 목차가 같은 렌더러를 공유하고 버튼별 마크업을 복제하지 않는다', () => {
  const screen = readFileSync(path.join(root, 'scripts/sunshine.js'), 'utf8');
  const catalog = readFileSync(path.join(root, 'scripts/component-specs.js'), 'utf8');
  assert.match(screen, /PetmateUI\.actionPair\(/);
  assert.match(
    catalog,
    /U\.actionPair\(\{\s*rightIcon:\s*'heart',\s*className:\s*'sun-detail-actions'\s*}\)/,
  );
  assert.doesNotMatch(screen, /<div class="sun-detail-actions/);
  assert.doesNotMatch(
    readFileSync(path.join(root, 'styles/components.css'), 'utf8'),
    /\.catalog-item \.phone \.sun-detail-actions button/,
  );
  const html = UI.actionPair({
    leftLabel: '거절',
    leftAction: 'reject:1',
    rightLabel: '수락',
    rightAction: 'accept:1',
    disabled: true,
  });
  assert.equal((html.match(/<button /g) || []).length, 2);
  assert.equal((html.match(/ disabled/g) || []).length, 2);
  assert.match(html, /data-action="reject:1"/);
  assert.match(html, /data-action="accept:1"/);
});

test('대화·받은 관심·보낸 관심은 같은 축약 카드이며 링크와 행동을 분리한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  for (const html of [
    ctx.P.conversationCard({ name: '구름', copy: '안녕', screen: 'CHAT-01' }),
    ctx.P.receivedInterest({ name: '구름', candidate: 0 }),
    ctx.P.sentInterest({ name: '구름', candidate: 0 }),
  ]) {
    assert.match(html, /class="compact-card /);
    assert.doesNotMatch(html, /<a[^>]*>[\s\S]*<button[\s\S]*<\/a>/);
  }
  const chat = ctx.P.conversationCard({
    name: '<script>',
    copy: '안녕',
    screen: 'CHAT-02',
  });
  assert.match(chat, /data-screen="CHAT-02"/);
  assert.match(chat, /&lt;script&gt;/);
});
test('성사된 약속의 취소와 대화 이동은 공통 행동 쌍에서 다른 성격을 표시한다', () => {
  const html = UI.appointment(
    { ...base, status: 'accepted', direction: 'received' },
    '보리',
    true,
  );
  assert.match(html, /ui-action-pair appointment-actions/);
  assert.match(
    html,
    /class="danger ui-button"[^>]*data-action="appointmentCancel:/,
  );
  assert.match(
    html,
    /class="primary ui-button"[^>]*data-action="appointmentChat:/,
  );
  assert.equal(
    (html.match(/ui-action-pair appointment-actions/g) || []).length,
    1,
  );
});
test('재분류 목차는 모든 단위를 한 번만 배치하고 모든 미리보기 화면을 연결한다', () => {
  const ctx = vm.createContext({});
  for (const file of [
    'scripts/screens.js',
    'scripts/ui-components.js',
    'scripts/ui-patterns.js',
    'scripts/component-specs.js',
  ])
    vm.runInContext(readFileSync(path.join(root, file), 'utf8'), ctx);
  const result = vm.runInContext(
    `({ids:UI_SPECS.map(x=>'unit-'+x.id),placed:CATALOG_GROUPS.flatMap(x=>x.sections),groups:CATALOG_GROUPS.length,screens:SCREENS.map(x=>({id:x.id,units:SCREEN_COMPONENTS[x.view]}))})`,
    ctx,
  );
  assert.equal(result.groups, 6);
  assert.equal(new Set(result.placed).size, result.placed.length);
  const all = new Set([
    ...result.ids,
    'fields',
    'buttons',
    'choices',
    'feedback',
    'confirm',
    'appointments',
  ]);
  assert.deepEqual(new Set(result.placed), all);
  for (const screen of result.screens) {
    assert.ok(screen.units?.length, screen.id);
    for (const id of screen.units) assert.ok(all.has(id), screen.id + ':' + id);
  }
});
test('공통 폼 제출은 클릭 액션과 충돌하지 않는다', () => {
  const html = UI.button('저장', '', 'primary', false, { submit: true });
  assert.match(html, /type="submit"/);
  assert.doesNotMatch(html, /data-action=/);
  assert.match(html, /ui-button-label/);
});

test('반려견 카드의 이동은 추천 상세가 아닌 해당 반려견 열기 행동을 사용한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const html = ctx.P.dogCard({ name: '콩이', selected: true });
  assert.match(html, /compact-card dog-card/);
  assert.match(html, /data-action="openDog:콩이"/);
  assert.doesNotMatch(html, /data-screen=/);
  assert.match(html, /현재 기준 반려견/);
});
test('공유 등록 폼은 필수값·범위·원래 단계 제출 계약을 보존한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const basic = ctx.P.dogBasicForm({
    draft: { name: '보리', birthDate: '2026-01-01', sex: 'female' },
  });
  assert.match(basic, /data-submit="stepHealth"/);
  assert.match(basic, /name="photo"[^>]*required/);
  assert.match(
    basic,
    /name="birthDate"[^>]*type="date"[^>]*value="2026-01-01"/,
  );
  assert.doesNotMatch(basic, /name="age"/);
  assert.equal((basic.match(/name="sex"/g) || []).length, 2);
  assert.doesNotMatch(
    ctx.P.dogBasicForm({ editing: true }),
    /name="photo"[^>]*required/,
  );
  const health = ctx.P.dogHealthForm({
    draft: { weightKg: '12.5', sizeGroup: 'medium' },
  });
  assert.match(health, /data-submit="stepBehavior"/);
  assert.match(health, /name="weightKg"[^>]*min="0.1" max="100" step="0.1"/);
  for (const name of ['sizeGroup', 'health0', 'health1', 'health2'])
    assert.match(health, new RegExp('name="' + name + '"'));
  assert.doesNotMatch(health, /type="checkbox"/);
});

test('기타 견종 필드는 기타일 때만 표시·활성화하고 생년월일 입력을 공유한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const other = ctx.P.dogBasicForm({
    draft: { breed: 'other', breedOther: '베들링턴 테리어' },
  });
  assert.match(other, /data-other-breed >/);
  assert.match(other, /name="breedOther"[^>]*value="베들링턴 테리어"/);
  assert.doesNotMatch(other, /name="breedOther"[^>]*disabled/);
  assert.match(
    ctx.P.dogBasicForm({ draft: { breed: 'poodle' } }),
    /data-other-breed hidden/,
  );
  assert.match(
    ctx.P.dogBasicForm({ draft: { breed: 'poodle' } }),
    /name="breedOther"[^>]*disabled/,
  );
  assert.match(other, /name="birthDate"/);
});
test('사진 편집은 카메라 버튼으로 여는 대화상자와 촬영·앨범 선택을 제공한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const html = ctx.P.photoEditor({ idPrefix: 'test-guardian' });
  assert.match(html, /data-photo-toggle aria-haspopup="dialog"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /<dialog[^>]*data-photo-dialog/);
  assert.doesNotMatch(html, /<dialog[^>]* open/);
  assert.match(html, /data-photo-source="camera"/);
  assert.match(html, /data-photo-source="album"/);
  assert.match(html, /data-photo-close/);
  assert.equal((html.match(/name="guardianPhoto"/g) || []).length, 1);
});

test('나이는 생년월일에서 계산하며 생일 전후·0살·잘못된 날짜를 구분한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  assert.equal(ctx.P.ageFromBirthDate('2020-10-28', '2026-10-27'), 5);
  assert.equal(ctx.P.ageFromBirthDate('2020-10-27', '2026-10-27'), 6);
  assert.equal(ctx.P.ageFromBirthDate('2026-01-01', '2026-10-27'), 0);
  assert.equal(ctx.P.ageFromBirthDate('2024-02-29', '2025-03-01'), 1);
  for (const value of ['2026-10-28', '2025-02-29', '', undefined])
    assert.equal(ctx.P.ageFromBirthDate(value, '2026-10-27'), null);
});

test('필드 오류는 공통 안내를 사용하고 메시지를 안전하게 표시한다', () => {
  const html = UI.field({
    id: 'field',
    name: 'nickname',
    label: '닉네임',
    tone: 'error',
    feedback: '<오류>',
  });
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="field-feedback"/);
  assert.match(html, /role="alert"/);
  assert.match(html, /&lt;오류&gt;/);
  assert.doesNotMatch(html, /<오류>/);
});

test('공통 안내 모달은 필요한 복구 행동을 유지한다', () => {
  const html = UI.feedbackModal({
    title: '저장 실패',
    copy: '다시 시도해 주세요.',
    actions: [
      ['취소', 'dismissFeedback', ''],
      ['재시도', 'retryGuardian'],
    ],
  });
  assert.match(html, /data-action="dismissFeedback"/);
  assert.match(html, /data-action="retryGuardian"/);
  assert.match(html, /class="feedback-actions"/);
});

test('관심 안내와 매칭 시트는 입력을 안전하게 표시하고 행동을 보존한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const sent = ctx.P.interestSent({ name: '<구름>', action: 'sentDone' });
  assert.match(sent, /&lt;구름&gt;에게 마음을 전했어요\.<br>상대도/);
  assert.match(sent, /data-action="sentDone"/);
  const match = ctx.P.matchResult({
    ownDog: '보리',
    otherDog: '<구름>',
    actions: [
      ['목록으로', 'list', ''],
      ['메시지 보내기', 'chat'],
    ],
  });
  assert.match(match, /class="match-sheet"/);
  assert.match(match, /paw-print/);
  assert.match(match, /&lt;구름&gt;/);
  assert.match(match, /새로운 산책 친구로 연결됐어요/);
  assert.ok(
    match.indexOf('data-action="list"') < match.indexOf('data-action="chat"'),
  );
});

test('활동 시간은 요일별로 보존하며 실제 겹침과 맞닿은 경계를 구분한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.A=PetmateActivity;this.P=PetmatePatterns;',
    ctx,
  );
  const saturday = {
    dayOfWeek: 'saturday',
    startTime: '09:00',
    endTime: '12:00',
  };
  const sunday = { dayOfWeek: 'sunday', startTime: '14:00', endTime: '16:00' };
  assert.equal(ctx.A.validate([saturday, sunday]), '');
  assert.match(
    ctx.A.summary([saturday, sunday]),
    /토 09:00–12:00\n일 14:00–16:00/,
  );
  assert.equal(
    ctx.A.overlaps(
      [saturday],
      [{ ...saturday, startTime: '12:00', endTime: '13:00' }],
    ),
    false,
  );
  assert.equal(
    ctx.A.overlaps(
      [saturday],
      [{ ...saturday, startTime: '11:00', endTime: '13:00' }],
    ),
    true,
  );
  assert.equal(
    ctx.A.overlaps([saturday], [{ ...saturday, dayOfWeek: 'sunday' }]),
    false,
  );
  assert.match(ctx.A.validate([saturday, saturday]), /겹쳐요/);
  assert.match(ctx.A.validate([]), /하나 이상/);
  const html = ctx.P.availabilityEditor([saturday, sunday]);
  assert.match(html, /value="09:00"/);
  assert.match(html, /일 14:00–16:00/);
  assert.equal((html.match(/data-availability-row>/g) || []).length, 1);
});

test('내 정보는 보호자 활동 정보를 표시하고 임시 필터는 기본 조건 사용을 제공한다', () => {
  const ctx = vm.createContext({});
  vm.runInContext(
    readFileSync(path.join(root, 'scripts/ui-components.js'), 'utf8') +
      '\n' +
      readFileSync(path.join(root, 'scripts/ui-patterns.js'), 'utf8') +
      '\nthis.P=PetmatePatterns;',
    ctx,
  );
  const slots = [{ dayOfWeek: 'monday', startTime: '18:00', endTime: '20:00' }];
  const profile = ctx.P.guardianSurface({
    nickname: '보리네',
    profileType: 'family',
    discovery: 'searching',
    activityRegions: [
      { id: 'locality-demo-hapjeong', displayName: '서울특별시 마포구 합정동' },
    ],
    availableTimeSlots: slots,
  });
  assert.match(profile, /서울특별시 마포구 합정동/);
  assert.match(profile, /월 18:00–20:00/);
  const defaults = ctx.P.preferenceForm({});
  assert.match(defaults, /data-region-override disabled hidden/);
  assert.match(defaults, /data-time-override disabled hidden/);
  const override = ctx.P.preferenceForm({
    filters: {
      regionIds: ['locality-demo-hapjeong'],
      availableTimeSlots: slots,
    },
  });
  assert.match(override, /name="overrideRegions" checked/);
  assert.match(override, /name="overrideAvailability" checked/);
  assert.doesNotMatch(override, /data-time-override disabled/);
  assert.match(override, /type="reset"/);
  assert.doesNotMatch(ctx.P.location('합정동', '약 1km'), /km/);
});
