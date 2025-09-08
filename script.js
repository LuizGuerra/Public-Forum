// Utterances repo constant for the customized generated script
const UTTERANCES_REPO = "LuizGuerra/Public-Forum";

// Optionally set a default label applied to created/found issues
const UTTERANCES_LABEL_BASE = "paragraph"; // results in labels like "paragraph" or "paragraph-3"

// Choose an utterances theme; can be switched based on prefers-color-scheme
function currentUtterancesTheme() {
  const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return dark ? 'github-dark' : 'github-light';
}

// Inject or move an utterances widget into the target container with a unique issue-term per paragraph.
function loadCommentsForParagraph(paragraphNumber, slotEl) {
  if (!UTTERANCES_REPO || UTTERANCES_REPO === "owner/repo") {
    console.warn("Utterances repo not configured. Set UTTERANCES_REPO in script.js");
  }

  // Clear any prior widget inside this slot
  while (slotEl.firstChild) slotEl.removeChild(slotEl.firstChild);

  // Build a unique term that clearly includes the paragraph number
  // This becomes the search term for the GitHub issue; Utterances will create/find an issue
  // whose title contains this term.
  const issueTerm = `Paragraph #${paragraphNumber} – Research Manifesto`;

  // Create a close button to hide the comments if desired
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-comments-btn';
  closeBtn.type = 'button';
  closeBtn.textContent = 'Hide comments';
  closeBtn.addEventListener('click', () => {
    while (slotEl.firstChild) slotEl.removeChild(slotEl.firstChild);
  });
  slotEl.appendChild(closeBtn);

  // Create the utterances script tag with the proper configuration
  const s = document.createElement('script');
  s.src = 'https://utteranc.es/client.js';
  s.setAttribute('repo', UTTERANCES_REPO);
  s.setAttribute('issue-term', issueTerm);
  // Add a label indicating the paragraph number explicitly
  s.setAttribute('label', `${UTTERANCES_LABEL_BASE}-${paragraphNumber}`);
  s.setAttribute('theme', currentUtterancesTheme());
  s.crossOrigin = 'anonymous';
  s.async = true;
  slotEl.appendChild(s);
}

    // <script src="https://utteranc.es/client.js"
    //     repo="LuizGuerra/Public-Forum"
    //     issue-term="pathname"
    //     theme="github-light"
    //     crossorigin="anonymous"
    //     async>
    // </script>
  
function setupDiscussButtons() {
  document.querySelectorAll('.paragraph').forEach(section => {
    const n = section.getAttribute('data-paragraph');
    const btn = section.querySelector('.discuss-btn');
    const slot = section.querySelector('.comments-slot');
    if (!btn || !slot) return;

    btn.addEventListener('click', () => {
      loadCommentsForParagraph(n, slot);
      // Scroll the comments into view for better UX
      slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// Update theme on the fly if system theme changes
function watchThemeChanges() {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  if (!mql || !mql.addEventListener) return;
  mql.addEventListener('change', () => {
    // For simplicity, re-render any visible widgets to pick up new theme
    document.querySelectorAll('.comments-slot').forEach(slot => {
      const iframe = slot.querySelector('iframe.utterances-frame');
      if (iframe) {
        // Try to infer the paragraph number from the containing section
        const section = slot.closest('.paragraph');
        if (section) {
          const n = section.getAttribute('data-paragraph');
          loadCommentsForParagraph(n, slot);
        }
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupDiscussButtons();
  watchThemeChanges();
});

