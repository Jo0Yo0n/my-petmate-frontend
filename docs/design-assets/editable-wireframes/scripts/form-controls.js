/* 공통 폼의 화면 내 동기화만 담당한다. API·저장·정책 판단은 하지 않는다. */
window.PetmateFormControls = (() => {
  // 고정 폭의 이름은 실제 너비를 측정해 축소한다. 본문·설명에는 적용하지 않는다.
  const resizeComposer = (input) => {
    input.style.height = 'auto';
    const style = getComputedStyle(input);
    const border =
      parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const height = Math.min(
      input.scrollHeight + border,
      parseFloat(style.maxHeight),
    );
    input.style.height = height + 'px';
    input.style.overflowY =
      input.scrollHeight + border > height ? 'auto' : 'hidden';
  };
  const fitNames = () => {
    document
      .querySelectorAll('.sun-composer textarea[name="message"]')
      .forEach(resizeComposer);
    document
      .querySelectorAll(
        '.row strong,.identity-line h2,.identity-line h3,.sun-guardian strong,.chat-person strong,.appointment-dogs > span:not(.appointment-direction),.sun-dog-picker select,.ui-action-pair .ui-button-label,.phone header h1,.phone .ui-page-heading h2,.phone .result-notice h2,.phone .profile-section h3,.phone .content > h2,.phone .ui-state h2,.phone .ui-confirm h2,.phone .sheet-heading h2,.phone .ui-button-label,.phone .choice-label',
      )
      .forEach((element) => {
        if (element.matches('.match-sheet .sheet-heading h2')) return;
        element.style.fontSize = '';
        let size = parseFloat(getComputedStyle(element).fontSize);
        const minimum = Math.max(12, size - 2);
        const heading = element.matches('h1,h2,h3');
        if (element.tagName === 'SELECT' || heading) {
          const canvas = document.createElement('canvas').getContext('2d');
          const style = getComputedStyle(element);
          const available =
            element.clientWidth -
            parseFloat(style.paddingLeft) -
            parseFloat(style.paddingRight);
          while (size > minimum) {
            canvas.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
            if (
              canvas.measureText(
                heading
                  ? element.textContent
                  : element.selectedOptions[0]?.textContent || '',
              ).width <= available
            )
              break;
            size--;
          }
        } else {
          while (element.scrollWidth > element.clientWidth && size > minimum) {
            size--;
            element.style.fontSize = size + 'px';
          }
        }
        element.style.fontSize = size + 'px';
      });
  };
  new ResizeObserver(() => requestAnimationFrame(fitNames)).observe(
    document.body,
  );
  new MutationObserver(() => requestAnimationFrame(fitNames)).observe(
    document.body,
    { attributes: true, attributeFilter: ['class', 'style'] },
  );
  document.fonts.ready.then(fitNames);
  const refreshTime = (group, changed) => {
    const startInput = group.querySelector('[name="startTime"]');
    const endInput = group.querySelector('[name="endTime"]');
    if (!startInput.value || !endInput.value) {
      group.querySelector('[data-time-display="start"]').textContent =
        startInput.value || '--:--';
      group.querySelector('[data-time-display="end"]').textContent =
        endInput.value || '--:--';
      return;
    }
    let start = PetmateTime.minutes(startInput.value),
      end = PetmateTime.minutes(endInput.value);
    [start, end] = PetmateTime.ordered(start, end, changed);
    startInput.value = PetmateTime.format(start);
    endInput.value = PetmateTime.format(end);
    const startRange = group.querySelector('[data-range="start"]');
    const endRange = group.querySelector('[data-range="end"]');
    group.querySelector('[data-time-display="start"]').textContent =
      startInput.value;
    group.querySelector('[data-time-display="end"]').textContent =
      endInput.value;
    startRange.value = start;
    endRange.value = end;
    startRange.setAttribute('aria-valuetext', startInput.value);
    endRange.setAttribute('aria-valuetext', endInput.value);
    group.style.setProperty(
      '--range-start',
      (start / PetmateTime.max) * 100 + '%',
    );
    group.style.setProperty('--range-end', (end / PetmateTime.max) * 100 + '%');
  };
  const photoDrafts = new Map();
  const renderPhotoDraft = (editor) => {
    const draft = photoDrafts.get(editor.dataset.photoEditor);
    if (draft?.url)
      editor.querySelector('[data-photo-preview]').innerHTML = PetmateUI.avatar(
        draft.url,
      );
    if (draft?.file) {
      const feedback = editor.querySelector('.photo-editor-feedback');
      if (draft.error) feedback.innerHTML = PetmateUI.inlineError(draft.error);
      else feedback.textContent = draft.ready ? '' : '사진을 불러오고 있어요.';
    }
  };
  const syncOtherBreed = (root) =>
    root.querySelectorAll('[data-other-breed]').forEach((group) => {
      const selected =
        group.closest('form')?.querySelector('[name="breed"]')?.value ===
        'other';
      group.hidden = !selected;
      group.querySelector('input').disabled = !selected;
    });
  document.addEventListener('click', (event) => {
    const editor = event.target.closest('[data-photo-editor]');
    if (!editor) return;
    const menu = editor.querySelector('[data-photo-dialog]');
    const toggle = editor.querySelector('[data-photo-toggle]');
    if (event.target.closest('[data-photo-toggle]')) {
      if (menu.open) menu.close();
      else {
        const rect = editor.closest('.phone').getBoundingClientRect();
        menu.style.width = Math.min(360, rect.width - 24) + 'px';
        menu.style.left = rect.left + rect.width / 2 + 'px';
        menu.style.bottom =
          Math.max(12, innerHeight - Math.min(rect.bottom, innerHeight) + 12) +
          'px';
        menu.showModal();
      }
      toggle.setAttribute('aria-expanded', String(menu.open));
    }
    if (event.target === menu) {
      const rect = menu.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        menu.close();
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
    if (event.target.closest('[data-photo-close]')) {
      menu.close();
      toggle.setAttribute('aria-expanded', 'false');
    }
    const source = event.target.closest('[data-photo-source]');
    if (source) {
      const input = editor.querySelector('[data-photo-file]');
      if (source.dataset.photoSource === 'camera')
        input.setAttribute('capture', 'user');
      else input.removeAttribute('capture');
      menu.close();
      toggle.setAttribute('aria-expanded', 'false');
      input.value = '';
      input.click();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const editor = event.target.closest('[data-photo-editor]');
    const menu = editor?.querySelector('[data-photo-dialog]');
    if (!menu?.open) return;
    event.preventDefault();
    event.stopPropagation();
    menu.close();
    const toggle = editor.querySelector('[data-photo-toggle]');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  });
  document.addEventListener(
    'close',
    (event) => {
      if (event.target.matches('[data-photo-dialog]'))
        event.target
          .closest('[data-photo-editor]')
          .querySelector('[data-photo-toggle]')
          .setAttribute('aria-expanded', 'false');
    },
    true,
  );
  document.addEventListener('change', (event) => {
    if (event.target.name === 'breed')
      syncOtherBreed(event.target.closest('form'));
    if (!event.target.matches('[data-photo-file]')) return;
    const file = event.target.files?.[0];
    if (!file) return;
    const editor = event.target.closest('[data-photo-editor]');
    const key = editor.dataset.photoEditor;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      editor.querySelector('.photo-editor-feedback').innerHTML =
        PetmateUI.inlineError('JPEG·PNG·WebP 사진을 선택해 주세요.');
      event.target.value = '';
      return;
    }
    const draft = { file, url: photoDrafts.get(key)?.url || '', ready: false };
    photoDrafts.set(key, draft);
    renderPhotoDraft(editor);
    const reader = new FileReader();
    reader.onload = () => {
      if (photoDrafts.get(key) !== draft) return;
      draft.url = reader.result;
      draft.ready = true;
      document.querySelectorAll('[data-photo-editor]').forEach((current) => {
        if (current.dataset.photoEditor === key) renderPhotoDraft(current);
      });
    };
    reader.onerror = () => {
      if (photoDrafts.get(key) === draft) {
        draft.error = '사진을 불러오지 못했어요. 다시 선택해 주세요.';
        renderPhotoDraft(editor);
      }
    };
    reader.readAsDataURL(file);
  });
  const refresh = (root = document) => {
    requestAnimationFrame(fitNames);
    syncOtherBreed(root);
    root.querySelectorAll('[data-photo-editor]').forEach(renderPhotoDraft);
    root
      .querySelectorAll('[data-time-range]')
      .forEach((group) => refreshTime(group));
    const regions = [
      ...(root.matches?.('[data-region-picker]') ? [root] : []),
      ...root.querySelectorAll('[data-region-picker]'),
    ];
    regions.forEach((group) => {
      group.querySelector('[data-region-count]').textContent =
        group.querySelectorAll('.region-chip').length + '/3';
    });
  };
  document.addEventListener('input', (event) => {
    if (event.target.matches('.sun-composer textarea[name="message"]'))
      resizeComposer(event.target);
    const group = event.target.closest('[data-time-range]');
    if (!group || event.target.disabled || group.disabled) return;
    const changed =
      event.target.dataset.range ||
      (event.target.name === 'startTime' ? 'start' : 'end');
    if (event.target.dataset.range)
      group.querySelector(`[name="${changed}Time"]`).value = PetmateTime.format(
        Number(event.target.value),
      );
    refreshTime(group, changed);
  });
  document.addEventListener('change', (event) => {
    const group = event.target.closest('.tail-rating');
    if (!group) return;
    const value = Number(event.target.value);
    group
      .querySelectorAll('.rating-options label')
      .forEach((label) =>
        label.classList.toggle(
          'filled',
          Number(label.querySelector('input').value) <= value,
        ),
      );
    group.querySelector('output').textContent = value + ' / 5';
  });
  document.addEventListener('click', (event) => {
    // 목차의 지역 선택 예시만 로컬에서 조작한다. 앱은 기존 regionDraft를 사용한다.
    const action = event.target.closest('#catalog [data-action]');
    const group = action?.closest('[data-region-picker]');
    if (!group || group.disabled) return;
    const chips = group.querySelector('.region-chips');
    const error = group.querySelector('.region-error');
    if (action.dataset.action.startsWith('removeRegion:')) {
      action.remove();
      error.textContent = '';
    } else if (action.dataset.action === 'addRegion') {
      const input = group.querySelector('[name="locality"]');
      if (!input.value) {
        error.textContent = '읍·면·동을 선택해 주세요.';
        return;
      }
      if (
        [...chips.children].some(
          (chip) => chip.dataset.regionId === input.value,
        )
      ) {
        error.textContent = '이미 선택한 지역이에요.';
        return;
      }
      if (chips.children.length >= 3) {
        error.textContent = '지역은 최대 3개까지 선택할 수 있어요.';
        return;
      }
      chips.insertAdjacentHTML(
        'beforeend',
        PetmatePatterns.selectedItems([
          [input.value, input.selectedOptions[0].textContent],
        ]),
      );
      error.textContent = '';
      group.querySelector('details').open = false;
    }
    refresh(group.parentElement);
  });
  return { refresh, getPhotoDraft: (key) => photoDrafts.get(key) };
})();

document.addEventListener('input', (event) => {
  if (event.target.matches('textarea[name="comment"]')) {
    const counter = event.target
      .closest('form')
      .querySelector('.review-comment-count');
    if (counter) counter.textContent = event.target.value.length + ' / 500';
  }
});
