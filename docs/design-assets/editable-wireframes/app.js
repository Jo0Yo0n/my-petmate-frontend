const params = new URLSearchParams(location.search);
params.delete("mode");
const state = {
  screen: params.get("screen") || document.documentElement.dataset.startScreen || "REC-01",
  width: params.get("width") || "390",
  font: params.get("font") || "normal",
  status: params.get("state") || "ready",
  discovery: params.get("discovery") || "searching",
  dog: "보리",
  viewedDog: null,
  candidate: 0,
  received: [0, 1],
  matched: false,
  busy: false,
  stack: [],
  likesPage: 1,
  draft: {},
  filters: {},
  guardian:
    params.get("guardian") === "family"
      ? { profileType: "family", gender: null }
      : { profileType: "individual", gender: "female" },
  appointmentBox: "received",
  appointmentId: "accepted-demo",
  chatId: "CHAT-01",
  appointments: [
    {
      id: "canceled-demo",
      chatId: "CHAT-01",
      otherDog: "구름",
      direction: "sent",
      status: "canceled",
      date: "2026-10-24",
      startTime: "10:00",
      endTime: "11:00",
      placeText: "망원공원 입구",
      cancellationReason:
        "구름이 컨디션이 좋지 않아 오늘은 쉬어야 할 것 같아요.",
    },
    {
      id: "accepted-demo",
      chatId: "CHAT-02",
      otherDog: "두부",
      direction: "received",
      status: "accepted",
      date: "2026-10-25",
      startTime: "09:00",
      endTime: "10:00",
      placeText: "망원공원 입구",
      cancellationReason: null,
    },
  ],
  editing: false,
  nickname: "보리네",
  guardianPhoto: false,
  savedDogs: {},
};
const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const link = (id, text, cls = "") =>
  `<a class="${cls}" href="?screen=${id}" data-screen="${id}">${text}</a>`;
const btn = (text, action, cls = "primary") =>
  `<button type="button" class="${cls}" data-action="${action}">${text}</button>`;
const field = (name, label, type = "text", value = "", extra = "") =>
  `<label>${label}<input name="${name}" type="${type}" value="${esc(type === "file" ? "" : value)}" ${extra}></label>`;
const choices = (name, label, options, selected = "", required = true) =>
  `<fieldset><legend>${label}</legend>${options.map(([value, text]) => `<label><input type="radio" name="${name}" value="${value}" ${selected === value ? "checked" : ""} ${required ? "required" : ""}>${text}</label>`).join("")}</fieldset>`;
const select = (name, label, options, value = "") =>
  `<label>${label}<select name="${name}" required><option value="">선택해 주세요</option>${options.map(([v, t]) => `<option value="${v}" ${v === value ? "selected" : ""}>${t}</option>`).join("")}</select></label>`;
const textarea = (name, label, value = "", max = 500) =>
  `<label>${label}<textarea name="${name}" maxlength="${max}" required>${esc(value)}</textarea></label>`;
const notice = (t) => `<div class="notice">${t}</div>`;
const form = (body, text, action) =>
  `<form data-submit="${action}">${body}<p class="error" role="alert" id="form-error"></p><button class="primary wide" type="submit">${text}</button></form>`;
const genderFields = (editing = false) =>
  choices(
    "gender",
    "성별",
    genderOptions,
    editing ? state.guardian.gender || "" : "",
  ) +
  `<p class="muted">${editing ? "최초 저장한 성별은 변경할 수 없어요. 유형을 바꿔도 서버에 보존돼요." : "한 번 설정한 성별은 바꿀 수 없어요."}</p>`;
const DEMO_REGIONS = [
  { id: "locality-demo-mangwon", name: "망원동" },
  { id: "locality-demo-yeonnam", name: "연남동" },
  { id: "locality-demo-hapjeong", name: "합정동" },
  { id: "locality-demo-seogyo", name: "서교동" },
];
const regionPicker = () =>
  `<fieldset><legend>산책 지역</legend><p class="muted">읍·면·동을 최대 3개 선택할 수 있어요.</p>${select("sido", "시·도", [["seoul-demo", "서울특별시"]], "seoul-demo")}${select("sigungu", "시·군·구", [["mapo-demo", "마포구"]], "mapo-demo")}${select(
    "locality",
    "읍·면·동",
    DEMO_REGIONS.map((r) => [r.id, r.name]),
  )}${btn("지역 추가", "addRegion", "")}<div id="selected-regions"></div><p id="region-error" class="error" role="alert"></p></fieldset>`;
let regionDraft = [];
function renderSelectedRegions() {
  const target = $("selected-regions");
  if (!target) return;
  target.innerHTML = regionDraft
    .map(
      (id) =>
        `<p>${esc(DEMO_REGIONS.find((r) => r.id === id).name)} ${btn("삭제", "removeRegion:" + id, "")}</p>`,
    )
    .join("");
}
const finderOptions = [
  ["searching", "찾는 중"],
  ["paused", "쉬는 중"],
];
const typeOptions = [
  ["individual", "개인"],
  ["couple", "커플"],
  ["family", "가족"],
];
const genderOptions = [
  ["female", "여성"],
  ["male", "남성"],
];
const finderHelp = notice(
  "찾는 중에는 서로 추천되고 보호자 유형 정보가 표시돼요. 쉬는 중에도 이전에 받은 관심에 응답하고 기존 대화·약속을 이어갈 수 있어요.",
);
const dogSelector = () =>
  select(
    "dog",
    "기준 반려견",
    [
      ["보리", "보리"],
      ["콩이", "콩이"],
    ],
    state.dog,
  );
const tabs = (selected) =>
  `<div class="tabs">${link("MATCH-01", "대화", selected === "matches" ? "selected" : "")}${link("LIKES-01", "받은 관심", selected === "likes" ? "selected" : "")}${link("APPT-LIST", "약속", selected === "appointments" ? "selected" : "")}</div>`;
const appointmentLabels = {
  proposed: "응답 대기",
  accepted: "성사됨",
  rejected: "거절됨",
  canceled: "취소됨",
};
const currentAppointment = () =>
  state.appointments.find((a) => a.id === state.appointmentId) ||
  state.appointments[0];
const appointmentCard = (a) =>
  `<section class="appointment-card"><span class="pill">${a.status === "accepted" ? "성사된 약속" : a.status === "canceled" ? "취소된 약속" : a.direction === "sent" ? "보낸 제안" : "받은 제안"} · ${appointmentLabels[a.status]}</span><h3>${esc(state.dog)} ↔ ${esc(a.otherDog || "구름")}</h3><p>${esc(a.date)} · ${esc(a.startTime)}–${esc(a.endTime)}<br>${esc(a.placeText)}</p>${a.status === "canceled" ? `<p><strong>취소 사유</strong><br>${esc(a.cancellationReason)}</p>` : ""}${a.status === "proposed" && a.direction === "received" && !a.historical ? `<div class="actions">${btn("거절", "appointmentReject:" + a.id, "")}${btn("수락", "appointmentAccept:" + a.id)}</div>` : ""}${a.status === "accepted" && !a.historical ? btn("약속 취소", "appointmentCancel:" + a.id, "") : ""}${["CHAT-01", "CHAT-02"].includes(state.screen) ? "" : `<p>${btn("대화로 이동", "appointmentChat:" + a.id, "")}</p>`}</section>`;
