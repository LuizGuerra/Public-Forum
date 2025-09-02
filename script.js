(() => {
  const paragraphs = Array.from(document.querySelectorAll('.paragraph'));
  const commentsTitle = document.getElementById('comments-title');
  const commentsList = document.getElementById('comments-list');
  const commentForm = document.getElementById('comment-form');
  const commentInput = document.getElementById('comment-input');
  const submitButton = document.getElementById('submit-comment');

  let selectedIndex = null;
  const badgeMap = new Map();

  const STORAGE_KEY = 'commentsByParagraph:v1';
  const loadState = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (_) {
      return {};
    }
  };
  const saveState = (state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      // ignore persistence errors
    }
  };

  const state = loadState(); // { [index: string]: Array<{ text: string, ts: number }> }

  function formatDate(ts) {
    try {
      const d = new Date(ts);
      return d.toLocaleString();
    } catch (_) {
      return '' + ts;
    }
  }

  function keyFor(index) {
    return String(index);
  }

  function updateCountBadges() {
    paragraphs.forEach((p, i) => {
      const badge = badgeMap.get(i);
      if (!badge) return;
      const count = (state[keyFor(i)] || []).length;
      if (count > 0) {
        badge.textContent = String(count);
        badge.hidden = false;
      } else {
        badge.textContent = '';
        badge.hidden = true;
      }
    });
  }

  function setSelected(index) {
    selectedIndex = index;
    paragraphs.forEach((p, i) => {
      p.classList.toggle('selected', i === index);
    });
    commentsTitle.textContent = `Comments for Paragraph ${index + 1}`;
    commentInput.disabled = false;
    submitButton.disabled = false;
    renderComments();
    updateCountBadges();
    commentInput.focus({ preventScroll: true });
  }

  function renderComments() {
    const comments = state[keyFor(selectedIndex)] || [];
    commentsList.innerHTML = '';

    if (!comments.length) {
      const empty = document.createElement('div');
      empty.className = 'comment-item';
      empty.textContent = 'No comments yet. Be the first!';
      commentsList.appendChild(empty);
      return;
    }

    comments.forEach((c) => {
      const item = document.createElement('div');
      item.className = 'comment-item';

      const meta = document.createElement('div');
      meta.className = 'comment-meta';
      meta.textContent = `Posted ${formatDate(c.ts)}`;

      const text = document.createElement('div');
      text.className = 'comment-text';
      text.textContent = c.text;

      item.appendChild(meta);
      item.appendChild(text);
      commentsList.appendChild(item);
    });
  }

  paragraphs.forEach((p, i) => {
    // Add count badge elements
    const badge = document.createElement('span');
    badge.className = 'comment-count-badge';
    badge.setAttribute('aria-label', 'Comment count');
    badge.hidden = true;
    p.appendChild(badge);
    badgeMap.set(i, badge);

    p.addEventListener('click', () => setSelected(i));
  });

  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (selectedIndex == null) return;
    const text = commentInput.value.trim();
    if (!text) return;

    const k = keyFor(selectedIndex);
    if (!state[k]) state[k] = [];
    state[k].push({ text, ts: Date.now() });
    saveState(state);
    commentInput.value = '';
    renderComments();
    updateCountBadges();
  });

  // Optional: auto-select the first paragraph for faster demo
  updateCountBadges();
  if (paragraphs.length) setSelected(0);
})();
