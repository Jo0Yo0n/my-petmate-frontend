// 두 미리보기 진입점이 공유하는 설계 도구와 휴대폰 프레임.
const sunshine = document.documentElement.dataset.design === 'sunshine';
document.body.innerHTML = `
    <aside class="studio">
      <a class="brand" href="?screen=REC-01">My Petmate <small>${sunshine ? 'SUNSHINE / DESIGN' : 'WIREFRAME SOURCE'}</small></a>
      <p>${sunshine ? 'Sunshine 적용: F1 전체·F3 추천 목록/상세·F5 채팅(F6 약속 카드). 그 외는 와이어프레임. 앱/서버 미연결' : '전체 화면의 HTML/CSS 와이어프레임 · 앱/서버 미연결'}</p>
      <p class="preview-mode-title">${sunshine ? '디자인 미리보기' : '와이어프레임'}</p>
      <label
        >레이아웃 점검 폭
        <select id="width">
          <option value="390">390px · 기본</option>
          <option value="320">320px · 좁은 화면 점검</option>
        </select></label
      ><label
        >글씨
        <select id="font">
          <option value="normal">기본</option>
          <option value="large">큰 글씨</option>
        </select></label
      ><label
        >화면 상태
        <select id="state" aria-describedby="state-help">
          <option value="ready">기본</option>
          <option value="loading">로딩</option>
          <option value="empty">빈 결과</option>
          <option value="error">오류</option>
          <option value="field-error">필드 오류 · 폼</option>
          <option value="submitting">제출 중 · 폼</option>
          <option value="chat-error">연결·전송 실패 · 채팅</option>
          <option value="chat-long">긴 내용 입력 · 채팅</option>
        </select></label
      >
      <p id="state-help" role="status"></p>
      <label
        >찾기 상태
        <select id="discovery">
          <option value="searching">찾는 중</option>
          <option value="paused">쉬는 중</option>
        </select></label
      ><label
        >화면 선택
        <select id="screen-picker"></select
      ></label>
      <nav id="screen-list" aria-label="설계 화면"></nav>
    </aside>
    <main>
      <p class="eyebrow" id="screen-caption"></p><p class="api-scope" id="api-scope"></p>
      <article id="phone" class="phone" aria-label="iPhone 화면 미리보기">
        <div class="statusbar" aria-hidden="true">
          9:41 <span>LTE · 100%</span>
        </div>
        <header id="header"></header>
        <div id="content" class="content"></div>
        <footer id="footer"></footer>
        <dialog id="feedback-dialog" aria-label="안내"></dialog>
        <dialog id="action-dialog" aria-label="확인 창">
          <div id="action-content"></div>
        </dialog>
        <dialog id="filter-dialog" aria-labelledby="filter-title">
          <div class="dialog-heading">
            <h2 id="filter-title">선호 조건</h2>
            <button
              type="button"
              class="icon-button"
              data-action="closeFilters"
              aria-label="선호 조건 닫기"
            >
              ${PetmateUI.icon('x')}
            </button>
          </div>
          <div id="filter-content"></div>
        </dialog>
      </article>
      <p class="footnote">
        설계용 웹 미리보기 · 실제 iPhone 키보드·VoiceOver 검증은 별도
      </p>
    </main>
`;