const photo = (cls = "dog-photo") =>
  `<img class="${cls}" src="${PHOTO}" alt="하네스를 착용하고 공원에서 산책하는 반려견">`;
const petName = () => state.draft.name || state.viewedDog || state.dog;
const objectParticle = (name) => {
  const c = name.charCodeAt(name.length - 1);
  return c >= 0xac00 && c <= 0xd7a3
    ? (c - 0xac00) % 28
      ? "을"
      : "를"
    : "을(를)";
};
const guardianPhoto = () =>
  `<div class="guardian-photo" role="img" aria-label="보호자 사진 자리">보호자 사진${state.guardianPhoto ? " 선택됨" : " 영역"}</div>`;
const publicGuardian = (d) =>
  `<div class="public-guardian">${d.guardian.photoUrl ? `<img class="guardian-avatar" src="${esc(d.guardian.photoUrl)}" alt="${esc(d.guardian.nickname)}의 보호자 사진">` : '<span class="guardian-avatar" role="img" aria-label="보호자 사진 자리">사진</span>'}<div><strong>${esc(d.guardian.nickname)}</strong><small>${esc(d.identity)}</small></div></div>`;
const starRating = () =>
  `<fieldset class="star-rating"><legend>만남 경험</legend><div class="rating-options">${[1, 2, 3, 4, 5].map((n) => `<label><input type="radio" name="rating" value="${n}" required aria-label="${n}점"><span aria-hidden="true">☆</span></label>`).join("")}</div><output id="rating-value" aria-live="polite">별 1~5개를 선택해 주세요.</output></fieldset>`;
const profile = (d, received = false, own = false) =>
  `${photo("hero detail-photo")}<h2>${d.name} <small>${d.age}살 · ${d.size}</small></h2><p class="muted">${own ? "망원동" : `망원동 · ${d.distance} · ${d.identity}`}</p>${!own && !received ? publicGuardian(d) : ""}${own ? "" : received ? '<span class="pill">나에게 관심을 보냈어요</span>' : '<span class="pill">아주 잘 맞아요</span><p>산책 속도가 비슷해요.<br>주말 가능 시간이 겹쳐요.</p>'}<h3>${own ? `우리 ${esc(d.name)}${objectParticle(d.name)} 소개해요` : "반려견을 소개해요"}</h3><p>${params.has("long") ? "처음에는 충분한 거리를 두고 천천히 인사해요. 익숙해지면 나란히 걸어요. ".repeat(20).slice(0, 500) : d.intro}</p><h3>함께 걷는 조건</h3><p>${d.time}<br>믹스견 · 남아 · 12kg · 중성화 완료<br>보통 산책 강도 · 낯선 반려견에게 차분함<br>공격성 없음 · 예방접종 완료 · 반려동물등록 완료</p>`;
const candidate = (i, received = false) => {
  const d = DOGS[i];
  return `<section class="candidate"><a href="?screen=${received ? "LIKES-02" : "REC-03"}" data-screen="${received ? "LIKES-02" : "REC-03"}" data-candidate="${i}">${photo()}<h2>${d.name} <small>${d.age}살 · ${d.size}</small></h2><p class="muted">망원동 · ${d.distance} · ${d.identity}</p>${!received ? publicGuardian(d) : ""}${received ? "<p>10월 22일 오전에 도착한 관심</p>" : '<span class="pill">아주 잘 맞아요</span><p>산책 속도가 비슷해요 · 주말 오전 가능</p>'}<p>자세히 보기 →</p></a></section>`;
};
const confirm = (heading, copy, action, label) =>
  `<div><h2>${heading}</h2><p>${copy}</p><div class="actions">${btn("취소", "closePopup", "")}${btn(label, action, "danger")}</div></div>`;
