/* 햇살 시안의 편집 가능한 마크업. 폼·상태·모의 동작은 app.js를 재사용한다. */
const sunIcon = (name, cls = "") =>
  `<span class="sun-icon ${cls}" style="--icon:url('assets/icons/${name}.svg')" aria-hidden="true"></span>`;
const sunWordmark = () =>
  `<div class="sun-wordmark"><span class="brand-mark">${sunIcon("paw-print")}</span><span>my petmate<span class="brand-caption">우리의 산책이 만나는 곳</span></span></div>`;
const sunInput = (name, label, type, placeholder, extra = "") =>
  `<label class="sun-field"><span class="sun-field-label" id="sun-${name}-label">${label}</span><input id="sun-${name}" name="${name}" type="${type}" placeholder="${placeholder}" required aria-labelledby="sun-${name}-label" aria-describedby="sun-${name}-feedback" ${extra}><span class="sun-field-feedback" id="sun-${name}-feedback" aria-live="polite" ${name === "passwordConfirmation" ? "data-password-confirmation-feedback" : ""}></span></label>`;
const sunSection = (num, heading, caption) =>
  `<div class="sun-section-heading"><span>${num}</span><div><h3>${heading}</h3>${caption ? `<p>${caption}</p>` : ""}</div></div>`;

views.login = () =>
  `<div class="login-layout">${sunWordmark()}<div class="login-visual">${photo("sun-login-photo")}</div><div class="login-copy"><h2>만나서 반가워요.</h2><p>우리 반려견의 속도에 맞는 친구를 만나세요.</p></div>${form(sunInput("email", "이메일", "email", "이메일 주소를 입력해 주세요", 'autocomplete="username"') + sunInput("password", "비밀번호", "password", "비밀번호를 입력해 주세요", 'autocomplete="current-password"'), "로그인", "login")}<p class="auth-switch">아직 메이트가 아니신가요? ${link("AUTH-02", "회원가입 " + sunIcon("arrow-right"))}</p></div>`;

views.signup = () =>
  `<div class="signup-top">${link("AUTH-01", sunIcon("arrow-left") + "<span>로그인으로</span>", "sun-back")}<span class="brand-mark">${sunIcon("paw-print")}</span></div><div class="signup-copy"><span class="sun-eyebrow">NICE TO MEET YOU</span><h2>우리의 첫 산책,<br>여기서 시작해요.</h2><p>나와 반려견에게 맞는 만남을 준비해요.</p></div>${form(
    sunSection(
      "01",
      "반가워요, 보호자님",
      "로그인에 사용할 정보를 알려주세요.",
    ) +
      sunInput(
        "nickname",
        "닉네임",
        "text",
        "어떻게 불러드릴까요?",
        'maxlength="30" autocomplete="nickname"',
      ) +
      sunInput(
        "email",
        "이메일",
        "email",
        "이메일 주소",
        'autocomplete="email"',
      ) +
      sunInput(
        "password",
        "비밀번호",
        "password",
        "안전한 비밀번호를 입력해 주세요",
        'minlength="8" maxlength="72" autocomplete="new-password"',
      ) +
      '<p class="password-hint">8~72자 · 영문 대문자·소문자·숫자·특수문자(! @ # $ % ^ & *) 포함 · 공백 불가</p>' +
      sunInput(
        "passwordConfirmation",
        "비밀번호 확인",
        "password",
        "비밀번호를 한 번 더 입력해 주세요",
        'maxlength="72" autocomplete="new-password"',
      ) +
      sunSection(
        "02",
        "누구와 함께 걷나요?",
        "현재 보호자 유형을 선택해 주세요.",
      ) +
      `<fieldset class="type-tiles"><legend class="sr-only">보호자 유형</legend>${[
        ["individual", "개인", "user", "나와 반려견"],
        ["couple", "커플", "users", "둘이 함께"],
        ["family", "가족", "house", "가족과 함께"],
      ]
        .map(
          ([v, t, i, c]) =>
            `<label><input name="profileType" type="radio" value="${v}" required><span>${sunIcon(i)}<strong>${t}</strong><small>${c}</small></span></label>`,
        )
        .join("")}</fieldset><div id="gender-fields" hidden></div>` +
      sunSection(
        "03",
        "지금, 메이트를 찾나요?",
        "산책을 쉬고 싶을 땐 언제든 바꿀 수 있어요.",
      ) +
      `<fieldset class="discovery-tiles"><legend class="sr-only">메이트 찾기 상태</legend>${[
        ["searching", "찾는 중", "sun", "새로운 산책 친구를 만나고 싶어요"],
        ["paused", "쉬는 중", "moon", "지금은 프로필부터 준비할게요"],
      ]
        .map(
          ([v, t, i, c]) =>
            `<label><input name="discoveryStatus" type="radio" value="${v}" required><span>${sunIcon(i)}<span><strong>${t}</strong><small>${c}</small></span></span></label>`,
        )
        .join("")}</fieldset>` +
      `<div class="sun-note">${sunIcon("leaf")}<p>쉬는 중에도 이전에 받은 관심에 응답하고,<br>이미 연결된 친구와 대화·약속을 이어갈 수 있어요.</p></div>`,
    "회원가입",
    "signup",
  )}<p class="auth-switch">이미 계정이 있나요? ${link("AUTH-01", "로그인")}</p>`;

