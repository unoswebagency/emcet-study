// ── Answer Keys ──────────────────────────────────────────
const testAnswers = {
  'test-1': {1:'B',2:'B',3:'C',4:'B',5:'C',6:'B',7:'C',8:'B',9:'B',10:'B',11:'A',12:'A',13:'B',14:'B',15:'B',16:'B',17:'B',18:'B',19:'C',20:'C',21:'A',22:'B',23:'C',24:'B',25:'B',26:'B',27:'B',28:'B',29:'B',30:'B'},
  'test-2': {1:'A',2:'B',3:'B',4:'C',5:'D',6:'B',7:'B',8:'B',9:'A',10:'A',11:'B',12:'B',13:'B',14:'D',15:'B',16:'C',17:'B',18:'B',19:'B',20:'B',21:'B',22:'B',23:'C',24:'B',25:'C',26:'C',27:'C',28:'B',29:'B',30:'C'},
  'test-3': {1:'B',2:'B',3:'C',4:'C',5:'C',6:'B',7:'B',8:'A',9:'A',10:'B',11:'D',12:'A',13:'B',14:'C',15:'A',16:'B',17:'B',18:'B',19:'A',20:'D',21:'C',22:'C',23:'B',24:'A',25:'B',26:'A',27:'B',28:'B',29:'B',30:'A'},
  'test-4': {1:'C',2:'B',3:'B',4:'C',5:'B',6:'D',7:'B',8:'B',9:'B',10:'B',11:'D',12:'B',13:'A',14:'D',15:'B',16:'D',17:'C',18:'B',19:'A',20:'B',21:'A',22:'B',23:'B',24:'C',25:'B',26:'B',27:'B',28:'C',29:'A',30:'B'}
};

// ── State ─────────────────────────────────────────────────
let currentTestId   = null;
let currentTestName = null;
let timerInterval   = null;
let elapsedSeconds  = 0;
let testSubmitted   = false;