const views = {
  login: () =>
    `${photo("hero")}<h2>우리에게 맞는<br>산책 친구를 만나요</h2><p class="muted">반려견의 속도에 맞춰서,즐겁게.</p>${form(field("email", "이메일", "email", "", 'required autocomplete="username"') + field("password", "비밀번호", "password", "", 'required autocomplete="current-password"'), "로그인", "login")}<p>${link("AUTH-02", "처음 오셨나요? 회원가입")}</p>`,
  signup: () =>
    `<h2>함께 걸을 준비</h2><p class="muted">유형·성별·찾기 상태를 직접 선택해 주세요.</p>${form(field("nickname", "닉네임", "text", "", 'required maxlength="30"') + field("email", "이메일", "email", "", 'required autocomplete="email"') + field("password", "비밀번호", "password", "", 'required minlength="8" maxlength="72" autocomplete="new-password"') + field("passwordConfirmation", "비밀번호 확인", "password", "", 'required maxlength="72" autocomplete="new-password"') + '<p class="muted">8~72자 · 영문 대문자·소문자·숫자·특수문자(! @ # $ % ^ & *) 포함 · 공백 불가</p>' + choices("profileType", "보호자 유형", typeOptions) + '<div id="gender-fields" hidden></div>' + choices("discoveryStatus", "메이트 찾기 상태", finderOptions) + finderHelp, "회원가입", "signup")}<p>${link("AUTH-01", "로그인으로")}</p>`,
  restore: () =>
    `<div class="restoring" role="status" aria-busy="true"><span class="spinner" aria-hidden="true"></span><p>안전하게 로그인 상태를 확인하고 있어요.</p></div>`,
  authError: () =>
    `<h2>로그인할 수 없어요</h2><p role="alert">계정이 제한되어 이용할 수 없어요.</p>${btn("로그인으로", "loginPage")}`,
  restoreError: () =>
    `<h2>연결을 확인해 주세요</h2><p role="alert">로그인 상태를 확인하지 못했어요.</p><div class="actions">${btn("재시도", "restore")}${btn("다시 로그인", "loginPage", "")}</div>`,
  logout: () =>
    confirm(
      "로그아웃할까요?",
      "이 기기에서 로그아웃할까요?",
      "loginPage",
      "로그아웃",
    ),
  withdraw: () =>
    confirm(
      "정말 탈퇴할까요?",
      "탈퇴하면 서비스를 이용할 수 없으며 계정을 복구할 수 없어요.",
      "loginPage",
      "탈퇴",
    ),
  dogEmpty: () =>
    `<h2>첫 산책 친구를<br>찾아볼까요?</h2><p>반려견의 성향과 산책 조건을 알려주세요.</p>${btn("반려견 등록", "dogStart")}<p>${link("GUARDIAN-01", "보호자 설정")} · ${link("AUTH-04", "로그아웃")}</p>`,
  dogs: () =>
    `<h2>나의 반려견</h2><p class="muted">반려견을 누르면 상세 프로필을 볼 수 있어요.</p>${["보리", "콩이"].map((n) => `<a class="row dog-row" href="?screen=DOG-06" data-action="openDog:${n}">${photo()}<div class="grow"><strong>${n}</strong><small>${state.dog === n ? "현재 기준 반려견" : "상세 프로필 보기"}</small></div><span aria-hidden="true">›</span></a>`).join("")}${btn("반려견 추가", "dogStart")}`,
  dogBasic: () =>
    `<p class="step">1 / 4 · 기본 정보</p><h2>어떤 친구인가요?</h2>${form(
      field("photo", "반려견 사진", "file", "", 'accept="image/*" required') +
        field("name", "이름", "text", "", 'required maxlength="30"') +
        select("breed", "견종", [
          ["mixed_breed", "믹스견"],
          ["maltese", "말티즈"],
          ["poodle", "푸들"],
          ["pomeranian", "포메라니안"],
          ["shih_tzu", "시추"],
          ["bichon_frise", "비숑 프리제"],
          ["chihuahua", "치와와"],
          ["yorkshire_terrier", "요크셔테리어"],
          ["dachshund", "닥스훈트"],
          ["beagle", "비글"],
          ["french_bulldog", "프렌치 불도그"],
          ["welsh_corgi", "웰시코기"],
          ["golden_retriever", "골든 리트리버"],
          ["labrador_retriever", "래브라도 리트리버"],
          ["jindo", "진돗개"],
          ["other", "기타"],
        ]) +
        field(
          "age",
          "만 나이 (1살 미만은 0)",
          "number",
          "",
          'required min="0" max="30" step="1"',
        ) +
        choices("sex", "반려견 성별", genderOptions),
      "다음",
      "stepHealth",
    )}`,
  dogHealth: () =>
    `<p class="step">2 / 4 · 신체와 건강</p><h2>건강하게 함께 걸어요</h2>${form(
      field(
        "weightKg",
        "몸무게 (kg)",
        "number",
        "",
        'required min="0.1" max="100" step="0.1"',
      ) +
        choices("sizeGroup", "크기", [
          ["small", "소형"],
          ["medium", "중형"],
          ["large", "대형"],
        ]) +
        ["중성화", "예방접종", "반려동물등록"]
          .map((t, i) =>
            choices("health" + i, t, [
              ["true", "완료"],
              ["false", "미완료"],
            ]),
          )
          .join(""),
      "다음",
      "stepBehavior",
    )}`,
  dogBehavior: () =>
    `<p class="step">3 / 4 · 성향과 행동</p><h2>${esc(petName())}의 속도</h2>${form(
      select("preferredWalkIntensity", "산책 강도", [
        ["slow", "느긋하게"],
        ["moderate", "보통"],
        ["active", "활발하게"],
      ]) +
        select("unfamiliarDogReaction", "낯선 반려견 반응", [
          ["calm", "차분함"],
          ["cautious", "조심스러움"],
          ["excited", "흥분함"],
        ]),
      "다음",
      "stepIntro",
    )}`,
  dogIntro: () =>
    `<p class="step">4 / 4 · 지역·시간·소개</p><h2>우리의 산책을 소개해요</h2>${form(
      field(
        "primaryActivityArea",
        "주 활동 지역",
        "text",
        "서울특별시 마포구 망원동",
        'required maxlength="100"',
      ) +
        '<p class="muted">지역명 확인 후 근사 위치로 저장해요. 현재 위치 권한은 요청하지 않아요.</p>' +
        select("dayOfWeek", "가능 요일", [
          ["monday", "월요일"],
          ["tuesday", "화요일"],
          ["wednesday", "수요일"],
          ["thursday", "목요일"],
          ["friday", "금요일"],
          ["saturday", "토요일"],
          ["sunday", "일요일"],
        ]) +
        field("startTime", "시작 시간", "time", "10:00", "required") +
        field("endTime", "종료 시간", "time", "12:00", "required") +
        textarea("selfIntroduction", "반려견 소개 (최대 500자)", DOGS[0].intro),
      state.editing ? "수정 완료" : "등록 완료",
      "saveDog",
    )}`,
  dogDetail: () =>
    `${profile({ ...DOGS[0], ...state.savedDogs[state.viewedDog || state.dog], name: state.viewedDog || state.dog }, false, true)}${btn("프로필 수정", "editDog")}`,
  guardianInfo: () =>
    `<h2>내 정보</h2>${guardianPhoto()}<h3>${esc(state.nickname)}</h3><p>${state.guardian.profileType === "individual" ? (state.guardian.gender === "male" ? "개인 · 남성" : "개인 · 여성") : state.guardian.profileType === "couple" ? "커플" : "가족"}</p><p>메이트 ${state.discovery === "searching" ? "찾는 중" : "쉬는 중"}</p>${btn("내 정보 수정", "editGuardian")}<p>${link("AUTH-04", "로그아웃")}</p><p>${link("GUARDIAN-02", "탈퇴하기")}</p>`,
  guardian: () => `<h2>내 정보 수정</h2>${guardianPhoto()}${form(
    field(
      "nickname",
      "닉네임",
      "text",
      state.nickname,
      'required maxlength="30"',
    ) +
      field(
        "guardianPhoto",
        "보호자 사진 (선택)",
        "file",
        "",
        'accept="image/jpeg,image/png,image/webp"',
      ) +
      choices(
        "profileType",
        "보호자 유형",
        typeOptions,
        state.guardian.profileType,
      ) +
      `<div id="gender-fields" ${state.guardian.profileType !== "individual" ? "hidden" : ""}>` +
      (state.guardian.profileType === "individual" ? genderFields(true) : "") +
      "</div>" +
      choices(
        "discoveryStatus",
        "메이트 찾기 상태",
        finderOptions,
        state.discovery,
      ) +
      finderHelp,
    "저장",
    "saveGuardian",
  )}
    <p>${link("AUTH-04", "로그아웃")}</p><p>${link("GUARDIAN-02", "탈퇴하기")}</p>`,
  recommendations: () =>
    state.discovery === "paused"
      ? views.paused()
      : `<h2>함께 걸으면 좋을 친구</h2>${dogSelector()}<p>${link("REC-02", "선호 조건 설정")}</p>${DOGS.map((_, i) => ((state.filters.regionIds?.length && !state.filters.regionIds.includes(DOGS[i].regionId)) || i === state.filters.passed || (state.filters.identities?.length && !state.filters.identities.some((t) => DOGS[i].identity.startsWith(t))) ? "" : candidate(i))).join("")}`,
  filters: () =>
    `<h2>우리에게 맞는 조건</h2><p class="muted">선호 조건은 추천에만 적용돼요. 안전 제외는 항상 유지돼요.</p>${form(
      [
        ["sizeGroups", "크기", ["소형", "중형", "대형"]],
        ["walkIntensities", "산책 강도", ["느긋하게", "보통", "활발하게"]],
        [
          "sociabilityLevels",
          "낯선 반려견 반응",
          ["차분함", "조심스러움", "흥분함"],
        ],
        [
          "availableDays",
          "가능 요일",
          ["월", "화", "수", "목", "금", "토", "일"],
        ],
        ["guardianIdentities", "보호자 정보", ["여성", "남성", "커플", "가족"]],
      ]
        .map(
          ([n, t, opts]) =>
            `<fieldset><legend>${t}</legend>${opts.map((v) => `<label><input name="${n}" type="checkbox" value="${v}">${v}</label>`).join("")}</fieldset>`,
        )
        .join("") +
        regionPicker() +
        '<button type="reset">조건 초기화</button>',
      "적용",
      "applyFilters",
    )}`,
  detail: () =>
    `${profile(DOGS[state.candidate])}<div class="actions">${btn("패스", "pass", "")}${btn("관심 있어요", "like")}</div>`,
  mutual: () =>
    `<h2>함께 걷고 싶은<br>마음이 만났어요</h2>${photo()}<p>${state.dog} · ${DOGS[state.candidate].name}<br>새로운 산책 친구로 연결됐어요.</p><div class="actions">${btn("메시지 보내기", "chat")}${btn("목록으로", "list", "")}</div>`,
  paused: () =>
    `<span class="pill">쉬는 중</span><h2>지금은 새로운<br>만남을 쉬고 있어요</h2><p>나도 추천받지 않고 다른 사람의 추천에도 나오지 않아요.</p>${notice("이전에 받은 관심에는 응답할 수 있어요. 연결된 친구와 대화·약속도 계속할 수 있어요.")}<div class="actions">${btn("받은 관심 보기", "likes")}${btn("설정에서 재개", "settings", "")}</div>`,
  appointments: () =>
    `${tabs("appointments")}<h2>산책 약속</h2><div class="tabs appointment-boxes" role="tablist" aria-label="약속 분류">${[
      ["sent", "보낸 제안"],
      ["received", "받은 제안"],
      ["accepted", "성사된 약속"],
      ["canceled", "취소된 약속"],
    ]
      .map(
        ([value, label]) =>
          `<button type="button" role="tab" aria-selected="${state.appointmentBox === value}" data-action="appointmentBox:${value}">${label}</button>`,
      )
      .join("")}</div>${
      state.appointments
        .filter((a) =>
          state.appointmentBox === "canceled"
            ? a.status === "canceled"
            : state.appointmentBox === "accepted"
              ? a.status === "accepted"
              : !["canceled", "accepted"].includes(a.status) &&
                a.direction === state.appointmentBox,
        )
        .map(appointmentCard)
        .join("") || "<p>아직 이 분류의 약속이 없어요.</p>"
    }`,
  matches: () =>
    `${tabs("matches")}<h2>함께 걷는 친구</h2>${[
      ["CHAT-01", "구름", "내가 제안한 약속 · 상대가 취소했어요"],
      ["CHAT-02", "두부", "받은 제안 · 약속이 성사됐어요"],
    ]
      .map(
        ([id, name, text]) =>
          `<a class="row" href="?screen=${id}" data-screen="${id}">${photo()}<div class="grow"><strong>${name}</strong><small>${text}</small></div></a>`,
      )
      .join("")}`,
  likes: () =>
    `${tabs("likes")}<h2>${esc(state.dog)}에게 온 관심</h2>${dogSelector()}<p class="muted">찾기 상태와 상관없이 이전 관심에 응답할 수 있어요.</p>${
      state.received.length
        ? state.received
            .slice(0, state.likesPage)
            .map((i) => candidate(i, true))
            .join("")
        : "<p>아직 받은 관심이 없어요.</p>"
    }${state.likesPage < state.received.length ? btn("관심 더 보기", "nextLikes", "") : ""}`,
  likeDetail: () =>
    `${profile(DOGS[state.candidate], true)}<div class="actions">${btn("패스", "receivedPass", "")}${btn("관심 있어요", "receivedLike")}</div><p class="muted">지금 쉬는 중이어도 이 관심에 응답할 수 있어요.</p>`,
  chat: () => {
    const first = state.chatId === "CHAT-01";
    const base = state.appointments.find(
      (a) => a.id === (first ? "canceled-demo" : "accepted-demo"),
    );
    const proposed = appointmentCard({
      ...base,
      status: "proposed",
      cancellationReason: null,
      historical: true,
    });
    const accepted = appointmentCard({
      ...base,
      status: "accepted",
      cancellationReason: null,
      historical: true,
    });
    const history = first
      ? `<div class="bubble mine">토요일 오전 10시에 망원공원에서 함께 걸을까요?</div>${proposed}<div class="bubble">좋아요! 구름이도 그 시간에 산책해요. 약속 수락했어요.</div>${accepted}<div class="bubble mine">그럼 입구에서 만나요. 처음에는 거리를 두고 인사해요.</div><div class="bubble">네, 좋아요. 그런데 오늘 구름이 컨디션이 좋지 않아서 쉬어야 할 것 같아요. 미안하지만 약속을 취소할게요.</div>${appointmentCard(base)}`
      : `<div class="bubble">일요일 오전 9시에 망원공원에서 산책할까요?</div>${proposed}<div class="bubble mine">좋아요! 두부와 함께 걸어요. 약속 수락했어요.</div>${appointmentCard(base)}<div class="bubble">좋아요. 입구에서 천천히 인사하고 같이 걸어요!</div>`;
    return `<p class="muted">${esc(state.dog)} ↔ ${first ? "구름" : "두부"}</p><div id="chat-appointments">${history}${state.appointments
      .filter((a) => a.chatId === state.chatId && a.id !== base.id)
      .map(appointmentCard)
      .join(
        "",
      )}</div><div id="messages"></div>${link("APPT-01", "약속 제안")}<form data-submit="send"><label>메시지<input name="message" maxlength="2000" required autocomplete="off"></label><button type="submit" class="primary wide">보내기</button></form>`;
  },
  chatSettings: () =>
    `<h2>채팅 설정</h2><p>${link("MATCH-CLOSE-01", "매칭 종료")}</p><p>${link("SAFE-01", "차단")}</p><p>${link("SAFE-02", "신고")}</p>${btn("닫기", "closePopup", "")}`,
  sent: () =>
    `<h2>관심을 보냈어요</h2><p>${esc(DOGS[state.candidate].name)}에게 마음을 전했어요. 상대도 관심을 보내면 연결돼요.</p>${btn("확인", "sentDone")}`,
  close: () =>
    confirm(
      "매칭을 종료할까요?",
      "이 대화에서 메시지를 조회하거나 보낼 수 없게 돼요. 차단·신고와는 달라요.",
      "matches",
      "매칭 종료",
    ),
  appointment: () =>
    `<h2>함께 걸을 약속</h2>${form(field("date", "날짜", "date", "", "required") + field("startTime", "시작 시간", "time", "10:00", "required") + field("endTime", "종료 시간", "time", "11:00", "required") + field("place", "장소", "text", "망원공원 입구", 'required maxlength="200"'), "약속 제안", "propose")}`,
  receivedAppointment: () => views.chat(),
  acceptedAppointment: () =>
    appointmentCard({ ...currentAppointment(), status: "accepted" }),
  cancelAppointment: () =>
    `<h2>약속을 취소할까요?</h2>${form(textarea("reason", "취소 사유"), "취소 확인", "cancelAppointment")}`,
  review: () =>
    `<h2>산책은 어땠나요?</h2><p class="muted">종료된 성사 약속에 한 번만 작성해요. 원문과 점수는 상대에게 공개되지 않아요.</p>${form(
      starRating() +
        "<fieldset><legend>경험 태그 (선택)</legend>" +
        [
          "시간 약속을 잘 지켰어요",
          "소통이 배려 깊었어요",
          "반려견을 안전하게 돌봤어요",
          "프로필 정보가 정확했어요",
          "다시 만나고 싶어요",
        ]
          .map((t) => `<label><input type="checkbox" name="tags">${t}</label>`)
          .join("") +
        '</fieldset><label>한 줄 의견 (선택)<textarea name="comment" maxlength="500"></textarea></label>',
      "평가 제출",
      "review",
    )}`,
  block: () =>
    confirm(
      "보호자를 차단할까요?",
      "관련 추천·채팅 상호작용이 종료돼요.",
      "matches",
      "차단",
    ),
  report: () =>
    `<h2>어떤 일이 있었나요?</h2>${form(
      select("reason", "신고 사유", [
        ["inappropriate_language", "부적절한 언어"],
        ["harassment", "괴롭힘"],
        ["threatening_behavior", "위협적 행동"],
        ["unsafe_dog_handling", "위험한 반려견 관리"],
        ["false_profile", "허위 프로필"],
        ["no_show", "약속 불참"],
        ["other", "기타"],
      ]) +
        '<label>추가 설명 (선택 · 최대 1000자)<textarea name="comment" maxlength="1000"></textarea></label>',
      "신고 제출",
      "report",
    )}`,
};
function closeFilters() {
  $("filter-dialog").close();
  params.set("screen", "REC-01");
  history.replaceState(null, "", "?" + params);
}
function openFilters() {
  const dialog = $("filter-dialog");
  regionDraft = [...(state.filters.regionIds || [])];
  $("filter-content").innerHTML = views
    .filters()
    .replace("<h2>우리에게 맞는 조건</h2>", "");
  document.querySelector('[name="locality"]').required = false;
  renderSelectedRegions();
  for (const el of dialog.querySelectorAll("[name=guardianIdentities]"))
    el.checked = state.filters.identities?.includes(el.value) || false;
  $("phone").scrollIntoView({ block: "center", behavior: "instant" });
  const rect = $("phone").getBoundingClientRect();
  dialog.style.width = Math.min(350, rect.width - 32) + "px";
  dialog.style.left = rect.left + rect.width / 2 + "px";
  dialog.style.top =
    Math.max(20, Math.min(rect.top + rect.height / 2, window.innerHeight / 2)) +
    "px";
  dialog.showModal();
  const shown = $("phone").getBoundingClientRect();
  dialog.style.top = Math.min(shown.top + shown.height / 2, window.innerHeight / 2) + "px";
}
$("filter-dialog").addEventListener("cancel", (e) => {
  e.preventDefault();
  closeFilters();
});
function navigate(id) {
  closePopup();
  if ($("filter-dialog").open) closeFilters();

  if (id !== state.screen) state.stack.push(state.screen);
  state.screen = id;
  state.status = "ready";
  state.busy = false;
  params.set("screen", id === "REC-02" ? "REC-01" : id);
  history.replaceState(null, "", "?" + params);
  render();
}
const popupBases = {
  "AUTH-04": "GUARDIAN-01",
  "GUARDIAN-02": "GUARDIAN-01",
  "MATCH-CLOSE-01": "CHAT-01",
  "SAFE-01": "CHAT-01",
  "CHAT-SETTINGS": "CHAT-01",
  "REC-SENT": "REC-01",
  "REC-04": "REC-03",
  "APPT-01": "CHAT-01",
  "APPT-03": "CHAT-01",
  "APPT-04": "CHAT-01",
  "SAFE-02": "CHAT-01",
};
function closePopup() {
  if ($("action-dialog").open) $("action-dialog").close();
}
function openPopup(id) {
  const screen = SCREENS.find((x) => x.id === id);
  $("action-content").innerHTML = views[screen.view]();
  const dialog = $("action-dialog");
  dialog.dataset.presentation = ["APPT-01", "APPT-03", "APPT-04", "SAFE-02", "REC-04"].includes(id) ? "sheet" : "alert";
  dialog.setAttribute("aria-label", screen.title);
  if (dialog.dataset.presentation === "sheet") $("action-content").insertAdjacentHTML("afterbegin", '<div class="sheet-toolbar"><button type="button" data-action="closePopup">닫기</button></div>');
  $("phone").scrollIntoView({ block: "center", behavior: "instant" });
  const r = $("phone").getBoundingClientRect();
  dialog.style.width = Math.min(350, r.width - 32) + "px";
  dialog.style.left = r.left + r.width / 2 + "px";
  dialog.style.top =
    Math.min(r.top + r.height / 2, window.innerHeight / 2) + "px";
  dialog.style.bottom = "auto";
  dialog.style.transform = "translate(-50%, -50%)";
  if (dialog.dataset.presentation === "sheet") {
    dialog.style.top = "auto";
    dialog.style.bottom = Math.max(16, window.innerHeight - Math.min(r.bottom, window.innerHeight)) + "px";
    dialog.style.transform = "translateX(-50%)";
  }
  dialog.showModal();
  // showModal activates the fixed-height export frame; position against that frame.
  const shown = $("phone").getBoundingClientRect();
  dialog.style.maxHeight = Math.min(window.innerHeight * .75, shown.height - 48) + "px";
  if (dialog.dataset.presentation === "sheet") dialog.style.bottom = Math.max(16, window.innerHeight - Math.min(shown.bottom, window.innerHeight)) + "px";
  else dialog.style.top = Math.min(shown.top + shown.height / 2, window.innerHeight / 2) + "px";
  if (["AUTH-04", "GUARDIAN-02"].includes(id)) $("api-scope").textContent = "M1 · 기존 로그아웃·탈퇴 API 서버 검증 기록 있음 · 앱 연동 대기";
}
$("action-dialog").addEventListener("cancel", (e) => {
  e.preventDefault();
  closePopup();
});
function render() {
  if (state.screen === "APPT-02") {
    state.screen = "CHAT-02";
    render();
    return;
  }

  if (popupBases[state.screen]) {
    const id = state.screen;
    state.screen = popupBases[id] === "CHAT-01" ? state.chatId : popupBases[id];
    render();
    openPopup(id);
    return;
  }

  if (state.screen === "REC-02") {
    state.screen = "REC-01";
    render();
    openFilters();
    return;
  }
  if (["CHAT-01", "CHAT-02"].includes(state.screen))
    state.chatId = state.screen;
  const screen = SCREENS.find((s) => s.id === state.screen) || SCREENS[0];
  state.screen = screen.id;
  document.body.className = [
    state.font === "large" ? "large" : "",
    params.has("export") ? "export" : "",
  ].join(" ");
  $("phone").style.setProperty("--phone-width", state.width + "px");
  $("phone").dataset.view = screen.view;
  $("phone").dataset.state = state.status;
  $("api-scope").textContent = ["AUTH-01", "AUTH-03", "AUTH-ERROR", "AUTH-RETRY"].includes(screen.id)
    ? "M1 · 기존 인증 API 서버 검증 기록 있음 · 앱 연동 대기"
    : ["AUTH-02", "GUARDIAN-01", "GUARDIAN-EDIT"].includes(screen.id)
      ? "M1 · 기존 유형·찾기 상태 검증 기록 있음 / 닉네임·사진 추가 계약 대기"
      : "후속 API 구현·검증 대기 · 디자인 예시";
  $("screen-caption").textContent = screen.id + " · " + screen.title;
  $("screen-picker").innerHTML = SCREENS.map(
    (s) =>
      `<option value="${s.id}" ${s.id === screen.id ? "selected" : ""}>${s.id} · ${s.title}</option>`,
  ).join("");
  $("screen-list").innerHTML = SCREENS.map(
    (s) =>
      `<a href="?screen=${s.id}" data-screen="${s.id}" ${s.id === screen.id ? 'aria-current="page"' : ""}>${s.id} · ${s.title}</a>`,
  ).join("");
  $("header").hidden = screen.tab === "auth";
  $("header").innerHTML =
    btn("이전", "back", "") +
    `<h1>${state.editing && screen.id.startsWith("DOG-0") && ["DOG-02", "DOG-03", "DOG-04", "DOG-05"].includes(screen.id) ? screen.title.replace("등록", "수정") : screen.id === "CHAT-01" ? "구름" : screen.id === "CHAT-02" ? "두부" : screen.title}</h1>` +
    (["CHAT-01", "CHAT-02"].includes(state.screen)
      ? link("CHAT-SETTINGS", "채팅 설정")
      : "");
  let html = views[screen.view]();
  $("content").innerHTML = html;
  const previewForm = screen.view === "chat" ? null : $("content").querySelector("form");
  const previewField = previewForm?.querySelector('input:not([type="file"]):not([type="radio"]):not([type="checkbox"]), select, textarea');
  const supportedStates = {
    "field-error": Boolean(previewField),
    submitting: Boolean(previewForm?.querySelector('button[type="submit"]')),
    "chat-error": screen.view === "chat",
  };
  for (const option of $("state").options) {
    option.disabled = supportedStates[option.value] === false;
  }
  const unsupported = supportedStates[state.status] === false;
  if (unsupported) state.status = "ready";
  $("state-help").textContent = (unsupported ? "요청한 상태는 이 화면에 적용되지 않아 기본 상태로 표시합니다. " : "") +
    "필드 오류·제출 중은 폼 화면, 연결·전송 실패는 채팅에서 확인할 수 있어요. 적용할 수 없는 항목은 비활성화됩니다.";
  if (["loading", "empty", "error"].includes(state.status)) {
    const empty = {
      recommendations: ["아직 맞는 친구가 없어요", "선호 조건이나 기준 반려견을 바꿔서 다시 찾아보세요.", "선호 조건 보기", "filters"],
      dogs: ["등록된 반려견이 없어요", "반려견을 등록하고 함께 걸을 친구를 찾아보세요.", "반려견 등록", "dogStart"],
      matches: ["아직 연결된 친구가 없어요", "서로 관심을 보내면 여기에서 대화를 시작할 수 있어요.", "추천 보기", "list"],
      likes: ["아직 받은 관심이 없어요", "관심이 도착하면 여기에서 확인할 수 있어요.", "기본 화면으로", "ready"],
      chat: ["첫 인사를 건네 보세요", "상대 반려견의 속도에 맞춰 천천히 대화를 시작해요.", "대화로 돌아가기", "ready"],
    }[screen.view] || ["아직 표시할 내용이 없어요", "이 상태는 목록의 빈 결과를 확인하는 디자인 예시예요.", "기본 화면으로", "ready"];
    html = state.status === "loading"
      ? '<section class="state-panel" role="status" aria-busy="true"><span class="spinner" aria-hidden="true"></span><h2>불러오는 중이에요</h2><p>잠시만 기다려 주세요.</p></section>'
      : state.status === "empty"
        ? `<section class="state-panel"><span class="state-kicker">아직은 조용한 산책길</span><h2>${empty[0]}</h2><p>${empty[1]}</p>${btn(empty[2], empty[3])}</section>`
        : `<section class="state-panel"><span class="state-kicker error">연결 오류</span><h2>불러오지 못했어요</h2><p role="alert">연결을 확인한 뒤 다시 시도해 주세요.</p>${btn("재시도", "ready")}</section>`;
  }
  $("content").innerHTML = html;
  if (state.status === "field-error") {
    const input = $("content").querySelector('form input:not([type="file"]):not([type="radio"]):not([type="checkbox"]), form select, form textarea');
    if (input) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", "preview-field-error");
      input.insertAdjacentHTML("afterend", '<span id="preview-field-error" class="field-error" role="alert">입력한 내용을 확인해 주세요.</span>');
    }
  }
  if (state.status === "submitting") {
    const form = $("content").querySelector("form");
    if (form) {
      form.setAttribute("aria-busy", "true");
      form.querySelectorAll("input,select,textarea,button").forEach((el) => el.disabled = true);
      form.querySelector('button[type="submit"]').textContent = "처리 중이에요…";
      form.insertAdjacentHTML("beforeend", '<p role="status" class="muted">잠시만 기다려 주세요. 중복으로 요청하지 않아요.</p>');
    }
  }
  if (state.status === "chat-error" && screen.view === "chat") {
    $("content").insertAdjacentHTML("afterbegin", '<div class="notice" role="status">연결이 끊겼어요. 다시 연결하고 있어요.</div>');
    $("messages").innerHTML = '<div class="bubble mine">조금 일찍 도착할 것 같아요.</div><p class="message-failure" role="alert">전송하지 못했어요. <button type="button" data-action="ready">다시 보내기</button></p>';
    $("content").querySelector('button[type="submit"]').disabled = true;
  }
  $("content").scrollTop = 0;
  $("footer").hidden = screen.tab === "auth";
  $("footer").innerHTML = `<nav aria-label="앱 탭">${[
    ["REC-01", "추천", "recommendations"],
    ["MATCH-01", "매칭", "matches"],
    ["DOG-01", "내 반려견", "dogs"],
    ["GUARDIAN-01", "내 정보", "guardian"],
  ]
    .map(([id, t, tab]) => link(id, t, screen.tab === tab ? "active" : ""))
    .join("")}</nav>`;
  ["width", "font", "discovery"].forEach((k) => ($(k).value = state[k]));
  $("state").value = state.status;
  if (screen.view === "guardian") lockGender();
  if (state.editing && screen.view === "dogBasic") {
    const input = document.querySelector('[name="photo"]');
    input.required = false;
    input.insertAdjacentHTML(
      "afterend",
      "<small>사진을 선택하지 않으면 기존 사진을 유지해요.</small>",
    );
  }
  if (
    ["dogBasic", "dogHealth", "dogBehavior", "dogIntro"].includes(screen.view)
  ) {
    for (const el of $("content").querySelectorAll("input,select,textarea")) {
      if (el.type === "file") continue;
      const v = state.draft[el.name];
      if (v === undefined) continue;
      if (el.type === "radio") el.checked = el.value === v;
      else el.value = v;
    }
  }
  window.decorateDesign?.(screen);
}
function lockGender() {
  document
    .querySelectorAll("[name=gender]")
    .forEach((el) => (el.disabled = state.guardian.gender !== null));
}
function action(name) {
  if (name === "addRegion") {
    const id = document.querySelector("[name=locality]").value;
    if (!id) {
      $("region-error").textContent = "읍·면·동을 선택해 주세요.";
      return;
    }
    if (regionDraft.includes(id)) {
      $("region-error").textContent = "이미 선택한 지역이에요.";
      return;
    }
    if (regionDraft.length >= 3) {
      $("region-error").textContent = "지역은 최대 3개까지 선택할 수 있어요.";
      return;
    }
    regionDraft.push(id);
    $("region-error").textContent = "";
    renderSelectedRegions();
    return;
  }
  if (name.startsWith("removeRegion:")) {
    regionDraft = regionDraft.filter((id) => id !== name.split(":")[1]);
    $("region-error").textContent = "";
    renderSelectedRegions();
    return;
  }

  if (name.startsWith("appointmentBox:")) {
    state.appointmentBox = name.split(":")[1];
    render();
    return;
  }
  if (
    name.startsWith("appointmentAccept:") ||
    name.startsWith("appointmentReject:")
  ) {
    const [operation, id] = name.split(":");
    state.appointmentId = id;
    const a = currentAppointment();
    if (a.status !== "proposed" || a.direction !== "received") return;
    a.status = operation === "appointmentAccept" ? "accepted" : "rejected";
    if (a.status === "accepted" && state.screen === "APPT-LIST")
      state.appointmentBox = "accepted";
    render();
    return;
  }
  if (name.startsWith("appointmentCancel:")) {
    state.appointmentId = name.split(":")[1];
    navigate("APPT-03");
    return;
  }
  if (name.startsWith("appointmentChat:")) {
    state.appointmentId = name.split(":")[1];
    navigate(currentAppointment().chatId);
    return;
  }

  if (name === "closePopup") {
    closePopup();
    return;
  }
  if (name === "sentDone") {
    closePopup();
    navigate("REC-01");
    return;
  }
  if (name === "editGuardian") {
    navigate("GUARDIAN-EDIT");
    return;
  }
  if (name === "saveDog") {
    const name = state.draft.name || petName();
    state.savedDogs[name] = {
      ...state.draft,
      name,
      age: Number(state.draft.age || 3),
      intro: state.draft.selfIntroduction || DOGS[0].intro,
    };
    state.viewedDog = name;
    navigate("DOG-06");
    return;
  }

  if (name === "closeFilters") {
    closeFilters();
    return;
  }
  if (name.startsWith("openDog:")) {
    state.viewedDog = name.slice("openDog:".length);
    navigate("DOG-06");
    return;
  }

  if (name === "editDog") {
    state.editing = true;
    state.draft = {
      name: state.viewedDog || state.dog,
      breed: "mixed_breed",
      age: "3",
      sex: "male",
      weightKg: "12",
      sizeGroup: "medium",
      health0: "true",
      health1: "true",
      health2: "true",
      sociability: "high",
      aggressionLevel: "none",
      preferredWalkIntensity: "moderate",
      unfamiliarDogReaction: "calm",
      primaryActivityArea: "서울특별시 마포구 망원동",
      dayOfWeek: "saturday",
      startTime: "10:00",
      endTime: "12:00",
      selfIntroduction: DOGS[0].intro,
    };
    Object.assign(
      state.draft,
      state.savedDogs[state.viewedDog || state.dog] || {},
    );
  } else if (name === "dogStart") {
    state.editing = false;
    state.draft = {};
  }

  const map = {
    loginPage: "AUTH-01",
    restore: "DOG-01",
    dogStart: "DOG-02",
    stepHealth: "DOG-03",
    stepBehavior: "DOG-04",
    stepIntro: "DOG-05",
    saveDog: "DOG-06",
    editDog: "DOG-02",
    applyFilters: "REC-01",
    filters: "REC-02",
    chat: state.chatId,
    likes: "LIKES-01",
    matches: "MATCH-01",
    settings: "GUARDIAN-01",
    recommendations: "REC-01",
    propose: "APPT-02",
    accept: "APPT-ACCEPTED",
    cancelAppointment: "CHAT-01",
  };
  if (name.startsWith("selectDog:")) {
    state.dog = name.split(":")[1];
    render();
    return;
  }
  if (name === "back") {
    const prev = state.stack.pop() || "REC-01";
    state.screen = prev;
    params.set("screen", prev);
    history.replaceState(null, "", "?" + params);
    render();
    return;
  }
  if (name === "nextLikes") {
    state.likesPage++;
    render();
    return;
  }
  if (name === "ready") {
    state.status = "ready";
    render();
    return;
  }
  if (name === "list") {
    navigate(state.fromLikes ? "LIKES-01" : "REC-01");
    return;
  }
  if (name === "like" && state.discovery === "paused") {
    navigate("REC-PAUSED");
    return;
  }
  if (["receivedLike", "receivedPass"].includes(name)) {
    state.received = state.received.filter((i) => i !== state.candidate);
    state.fromLikes = true;
    navigate(name === "receivedLike" ? "REC-04" : "LIKES-01");
    return;
  }
  if (name === "like") {
    state.fromLikes = false;
    navigate("REC-SENT");
    return;
  }
  if (name === "pass") {
    state.filters.passed = state.candidate;
    navigate("REC-01");
    return;
  }
  if (name === "reject" || name === "report" || name === "review") {
    $("content").innerHTML =
      "<h2>제출 완료</h2>".replace(
        "제출 완료",
        name === "reject" ? "약속을 거절했어요" : "제출했어요",
      ) + btn("대화로", "chat");
    return;
  }
  if (map[name]) navigate(map[name]);
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-screen]");
  if (a) {
    e.preventDefault();
    if (a.dataset.candidate !== undefined)
      state.candidate = Number(a.dataset.candidate);
    navigate(a.dataset.screen);
    return;
  }
  const b = e.target.closest("[data-action]");
  if (b) {
    e.preventDefault();
    action(b.dataset.action);
  }
});
document.addEventListener("change", (e) => {
  if (["sido", "sigungu"].includes(e.target.name)) {
    const sido = document.querySelector('select[name="sido"]');
    const sigungu = document.querySelector('select[name="sigungu"]');
    const locality = document.querySelector('select[name="locality"]');
    if (e.target.name === "sido") {
      sigungu.value = "";
      sigungu.disabled = !sido.value;
    }
    locality.value = "";
    locality.disabled = !sido.value || !sigungu.value;
  }
  if (e.target.name === "rating") {
    const value = Number(e.target.value);
    for (const label of document.querySelectorAll(".rating-options label")) {
      const selected = Number(label.querySelector("input").value) <= value;
      label.querySelector("span").textContent = selected ? "★" : "☆";
      label.classList.toggle("filled", selected);
    }
    $("rating-value").textContent = value + "점";
  }

  if (e.target.name === "profileType") {
    const isIndividual = e.target.value === "individual";
    $("gender-fields").hidden = !isIndividual;
    const editing = state.screen === "GUARDIAN-EDIT";
    $("gender-fields").innerHTML = isIndividual ? genderFields(editing) : "";
    if (editing) lockGender();
  }
  if (e.target.name === "dog") {
    state.dog = e.target.value;
    state.received = [0, 1];
    render();
  }
});
document.addEventListener("reset", () => {
  regionDraft = [];
  renderSelectedRegions();
  if ($("region-error")) $("region-error").textContent = "";
});
// Confirmation is an input convenience: compare locally without storing either value.
function validatePasswordConfirmation(form, showFeedback = false) {
  const confirmation = form.elements.namedItem("passwordConfirmation");
  if (!confirmation) return true;
  const password = form.elements.namedItem("password");
  const matches = confirmation.value.length > 0 && confirmation.value === password.value;
  const feedback = form.querySelector("[data-password-confirmation-feedback]");
  const reveal = showFeedback || confirmation.value.length > 0;
  confirmation.setAttribute("aria-invalid", String(reveal && !matches));
  if (feedback) {
    feedback.textContent = !reveal ? "" : matches ? "비밀번호가 일치해요." : confirmation.value ? "비밀번호가 일치하지 않아요." : "비밀번호를 한 번 더 입력해 주세요.";
    feedback.dataset.tone = matches ? "success" : "error";
  }
  if (!matches && showFeedback && !feedback) $("form-error").textContent = "비밀번호가 일치하지 않아요.";
  return matches;
}