const sunGuardian = (d) =>
  `<div class="sun-guardian"><span class="guardian-symbol">${sunIcon("user")}</span><span><strong>${esc(d.guardian.nickname)}</strong><small>${esc(d.identity)}</small></span></div>`;
const sunCandidate = (i) => {
  const d = DOGS[i];
  return `<article class="sun-candidate"><a href="?screen=REC-03" data-screen="REC-03" data-candidate="${i}"><div class="candidate-visual">${photo("sun-candidate-photo")}<span class="match-label">${sunIcon("sun")} 아주 잘 맞아요</span><span class="photo-corner">${sunIcon("arrow-right")}</span></div><div class="candidate-copy"><div class="identity-line"><h3>${esc(d.name)}</h3><span>${d.age}살 · ${d.size}</span></div><p class="location-line">${sunIcon("map-pin")} 망원동 <span>·</span> ${d.distance}</p><p class="candidate-reason">산책 속도가 비슷해요 · 주말 오전 가능</p><div class="candidate-bottom">${sunGuardian(d)}<span class="detail-link">자세히 ${sunIcon("caret-right")}</span></div></div></a></article>`;
};
views.recommendations = () =>
  state.discovery === "paused"
    ? views.paused()
    : `<div class="recommendation-intro"><span class="sun-eyebrow">BETTER TOGETHER</span><h2>오늘도,<br>같이 걸어요.</h2><p>우리 아이와 발맞춰 걸을 친구를 찾아보세요.</p></div><div class="discovery-toolbar"><label class="sun-dog-picker">${photo("picker-photo")}<span><small>기준 반려견</small><select name="dog" aria-label="기준 반려견"><option value="보리" ${state.dog === "보리" ? "selected" : ""}>보리</option><option value="콩이" ${state.dog === "콩이" ? "selected" : ""}>콩이</option></select></span></label>${link("REC-02", sunIcon("sliders-horizontal") + "선호 조건", "filter-trigger")}</div><div class="recommendation-feed">${DOGS.map((d, i) => ((state.filters.regionIds?.length && !state.filters.regionIds.includes(d.regionId)) || i === state.filters.passed || (state.filters.identities?.length && !state.filters.identities.some((t) => d.identity.startsWith(t))) ? "" : sunCandidate(i))).join("")}</div>`;

views.detail = () => {
  const d = DOGS[state.candidate];
  const intro = params.has("long")
    ? "처음에는 충분한 거리를 두고 천천히 인사해요. 익숙해지면 나란히 걸어요. "
        .repeat(20)
        .slice(0, 500)
    : d.intro;
  return `<div class="sun-detail-hero">${photo("sun-detail-photo")}<span class="detail-photo-label">우리의 새로운 산책 친구</span></div><div class="sun-profile"><div class="identity-line"><h2>${esc(d.name)}</h2><span>${d.age}살 · ${d.size}</span></div><p class="location-line">${sunIcon("map-pin")} 망원동 <span>·</span> ${d.distance}</p>${sunGuardian(d)}<section class="compatibility"><div class="compatibility-heading">${sunIcon("sun")}<div><small>함께 걸으면</small><strong>아주 잘 맞아요</strong></div></div><p>${sunIcon("check")} 산책 속도가 비슷해요.</p><p>${sunIcon("check")} 주말 가능 시간이 겹쳐요.</p></section><section class="profile-section"><span class="sun-eyebrow">HELLO, MY FRIEND</span><h3>${esc(d.name)}${objectParticle(d.name)} 소개해요</h3><p>${esc(intro)}</p></section><section class="profile-section"><h3>이렇게 함께 걸어요</h3><div class="walking-time">${sunIcon("calendar-blank")}<div><small>산책 가능한 시간</small><strong>${esc(d.time)}</strong></div></div><dl class="profile-facts"><div><dt>기본 정보</dt><dd>믹스견 · 남아 · 12kg</dd></div><div><dt>산책 강도</dt><dd>보통</dd></div><div><dt>낯선 친구에게</dt><dd>차분하게 인사해요</dd></div><div><dt>건강·안전</dt><dd>중성화·예방접종·등록 완료</dd></div></dl></section></div><div class="sun-detail-actions sun-dock">${btn("패스", "pass", "pass-action")}${btn(sunIcon("heart") + "관심 있어요", "like")}</div>`;
};

