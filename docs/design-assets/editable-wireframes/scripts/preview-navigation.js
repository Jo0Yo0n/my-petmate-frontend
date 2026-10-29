/* 설계 자료의 공통 탐색. 제품 내부 화면 이동과 분리한다. */
window.PreviewNavigation = (() => {
  const pages = [
    ['index.html', '와이어프레임'],
    ['sunshine.html', '디자인 미리보기'],
    ['components.html', '컴포넌트 목차'],
    ['sunshine-board.html', '화면별 디자인 목차'],
  ];
  const previewPages = ['index.html', 'sunshine.html'];
  const currentPage = () => location.pathname.split('/').pop() || 'index.html';
  const context = new URLSearchParams(location.search);
  for (const key of [...context.keys()]) {
    if (
      ![
        'screen',
        'state',
        'width',
        'font',
        'discovery',
        'guardian',
        'long',
      ].includes(key)
    )
      context.delete(key);
  }
  const update = (options = {}) => {
    for (const [key, value] of Object.entries(options)) context.set(key, value);
    document.querySelectorAll('[data-preview-page]').forEach((link) => {
      const page = link.dataset.previewPage;
      const query = previewPages.includes(page)
        ? context.toString()
        : '';
      link.href = page + (query ? '?' + query : '');
      if (page === currentPage()) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-preview-page]');
    if (
      !link ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (
      !previewPages.includes(currentPage()) ||
      !previewPages.includes(link.dataset.previewPage)
    )
      return;
    event.preventDefault();
    const design = link.dataset.previewPage === 'sunshine.html';
    document.documentElement.dataset.design = design ? 'sunshine' : 'wireframe';
    history.replaceState(null, '', link.href);
    document.title =
      'My Petmate · ' + (design ? '디자인 미리보기' : '와이어프레임');
    document.querySelector('.preview-mode-title').textContent = design
      ? '디자인 미리보기'
      : '와이어프레임';
    document.querySelector('.studio .brand small').textContent = design
      ? 'SUNSHINE / DESIGN'
      : 'WIREFRAME SOURCE';
    document.querySelector('.studio > p').textContent = design
      ? 'Sunshine 적용: F1 전체·F3 추천 목록/상세·F5 채팅(F6 약속 카드). 그 외는 와이어프레임. 앱/서버 미연결'
      : '전체 화면의 HTML/CSS 와이어프레임 · 앱/서버 미연결';
    update();
  });
  document.addEventListener('DOMContentLoaded', () => {
    const header = document.createElement('header');
    header.className = 'preview-navigation';
    header.innerHTML = `<a class="preview-home" href="sunshine-board.html">my petmate <span>디자인 자료</span></a><nav aria-label="디자인 자료 이동">${pages.map(([page, label]) => `<a data-preview-page="${page}" href="${page}"${page === currentPage() ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
    document.body.prepend(header);
    update();
  });
  return { update };
})();