document.addEventListener("submit", (e) => {
  e.preventDefault();
  if (state.busy) return;
  const f = e.target;
  if (!f.reportValidity()) return;
  const data = new FormData(f);
  if (
    ["stepHealth", "stepBehavior", "stepIntro", "saveDog"].includes(
      f.dataset.submit,
    )
  ) {
    for (const [k, v] of data) if (k !== "photo") state.draft[k] = v;
  }
  if (
    data.has("startTime") &&
    data.has("endTime") &&
    data.get("startTime") >= data.get("endTime")
  ) {
    $("form-error").textContent = "종료 시간은 시작 시간보다 늦어야 해요.";
    return;
  }
  const name = f.dataset.submit;
  if (data.has("nickname") && !data.get("nickname").trim()) {
    $("form-error").textContent = "닉네임을 입력해 주세요.";
    return;
  }
  if (name === "cancelAppointment") {
    if (!data.get("reason").trim()) {
      $("form-error").textContent = "취소 사유를 입력해 주세요.";
      return;
    }
    const a = currentAppointment();
    a.status = "canceled";
    a.cancellationReason = data.get("reason").trim();
    state.appointmentBox = "canceled";
    navigate("APPT-LIST");
    return;
  }
  if (name === "propose") {
    const a = {
      id: "sent-" + Date.now(),
      chatId: state.chatId,
      otherDog: state.chatId === "CHAT-02" ? "두부" : "구름",
      direction: "sent",
      status: "proposed",
      date: data.get("date"),
      startTime: data.get("startTime"),
      endTime: data.get("endTime"),
      placeText: data.get("place"),
      cancellationReason: null,
    };
    state.appointments.unshift(a);
    state.appointmentId = a.id;
    state.appointmentBox = "sent";
    navigate("APPT-LIST");
    return;
  }
  if (name === "send") {
    const p = document.createElement("div");
    p.className = "bubble mine";
    p.textContent = data.get("message");
    $("messages").append(p);
    f.reset();
    return;
  }
  if (name === "applyFilters") {
    state.filters.identities = data.getAll("guardianIdentities");
    state.filters.regionIds = [...regionDraft];
    closeFilters();
    render();
    return;
  }
  if (name === "saveGuardian") {
    state.nickname = data.get("nickname").trim();
    if (data.get("guardianPhoto")?.size) state.guardianPhoto = true;
    state.guardian.profileType = data.get("profileType");
    if (
      state.guardian.profileType === "individual" &&
      state.guardian.gender === null
    )
      state.guardian.gender = data.get("gender");
    state.discovery = data.get("discoveryStatus");
    state.busy = true;
    f.querySelector("button[type=submit]").disabled = true;
    $("form-error").textContent = "";
    setTimeout(() => {
      $("content").innerHTML =
        "<h2>저장했어요</h2>" + btn("내 정보로", "settings");
      state.busy = false;
    }, 300);
    return;
  }
  if (name === "signup") {
    if (!validatePasswordConfirmation(f, true)) {
      f.elements.namedItem("passwordConfirmation").focus();
      return;
    }
    const pw = data.get("password");
    if (
      !/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,72}$/.test(
        pw,
      )
    ) {
      $("form-error").textContent = "비밀번호 조건을 확인해 주세요.";
      return;
    }
    state.discovery = data.get("discoveryStatus");
    state.nickname = data.get("nickname").trim();
    state.guardian = {
      profileType: data.get("profileType"),
      gender:
        data.get("profileType") === "individual" ? data.get("gender") : null,
    };
    navigate("DOG-01");
    return;
  }
  if (name === "login") {
    navigate("DOG-01");
    return;
  }
  state.busy = true;
  f.querySelector("button[type=submit]").disabled = true;
  setTimeout(() => {
    state.busy = false;
    action(name);
  }, 250);
});
["width", "font", "discovery"].forEach((k) =>
  $(k).addEventListener("change", (e) => {
    state[k] = e.target.value;
    params.set(k, state[k]);
    history.replaceState(null, "", "?" + params);
    render();
  }),
);
$("screen-picker").addEventListener("change", (e) => navigate(e.target.value));
$("state").addEventListener("change", (e) => {
  state.status = e.target.value;
  render();
});
render();
