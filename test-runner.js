// ── Answer Keys ──────────────────────────────────────────
const testAnswers = {
  'test-1': {1:'B',2:'B',3:'C',4:'B',5:'C',6:'B',7:'C',8:'B',9:'B',10:'B',11:'A',12:'A',13:'B',14:'B',15:'B',16:'B',17:'B',18:'B',19:'C',20:'C',21:'A',22:'B',23:'C',24:'B',25:'B',26:'B',27:'B',28:'B',29:'B',30:'B'},
  'test-2': {1:'A',2:'B',3:'B',4:'C',5:'D',6:'B',7:'B',8:'B',9:'A',10:'A',11:'B',12:'B',13:'B',14:'D',15:'B',16:'C',17:'B',18:'B',19:'B',20:'B',21:'B',22:'B',23:'C',24:'B',25:'C',26:'C',27:'C',28:'B',29:'B',30:'C'}
};

// ── State ─────────────────────────────────────────────────
let currentTestId   = null;
let currentTestName = null;
let timerInterval   = null;
let elapsedSeconds  = 0;   // counts UP from 0
let testSubmitted   = false;

// ── Shuffle Helpers ───────────────────────────────────────
// Fisher-Yates in-place shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffles:
 *  1. The ORDER of questions inside the test card
 *  2. The ORDER of answer options within every question
 * Renumbers Q1…Q30 labels to match new order.
 * Correct-answer lookup uses data-opt attributes so validation
 * is completely unaffected by the visual shuffle.
 */
function shuffleTest(testId) {
  const card = document.querySelector(`#${testId} .test-card`);
  if (!card) return;

  const resultDiv = card.querySelector('.test-result');
  const submitBtn = card.querySelector('.submit-test-btn');

  // Shuffle question elements
  const items = shuffle(Array.from(card.querySelectorAll('.q-item')));

  // Clear and rebuild card
  card.innerHTML = '';
  if (resultDiv) card.appendChild(resultDiv);

  items.forEach((item, idx) => {
    // Re-label question numbers Q1, Q2 … in new order
    const strong = item.querySelector('.q-text strong');
    if (strong) strong.textContent = `Q${idx + 1}.`;

    // Shuffle options within this question
    const opts = item.querySelector('.q-opts');
    if (opts) {
      const lis = shuffle(Array.from(opts.querySelectorAll('li')));
      opts.innerHTML = '';
      lis.forEach(li => opts.appendChild(li));
    }

    card.appendChild(item);
  });

  if (submitBtn) card.appendChild(submitBtn);
}

// ── Navigation Lock ───────────────────────────────────────
function lockNavigation() {
  // Push a dummy state so the back button hits it first
  history.pushState(null, '', location.href);

  window.addEventListener('popstate', function onPop() {
    if (!testSubmitted) {
      // Push again to prevent going back
      history.pushState(null, '', location.href);
      showExitWarning();
    } else {
      // Exam done — allow leaving (remove listener)
      window.removeEventListener('popstate', onPop);
    }
  });

  // Warn on tab close / refresh during exam
  window.addEventListener('beforeunload', function (e) {
    if (!testSubmitted) {
      e.preventDefault();
      e.returnValue = 'Your exam is still in progress. Are you sure you want to leave?';
      return e.returnValue;
    }
  });
}