// ── Shuffle Helpers ───────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleTest(testId) {
  const card = document.querySelector(`#${testId} .test-card`);
  if (!card) return;

  const resultDiv = card.querySelector('.test-result');
  const submitBtn = card.querySelector('.submit-test-btn');
  const items = shuffle(Array.from(card.querySelectorAll('.q-item')));

  card.innerHTML = '';
  if (resultDiv) card.appendChild(resultDiv);

  items.forEach((item, idx) => {
    const strong = item.querySelector('.q-text strong');
    if (strong) strong.textContent = `Q${idx + 1}.`;

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
  history.pushState(null, '', location.href);

  window.addEventListener('popstate', function onPop() {
    if (!testSubmitted) {
      history.pushState(null, '', location.href);
      showExitWarning();
    } else {
      window.removeEventListener('popstate', onPop);
    }
  });

  window.addEventListener('beforeunload', function (e) {
    if (!testSubmitted) {
      e.preventDefault();
      e.returnValue = 'Your exam is still in progress. Are you sure you want to leave?';
      return e.returnValue;
    }
  });
}

function showExitWarning() {
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

  const saved = JSON.parse(localStorage.getItem('eq-mock-progress') || '{}');
  if (saved[testId]) {
    const d = saved[testId];
    const m = Math.floor(d.timeTaken / 60);
    const s = d.timeTaken % 60;
    const res = document.getElementById('res-' + testId);
    if (res) {
      res.classList.remove('hidden');
      res.innerHTML = buildAlreadySubmittedHTML(d.score, d.total, m, s, d.date, d.answerSheet || null);
    }
    document.getElementById('submit-test-' + testId.split('-')[1]).style.display = 'none';
    testSubmitted = true;
    document.getElementById('time-display').textContent = formatTime(d.timeTaken);
    return;
  }

  shuffleTest(testId);

  document.querySelectorAll('.q-opts li').forEach(opt => {
    opt.addEventListener('click', function () {
      if (testSubmitted) return;
      const ul = this.closest('ul');
      ul.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  lockNavigation();
  startTimer();
}

// ── Timer (counts UP) ─────────────────────────────────────
function startTimer() {
  const display = document.getElementById('time-display');
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
  const prompt = `Please explain the solution to this AP EAPCET question in detail.\n\nQuestion: ${questionText}\nCorrect Answer: ${correctAnswer}\n\nWhy is this the correct answer? Explain step by step with the relevant concepts.`;
  window.open('https://chatgpt.com/?q=' + encodeURIComponent(prompt), '_blank');
}

function askClaude(questionText, correctAnswer) {
  const prompt = `Please explain the solution to this AP EAPCET question in detail.\n\nQuestion: ${questionText}\nCorrect Answer: ${correctAnswer}\n\nWhy is this the correct answer? Explain step by step with the relevant concepts.`;
  window.open('https://claude.ai/new?q=' + encodeURIComponent(prompt), '_blank');
}

// ── Submit ────────────────────────────────────────────────
function submitTest(testId) {
  if (testSubmitted) return;
  testSubmitted = true;
  clearInterval(timerInterval);

  let score         = 0;
  const answers     = testAnswers[testId];
  const container   = document.getElementById(testId);
  const answerSheet = [];

  let qDisplayNum = 0;
  container.querySelectorAll('.q-item').forEach(item => {
    qDisplayNum++;
    const qid          = item.getAttribute('data-qid');
    const selected     = item.querySelector('li.selected');
    const correctOpt   = answers[qid];
    const correctLi    = item.querySelector(`li[data-opt="${correctOpt}"]`);

    const questionText     = item.querySelector('.q-text').innerText.replace(/^Q\d+\.\s*/, '').trim();
    const correctAnswerTxt = correctLi ? correctLi.innerText.trim() : correctOpt;
    const userOpt          = selected ? selected.getAttribute('data-opt') : null;
    const userAnswerTxt    = selected ? selected.innerText.trim() : 'Not answered';
    const isCorrect        = userOpt === correctOpt;

    if (correctLi) correctLi.classList.add('correct');
    if (selected && !isCorrect) selected.classList.add('wrong');
    if (isCorrect) score++;

    // Store per-question result
    answerSheet.push({
      num:           qDisplayNum,
      question:      questionText,
      userOpt:       userOpt,
      userAnswer:    userAnswerTxt,
      correctOpt:    correctOpt,
      correctAnswer: correctAnswerTxt,
      isCorrect:     isCorrect
    });
  });

  document.getElementById('submit-test-' + testId.split('-')[1]).style.display = 'none';

  const timeTaken = elapsedSeconds;
  const m = Math.floor(timeTaken / 60);
  const s = timeTaken % 60;
  const timeStr = `${m}m ${s}s`;

  // Save full record including answer sheet
  const progressData = JSON.parse(localStorage.getItem('eq-mock-progress') || '{}');
  progressData[testId] = {
    name:        currentTestName,
    score:       score,
    total:       30,
    timeTaken:   timeTaken,
    date:        new Date().toISOString(),
    answerSheet: answerSheet
  };
  localStorage.setItem('eq-mock-progress', JSON.stringify(progressData));

  const scoreClass = score >= 20 ? 'score-good' : score >= 10 ? 'score-mid' : 'score-bad';
  const verdict    = score >= 25 ? '🎉 Excellent preparation!'
                   : score >= 15 ? '👍 Good effort — keep revising.'
                   : '📚 Needs more practice. Review your concepts.';

  const shareText = `I just completed *${currentTestName}* on the EAPCET Study App!%0A%0A✅ Score: ${score}/30%0A⏱ Time: ${timeStr}%0A%0APracticing for AP EAPCET 2026 🚀`;
  const waLink    = `https://wa.me/916300363135?text=${shareText}`;
  const emailLink = `mailto:haswanth.challa1@gmail.com?subject=${encodeURIComponent(currentTestName + ' — Results')}&body=${decodeURIComponent(shareText).replace(/%0A/g, '\n')}`;

  const res = document.getElementById('res-' + testId);
  res.classList.remove('hidden');
  res.innerHTML = `
    <div class="completion-status">
      <span class="status-badge success-badge"><i data-lucide="check-circle"></i> Exam Completed Successfully</span>
    </div>
    <h3 class="result-score-heading">
      Score: <span class="${scoreClass}">${score} / 30</span>
    </h3>
    <p class="result-verdict">${verdict}</p>
    <p class="result-time">Time taken: ${timeStr}</p>
    <div class="share-bar">
      <span class="share-bar-label">Share results:</span>
      <a href="${waLink}" target="_blank" class="share-btn wa">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.553 4.103 1.523 5.83L0 24l6.337-1.501A11.947 11.947 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.003-1.375l-.358-.213-3.76.89.945-3.654-.234-.376A9.793 9.793 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
        WhatsApp
      </a>
    </div>
    ${buildAnswerReview(answerSheet)}
    <a href="index.html?tab=papers" class="back-to-tests-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
      Back to Mock Tests
    </a>`;

  res.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 🚀 Auto-trigger WhatsApp (Directly via location.href)
  autoSendResults(currentTestName, score, timeStr, answerSheet);
}

// ── Auto Sharing Logic (WhatsApp Only) ──────────────────────
function autoSendResults(name, score, time, sheet) {
  // Format detailed response sheet
  let sheetSummary = '';
  sheet.forEach(row => {
    sheetSummary += `Q${row.num}: ${row.isCorrect ? '✅' : '❌'} (Your: ${row.userOpt || 'Skipped'}, Correct: ${row.correctOpt})\n`;
  });

  const fullReport = `📄 AP EAPCET RESPONSE SHEET\n` +
                     `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                     `Test: ${name}\n` +
                     `Score: ${score}/30\n` +
                     `Time Taken: ${time}\n\n` +
                     `📝 DETAILED ANSWERS:\n${sheetSummary}\n` +
                     `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                     `Sent via EAPCET Study App`;

  const waLink = `https://wa.me/916300363135?text=${encodeURIComponent(fullReport)}`;

  // Inform the user
  const statusMsg = document.createElement('div');
  statusMsg.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#075E54; color:#fff; padding:10px 20px; border-radius:8px; z-index:10000; font-size:14px; box-shadow:0 4px 12px rgba(0,0,0,0.3); font-weight:600;";
  statusMsg.innerHTML = "📤 Sending Response Sheet to WhatsApp...";
  document.body.appendChild(statusMsg);

  // Trigger WhatsApp directly via location.href (Most reliable for auto-redirect)
  setTimeout(() => {
    window.location.href = waLink;
    statusMsg.innerHTML = "✅ WhatsApp Draft Prepared!";
    setTimeout(() => statusMsg.remove(), 3000);
  }, 1200);
}

// ── Answer Review Renderer ────────────────────────────────
function buildAnswerReview(sheet) {
  if (!sheet || !sheet.length) return '';

  const GPT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
  const CLD_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;

  let html = `<div class="answer-review"><h4 class="answer-review-title">📋 Full Answer Sheet</h4>`;

  sheet.forEach(row => {
    const statusClass = row.isCorrect ? 'ar-correct' : (row.userOpt ? 'ar-wrong' : 'ar-skipped');
    const statusIcon  = row.isCorrect ? '✅' : (row.userOpt ? '❌' : '⏭');
    const statusLabel = row.isCorrect ? 'Correct' : (row.userOpt ? 'Wrong' : 'Skipped');

    const aiPrompt  = encodeURIComponent(`Please explain the solution to this AP EAPCET question in detail.\n\nQuestion: ${row.question}\nCorrect Answer: ${row.correctAnswer}\n\nWhy is this the correct answer? Explain step by step with the relevant concepts.`);
    const gptLink   = `https://chatgpt.com/?q=${aiPrompt}`;
    const cldLink   = `https://claude.ai/new?q=${aiPrompt}`;

    html += `
      <div class="ar-row ${statusClass}">
        <div class="ar-top">
          <span class="ar-num">Q${row.num}</span>
          <span class="ar-status-badge ${statusClass}-badge">${statusIcon} ${statusLabel}</span>
        </div>
        <div class="ar-question">${row.question}</div>
        <div class="ar-answers">
          <div class="ar-answer-block">
            <span class="ar-label">Your answer:</span>
            <span class="ar-value ${row.isCorrect ? 'ar-val-correct' : (row.userOpt ? 'ar-val-wrong' : 'ar-val-skip')}">${row.userAnswer}</span>
          </div>
          ${!row.isCorrect ? `<div class="ar-answer-block">
            <span class="ar-label">Correct answer:</span>
            <span class="ar-value ar-val-correct">${row.correctAnswer}</span>
          </div>` : ''}
        </div>
        <div class="ar-ai-btns">
          <a href="${gptLink}" target="_blank" class="ai-btn">${GPT_ICON} Ask ChatGPT</a>
          <a href="${cldLink}" target="_blank" class="ai-btn ai-btn-claude">${CLD_ICON} Ask Claude</a>
        </div>
      </div>`;
  });

  html += '</div>';
  return html;
}

// ── "Already submitted" HTML ──────────────────────────────
function buildAlreadySubmittedHTML(score, total, m, s, dateISO, answerSheet) {
  const scoreClass = score >= 20 ? 'score-good' : score >= 10 ? 'score-mid' : 'score-bad';
  return `
    <div class="completion-status">
      <span class="status-badge success-badge"><i data-lucide="check-circle"></i> Exam Completed</span>
    </div>
    <h3 class="result-score-heading">
      Already submitted — Score: <span class="${scoreClass}">${score}/${total}</span>
    </h3>
    <p class="result-verdict">
      Time taken: ${m}m ${s}s &nbsp;•&nbsp; Completed on ${new Date(dateISO).toLocaleDateString('en-IN')}
    </p>
    ${buildAnswerReview(answerSheet)}
    <a href="index.html?tab=papers" class="back-to-tests-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
      Back to Mock Tests
    </a>`;
}