// Preserve the two conversations and appointment transitions from the wireframe.
const originalSunChat = views.chat;
views.chat = () => {
  const original = document.createElement("div");
  original.innerHTML = originalSunChat();
  const history = original.querySelector("#chat-appointments").innerHTML;
  return `<div class="chat-context"><span>${esc(state.dog)} ${sunIcon("paw-print")} ${state.chatId === "CHAT-01" ? "구름" : "두부"}</span><p>서로의 속도에 맞춰, 천천히 인사해요.</p></div><div id="chat-appointments" class="sun-conversation">${history}</div><div id="messages" class="sun-conversation"></div><div class="sun-composer sun-dock">${link("APPT-01", sunIcon("calendar-blank") + '<span class="sr-only">약속 제안</span>', "propose-action")}<form data-submit="send"><label class="sr-only" for="sun-message">메시지</label><input id="sun-message" name="message" placeholder="따뜻한 인사를 건네 보세요" maxlength="2000" required autocomplete="off"><button type="submit" class="primary" aria-label="보내기">${sunIcon("paper-plane-tilt")}</button></form></div>`;
};

window.decorateDesign = (screen) => {
  const phone = $("phone"),
    content = $("content");
  phone.querySelectorAll(":scope > .sun-dock").forEach((el) => el.remove());
  const dock = content.querySelector(".sun-dock");
  if (dock) phone.insertBefore(dock, $("footer"));
  if (screen.view === "chat") {
    $("header").innerHTML =
      `${btn(sunIcon("arrow-left") + '<span class="sr-only">이전</span>', "back", "icon-button")}<div class="chat-person">${photo("chat-avatar")}<span><strong>${state.chatId === "CHAT-01" ? "구름" : "두부"}</strong><small>${esc(state.dog)}와 연결된 친구</small></span></div>${link("CHAT-SETTINGS", sunIcon("dots-three") + '<span class="sr-only">채팅 설정</span>', "icon-button")}`;
  } else if (screen.view === "recommendations") {
    $("header").innerHTML =
      `${sunWordmark()}${btn(sunIcon("arrow-left") + '<span class="sr-only">이전</span>', "back", "icon-button")}`;
  } else if (screen.view === "detail") {
    $("header").innerHTML =
      `${btn(sunIcon("arrow-left") + '<span class="sr-only">이전</span>', "back", "icon-button")}<h1>산책 친구</h1><span class="header-spacer"></span>`;
  }
  $("footer")
    .querySelectorAll("a")
    .forEach((a, i) => {
      a.innerHTML =
        sunIcon(["paw-print", "chat-circle", "dog", "user"][i]) +
        `<span>${["추천", "매칭", "내 반려견", "내 정보"][i]}</span>`;
    });
  if (screen.view === "chat" && state.status === "chat-error") {
    phone
      .querySelector(".sun-composer button[type=submit]")
      ?.setAttribute("disabled", "");
  }
};
document.documentElement.dataset.capture = params.get("capture") || "frame";
render();

// Keep feedback next to the confirmation field, including when the first password changes.
document.addEventListener("input", (event) => {
  if (!["password", "passwordConfirmation"].includes(event.target.name)) return;
  const form = event.target.closest('form[data-submit="signup"]');
  if (form) validatePasswordConfirmation(form);
});
document.addEventListener("focusout", (event) => {
  if (event.target.name !== "passwordConfirmation") return;
  const form = event.target.closest('form[data-submit="signup"]');
  if (form) validatePasswordConfirmation(form, true);
});
