// ── Answer Keys ──────────────────────────────────────────
const testAnswers = {
  'test-1': {1:'B',2:'B',3:'C',4:'B',5:'C',6:'B',7:'C',8:'B',9:'B',10:'B',11:'A',12:'A',13:'B',14:'B',15:'B',16:'B',17:'B',18:'B',19:'C',20:'C',21:'A',22:'B',23:'C',24:'B',25:'B',26:'B',27:'B',28:'B',29:'B',30:'B'},
  'test-2': {1:'A',2:'B',3:'B',4:'C',5:'D',6:'B',7:'B',8:'B',9:'A',10:'A',11:'B',12:'B',13:'B',14:'D',15:'B',16:'C',17:'B',18:'B',19:'B',20:'B',21:'B',22:'B',23:'C',24:'B',25:'C',26:'C',27:'C',28:'B',29:'B',30:'C'}
};

// ── State ─────────────────────────────────────────────────
let currentTestId   = null;
let currentTestName = null;
let timerInterval   = null;
let totalSeconds    = 3 * 60 * 60; // 3 hours
let testSubmitted   = false;

// ── Init ──────────────────────────────────────────────────
function initTest(testId, testName) {
  currentTestId   = testId;
  currentTestName = testName;

  // Load saved progress text if already submitted
  const saved = JSON.parse(localStorage.getItem('eq-mock-progress') || '{}');
  if (saved[testId]) {
    const d = saved[testId];
    const m = Math.floor(d.timeTaken / 60);
    const s = d.timeTaken % 60;
    const res = document.getElementById('res-' + testId);
    if (res) {
      res.classList.remove('hidden');
      res.innerHTML = `<h3>Already submitted — Score: ${d.score}/${d.total}</h3>
        <p>Time taken: ${m}m ${s}s &nbsp;•&nbsp; Completed on ${new Date(d.date).toLocaleDateString()}</p>`;
    }
    document.getElementById('submit-test-' + testId.split('-')[1]).style.display = 'none';
    testSubmitted = true;
    document.getElementById('time-display').textContent = '00:00:00';
    return;
  }

  // Bind option clicks
  document.querySelectorAll('.q-opts li').forEach(opt => {
    opt.addEventListener('click', function () {
      if (testSubmitted) return;
      const ul = this.closest('ul');
      ul.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  startTimer();
}

// ── Timer ─────────────────────────────────────────────────
function startTimer() {
  const display   = document.getElementById('time-display');
  const timerWrap = document.getElementById('test-timer');

  function tick() {
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      submitTest(currentTestId);
      return;
    }
    totalSeconds--;
    if (totalSeconds < 300) timerWrap.classList.add('warning');   // last 5 min
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    display.textContent =
      String(h).padStart(2,'0') + ':' +
      String(m).padStart(2,'0') + ':' +
      String(s).padStart(2,'0');
  }

  timerInterval = setInterval(tick, 1000);
}

// ── AI helpers ────────────────────────────────────────────
function askChatGPT(questionText, correctAnswer) {
  const prompt = `Please explain the solution to this AP EAPCET Physics question in detail.\n\nQuestion: ${questionText}\nCorrect Answer: ${correctAnswer}\n\nWhy is this the correct answer? Explain step by step with the relevant physics concepts.`;
  window.open('https://chatgpt.com/?q=' + encodeURIComponent(prompt), '_blank');
}

function askClaude(questionText, correctAnswer) {
  // Claude.ai new-chat with pre-filled prompt via URL hash trick
  const prompt = `Please explain the solution to this AP EAPCET Physics question in detail.\n\nQuestion: ${questionText}\nCorrect Answer: ${correctAnswer}\n\nWhy is this the correct answer? Explain step by step with the relevant physics concepts.`;
  window.open('https://claude.ai/new?q=' + encodeURIComponent(prompt), '_blank');
}

// ── Submit ────────────────────────────────────────────────
function submitTest(testId) {
  if (testSubmitted) return;
  testSubmitted = true;
  clearInterval(timerInterval);

  let score    = 0;
  const answers = testAnswers[testId];
  const container = document.getElementById(testId);

  container.querySelectorAll('.q-item').forEach(item => {
    const qid        = item.getAttribute('data-qid');
    const selected   = item.querySelector('li.selected');
    const correctOpt = answers[qid];
    const correctLi  = item.querySelector(`li[data-opt="${correctOpt}"]`);

    const questionText    = item.querySelector('.q-text').innerText.replace(/^Q\d+\.\s*/, '').trim();
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

    // Add AI buttons for wrong / unanswered questions
    if (!isCorrect) {
      const btnWrap = document.createElement('div');

      const gptBtn = document.createElement('button');
      gptBtn.className = 'ai-btn';
      gptBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> Ask ChatGPT`;
      gptBtn.onclick = () => askChatGPT(questionText, correctAnswerTxt);

      const claudeBtn = document.createElement('button');
      claudeBtn.className = 'ai-btn ai-btn-claude';
      claudeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> Ask Claude`;
      claudeBtn.onclick = () => askClaude(questionText, correctAnswerTxt);

      btnWrap.appendChild(gptBtn);
      btnWrap.appendChild(claudeBtn);
      item.appendChild(btnWrap);
    }
  });

  // Hide submit button
  document.getElementById('submit-test-' + testId.split('-')[1]).style.display = 'none';

  // Time taken
  const timeTaken = (3 * 60 * 60) - totalSeconds;
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

  // Build result & share block
  const scoreClass = score >= 20 ? 'score-good' : score >= 10 ? 'score-mid' : 'score-bad';
  const verdict = score >= 25
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
    <p style="font-size:13px; color:var(--ink3);">Time taken: ${timeStr}</p>
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
    </div>`;
}