function showExitWarning() {
  // Show a brief in-page warning toast
  let toast = document.getElementById('exit-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'exit-toast';
    toast.className = 'exit-toast';
    toast.innerHTML = '⚠️ You cannot go back during the exam. Submit first!';
    document.body.appendChild(toast);
  }
  toast.classList.add('show');
  clearTimeout(toast._hide);
  toast._hide = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── Init ──────────────────────────────────────────────────
function initTest(testId, testName) {
  currentTestId   = testId;
  currentTestName = testName;

  // If already submitted, show results and skip
  const saved = JSON.parse(localStorage.getItem('eq-mock-progress') || '{}');
  if (saved[testId]) {
    const d = saved[testId];
    const m = Math.floor(d.timeTaken / 60);
    const s = d.timeTaken % 60;
    const res = document.getElementById('res-' + testId);
    if (res) {
      res.classList.remove('hidden');
      res.innerHTML = buildAlreadySubmittedHTML(d.score, d.total, m, s, d.date);
    }
    document.getElementById('submit-test-' + testId.split('-')[1]).style.display = 'none';
    testSubmitted = true;
    document.getElementById('time-display').textContent = formatTime(d.timeTaken);
    return;
  }

  // Shuffle questions and options before the exam starts
  shuffleTest(testId);

  // Bind option clicks (after shuffle so listeners attach to new positions)
  document.querySelectorAll('.q-opts li').forEach(opt => {
    opt.addEventListener('click', function () {
      if (testSubmitted) return;
      const ul = this.closest('ul');
      ul.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  // Lock back navigation while exam is in progress
  lockNavigation();

  // Start count-UP timer
  startTimer();
}

// ── Timer (counts UP from 0) ──────────────────────────────
function startTimer() {
  const display   = document.getElementById('time-display');
  display.textContent = '00:00:00';

  timerInterval = setInterval(() => {
    elapsedSeconds++;
    display.textContent = formatTime(elapsedSeconds);
  }, 1000);
}

function formatTime(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

// ── AI helpers ────────────────────────────────────────────
function askChatGPT(questionText, correctAnswer) {
  const prompt = `Please explain the solution to this AP EAPCET Physics question in detail.\n\nQuestion: ${questionText}\nCorrect Answer: ${correctAnswer}\n\nWhy is this the correct answer? Explain step by step with the relevant physics concepts.`;
  window.open('https://chatgpt.com/?q=' + encodeURIComponent(prompt), '_blank');
}

function askClaude(questionText, correctAnswer) {
  const prompt = `Please explain the solution to this AP EAPCET Physics question in detail.\n\nQuestion: ${questionText}\nCorrect Answer: ${correctAnswer}\n\nWhy is this the correct answer? Explain step by step with the relevant physics concepts.`;
  window.open('https://claude.ai/new?q=' + encodeURIComponent(prompt), '_blank');
}

// ── Submit ────────────────────────────────────────────────
function submitTest(testId) {
  if (testSubmitted) return;
  testSubmitted = true;
  clearInterval(timerInterval);

  let score    = 0;
  const answers   = testAnswers[testId];
  const container = document.getElementById(testId);

  container.querySelectorAll('.q-item').forEach(item => {
    const qid        = item.getAttribute('data-qid');
    const selected   = item.querySelector('li.selected');
    const correctOpt = answers[qid];
    const correctLi  = item.querySelector(`li[data-opt="${correctOpt}"]`);

    const questionText     = item.querySelector('.q-text').innerText.replace(/^Q\d+\.\s*/, '').trim();
    const correctAnswerTxt = correctLi ? correctLi.innerText.trim() : correctOpt;

    if (correctLi) correctLi.classList.add('correct');

    let isCorrect = false;
    if (selected) {
      if (selected.getAttribute('data-opt') === correctOpt) {
        score++;
        isCorrect = true;
      } else {
        selected.classList.add('wrong');
      }
    }

    // AI explanation buttons for wrong / unanswered
    if (!isCorrect) {
      const btnWrap   = document.createElement('div');

      const gptBtn    = document.createElement('button');
      gptBtn.className = 'ai-btn';
      gptBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> Ask ChatGPT`;
      gptBtn.onclick  = () => askChatGPT(questionText, correctAnswerTxt);

      const claudeBtn = document.createElement('button');
      claudeBtn.className = 'ai-btn ai-btn-claude';
      claudeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> Ask Claude`;
      claudeBtn.onclick   = () => askClaude(questionText, correctAnswerTxt);

      btnWrap.appendChild(gptBtn);
      btnWrap.appendChild(claudeBtn);
      item.appendChild(btnWrap);
    }
  });

  document.getElementById('submit-test-' + testId.split('-')[1]).style.display = 'none';

  const timeTaken = elapsedSeconds;
  const m = Math.floor(timeTaken / 60);
  const s = timeTaken % 60;
  const timeStr = `${m}m ${s}s`;

  // Save to localStorage
  const progressData = JSON.parse(localStorage.getItem('eq-mock-progress') || '{}');
  progressData[testId] = {
    name:      currentTestName,
    score:     score,
    total:     30,
    timeTaken: timeTaken,
    date:      new Date().toISOString()
  };
  localStorage.setItem('eq-mock-progress', JSON.stringify(progressData));

  // Build result block
  const scoreClass = score >= 20 ? 'score-good' : score >= 10 ? 'score-mid' : 'score-bad';
  const verdict    = score >= 25
    ? '🎉 Excellent preparation!'
    : score >= 15 ? '👍 Good effort — keep revising.'
    : '📚 Needs more practice. Review your concepts.';

  const shareText = `I just completed *${currentTestName}* on the EAPCET Study App!%0A%0A✅ Score: ${score}/30%0A⏱ Time: ${timeStr}%0A%0APracticing for AP EAPCET 2026 🚀`;
  const waLink    = `https://wa.me/916300363135?text=${shareText}`;
  const emailLink = `mailto:haswanth.challa1@gmail.com?subject=${encodeURIComponent(currentTestName + ' — Results')}&body=${decodeURIComponent(shareText).replace(/%0A/g, '\n')}`;

  const res = document.getElementById('res-' + testId);
  res.classList.remove('hidden');
  res.innerHTML = `
    <h3 style="font-size:1.6rem; margin-bottom:6px;">
      Score: <span class="${scoreClass}">${score} / 30</span>
    </h3>
    <p style="color:var(--ink2); margin-bottom:4px;">${verdict}</p>
    <p style="font-size:13px; color:var(--ink3); margin-bottom:16px;">Time taken: ${timeStr}</p>
    <div class="share-bar">
      <span class="share-bar-label">Share results:</span>
      <a href="${waLink}" target="_blank" class="share-btn wa">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.553 4.103 1.523 5.83L0 24l6.337-1.501A11.947 11.947 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.003-1.375l-.358-.213-3.76.89.945-3.654-.234-.376A9.793 9.793 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
        WhatsApp
      </a>
      <a href="${emailLink}" class="share-btn email">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        Email Me
      </a>
    </div>
    <a href="index.html?tab=papers" class="back-to-tests-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
      Back to Mock Tests
    </a>`;

  // Scroll result into view
  res.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── "Already submitted" HTML ──────────────────────────────
function buildAlreadySubmittedHTML(score, total, m, s, dateISO) {
  const scoreClass = score >= 20 ? 'score-good' : score >= 10 ? 'score-mid' : 'score-bad';
  return `
    <h3 style="font-size:1.4rem; margin-bottom:6px;">
      Already submitted — Score: <span class="${scoreClass}">${score}/${total}</span>
    </h3>
    <p style="color:var(--ink2); margin-bottom:4px;">
      Time taken: ${m}m ${s}s &nbsp;•&nbsp; Completed on ${new Date(dateISO).toLocaleDateString('en-IN')}
    </p>
    <a href="index.html?tab=papers" class="back-to-tests-btn" style="margin-top:16px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
      Back to Mock Tests
    </a>`;
}
