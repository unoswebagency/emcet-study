


// MOBILE MENU
const sidebar = document.querySelector('.sidebar');
const backdrop = document.getElementById('backdrop');
const menuBtn = document.getElementById('menu-btn');
const toggleMenu = () => {
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    sidebar.classList.remove('open');
    backdrop.classList.remove('show');
    setTimeout(() => backdrop.classList.add('hidden'), 300); // Wait for transition
  } else {
    backdrop.classList.remove('hidden');
    // Force reflow
    void backdrop.offsetWidth;
    sidebar.classList.add('open');
    backdrop.classList.add('show');
  }
};
if(menuBtn) menuBtn.addEventListener('click', toggleMenu);
if(backdrop) backdrop.addEventListener('click', toggleMenu);

// COUNTDOWN
const exam=new Date('2026-05-18T08:00:00'),dl=Math.max(0,Math.ceil((exam-new Date())/864e5));
document.getElementById('days-left').textContent=dl||'Today!';
document.getElementById('top-pill').innerHTML=`<i data-lucide="calendar" style="width:14px;height:14px;display:inline-block;margin-right:4px;vertical-align:-2px"></i> May 18 · ${dl} days`;

// QUOTE
const qs=[{q:"Success is the sum of small efforts, repeated day in and day out.",a:"Robert Collier"},{q:"The secret of getting ahead is getting started.",a:"Mark Twain"},{q:"It always seems impossible until it's done.",a:"Nelson Mandela"},{q:"Believe you can and you're halfway there.",a:"Theodore Roosevelt"},{q:"Hard work beats talent when talent doesn't work hard.",a:"Tim Notke"},{q:"Every champion was once a contender that refused to give up.",a:"Unknown"},{q:"Study while others are sleeping.",a:"William Arthur Ward"}];
const qd=qs[new Date().getDay()%qs.length];
document.getElementById('quote-el').innerHTML=`"${qd.q}" <span>— ${qd.a}</span>`;

// TODAY FOCUS
const fd=[{t:'Monday',ti:'Mathematics — Algebra Part 1',to:'Functions, Matrices, Complex Numbers, Mathematical Induction'},{t:'Tuesday',ti:'Mathematics — Algebra Part 2',to:"De Moivre's Theorem, Quadratic Expressions, Theory of Equations"},{t:'Wednesday',ti:'Physics — Units & Motion',to:'Units & Measurements, Motion in Straight Line & Plane'},{t:'Thursday',ti:'Mathematics — Trigonometry',to:'Trig Ratios, Inverse Trig, Properties of Triangles, Hyperbolic Functions'},{t:'Friday',ti:'Chemistry — Atomic Structure',to:'Atomic Structure, Chemical Bonding, VSEPR Theory'},{t:'Saturday',ti:'Mathematics — Coordinate Geometry',to:'Straight Lines, Circles, Pair of Lines, System of Circles'},{t:'Sunday',ti:'Revision Day',to:'Full Week Revision + 20 Practice Questions'}];
const f=fd[new Date().getDay()];
document.getElementById('td-tag').textContent=f.t;document.getElementById('td-title').textContent=f.ti;document.getElementById('td-topics').textContent=f.to;

// NAV
function nav(el,id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.ni').forEach(n=>n.classList.remove('on'));document.getElementById('page-'+id).classList.add('active');el.classList.add('on');if(window.innerWidth<=900 && sidebar && sidebar.classList.contains('open'))toggleMenu();}

// WEEK TOGGLE
function tw(id,el){const b=document.getElementById('wb-'+id),c=document.getElementById('cv-'+id),o=b.classList.toggle('open');c.classList.toggle('open',o)}

// DAY CHECK
const daysDone=JSON.parse(localStorage.getItem('eq-days')||'{}');
function td(id){daysDone[id]=!daysDone[id];localStorage.setItem('eq-days',JSON.stringify(daysDone));rdays();ukpis()}
function rdays(){for(let w=1;w<=3;w++)for(let d=1;d<=(w<3?7:6);d++){const el=document.getElementById(`dc-w${w}-${d}`);if(!el)continue;el.textContent=daysDone[`w${w}-${d}`]?'✓':'';el.classList.toggle('done',!!daysDone[`w${w}-${d}`])}}
rdays();

// TOPICS
const topicsDone=JSON.parse(localStorage.getItem('eq-topics')||'{}');
function tt(s,i){const k=s+'-'+i;topicsDone[k]=!topicsDone[k];localStorage.setItem('eq-topics',JSON.stringify(topicsDone));rtopics();ukpis()}
function rtopics(){[{s:'math',n:7},{s:'phy',n:6},{s:'chem',n:6}].forEach(({s,n})=>{for(let i=1;i<=n;i++){const b=document.getElementById(`tp-${s}-${i}`);if(!b)return;const d=topicsDone[`${s}-${i}`];b.textContent=d?'✓ Done':'Mark done';b.classList.toggle('done',!!d)}})}
rtopics();

// KPIs
function ukpis(){const p=(d,t)=>Math.round(d/t*100);const md=[1,2,3,4,5,6,7].filter(i=>topicsDone['math-'+i]).length;const pd=[1,2,3,4,5,6].filter(i=>topicsDone['phy-'+i]).length;const cd=[1,2,3,4,5,6].filter(i=>topicsDone['chem-'+i]).length;const mp=p(md,7),pp=p(pd,6),cp=p(cd,6);document.getElementById('kpi-m').textContent=mp+'%';document.getElementById('kpi-p').textContent=pp+'%';document.getElementById('kpi-c').textContent=cp+'%';document.getElementById('kf-m').style.width=mp+'%';document.getElementById('kf-p').style.width=pp+'%';document.getElementById('kf-c').style.width=cp+'%'}
ukpis();

// SYLLABUS SWITCHER
function sw(s,el){['math','phy','chem'].forEach(x=>document.getElementById('syl-'+x).className=x===s?'tgrid':'tgrid hidden');document.querySelectorAll('.ssb').forEach(b=>b.className='ssb');el.className='ssb s'+s[0]}

// TODO
const todos=JSON.parse(localStorage.getItem('eq-todos')||'[]');
function addTodo(){const inp=document.getElementById('td-input'),subj=document.getElementById('td-subj').value,txt=inp.value.trim();if(!txt)return;todos.push({id:Date.now(),text:txt,subj,done:false});localStorage.setItem('eq-todos',JSON.stringify(todos));inp.value='';rtodos()}
function toggleTodo(id){const t=todos.find(x=>x.id===id);if(t){t.done=!t.done;localStorage.setItem('eq-todos',JSON.stringify(todos));rtodos()}}
function delTodo(id){const i=todos.findIndex(x=>x.id===id);if(i>-1){todos.splice(i,1);localStorage.setItem('eq-todos',JSON.stringify(todos));rtodos()}}
function rtodos(){const pending=todos.filter(t=>!t.done).length;document.getElementById('td-pending').textContent=pending;document.getElementById('td-done').textContent=todos.filter(t=>t.done).length;const list=document.getElementById('td-list');if(!todos.length){list.innerHTML='<div class="td-empty">No tasks yet. Add your first task above.</div>';return}const lb={math:'<i data-lucide="ruler" class="ic-xs"></i> Math',phy:'<i data-lucide="zap" class="ic-xs"></i> Physics',chem:'<i data-lucide="flask-conical" class="ic-xs"></i> Chemistry',gen:'<i data-lucide="clipboard" class="ic-xs"></i> General'};list.innerHTML=todos.map(t=>`<div class="titem ${t.done?'done':''}"><div class="tck ${t.done?'on':''}" onclick="toggleTodo(${t.id})">${t.done?'✓':''}</div><div class="ttxt">${t.text}</div><span class="ttag tt-${t.subj}">${lb[t.subj]}</span><button class="tdel" onclick="delTodo(${t.id})">×</button></div>`).join('');if(window.lucide)lucide.createIcons();}
rtodos();

// POMODORO
const modes={focus:{dur:1500,lbl:'Focus'},short:{dur:300,lbl:'Short Break'},long:{dur:900,lbl:'Long Break'}};
let curMode='focus',rem=1500,total=1500,running=false,iv=null;
let sess=+localStorage.getItem('eq-psess')||0,mins=+localStorage.getItem('eq-pmins')||0,streak=+localStorage.getItem('eq-pstreak')||0;
document.getElementById('psess').textContent=sess;document.getElementById('pmins').textContent=mins;document.getElementById('pstreak').textContent=streak;
function spm(m){if(running)togglePomo();curMode=m;rem=total=modes[m].dur;document.querySelectorAll('.pmb').forEach(b=>b.classList.remove('on'));document.getElementById('pmb-'+m).classList.add('on');document.getElementById('plbl').textContent=modes[m].lbl;dpomo()}
function dpomo(){const mn=Math.floor(rem/60),sc=rem%60;document.getElementById('ptime').textContent=String(mn).padStart(2,'0')+':'+String(sc).padStart(2,'0');document.getElementById('pring').style.strokeDashoffset=622*(1-rem/total)}
function togglePomo(){if(running){clearInterval(iv);running=false;document.getElementById('pstart').textContent='Resume'}else{running=true;document.getElementById('pstart').textContent='Pause';iv=setInterval(()=>{rem--;dpomo();if(rem<=0){clearInterval(iv);running=false;document.getElementById('pstart').textContent='Start';if(curMode==='focus'){sess++;mins+=Math.round(total/60);localStorage.setItem('eq-psess',sess);localStorage.setItem('eq-pmins',mins);document.getElementById('psess').textContent=sess;document.getElementById('pmins').textContent=mins}}},1000)}}
function resetPomo(){clearInterval(iv);running=false;rem=total;document.getElementById('pstart').textContent='Start';dpomo()}
dpomo();

if(window.lucide)lucide.createIcons();

// SPLASH SCREEN
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.classList.add('hidden');
    document.body.classList.add('loaded');
  }, 2500);
});

// MOCK TEST LOGIC
const testAnswers = {
  'test-1': {1:'B',2:'B',3:'C',4:'B',5:'C',6:'B',7:'C',8:'B',9:'B',10:'B',11:'A',12:'A',13:'B',14:'B',15:'B',16:'B',17:'B',18:'B',19:'C',20:'C',21:'A',22:'B',23:'C',24:'B',25:'B',26:'B',27:'B',28:'B',29:'B',30:'B'},
  'test-2': {1:'A',2:'B',3:'B',4:'C',5:'D',6:'B',7:'B',8:'B',9:'A',10:'A',11:'B',12:'B',13:'B',14:'D',15:'B',16:'C',17:'B',18:'B',19:'B',20:'B',21:'B',22:'B',23:'C',24:'B',25:'C',26:'C',27:'C',28:'B',29:'B',30:'C'}
};
const testSubmitted = { 'test-1': false, 'test-2': false };

function swMockSubj(id, el) {
  document.querySelectorAll('.mock-subj-container').forEach(c => c.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  
  // Update active state of subject buttons
  const subjSsw = el.closest('.ssw');
  subjSsw.querySelectorAll('.ssb').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
}

function swTest(id, el) {
  document.getElementById('test-1').classList.add('hidden');
  document.getElementById('test-2').classList.add('hidden');
  document.getElementById(id).classList.remove('hidden');
  
  // Update active state of test buttons
  const testSsw = el.closest('.ssw');
  testSsw.querySelectorAll('.ssb').forEach(b => b.classList.remove('sp')); // assuming 'sp' is used for active state of physics papers
  el.classList.add('sp');
}

document.querySelectorAll('.q-opts li').forEach(opt => {
  opt.addEventListener('click', function() {
    const testId = this.closest('.tgrid').id;
    if (testSubmitted[testId]) return;
    const ul = this.closest('ul');
    ul.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
    this.classList.add('selected');
  });
});

function submitTest(testId) {
  if (testSubmitted[testId]) return;
  let score = 0;
  
  const testContainer = document.getElementById(testId);
  
  testContainer.querySelectorAll('.q-item').forEach(item => {
    const qid = item.getAttribute('data-qid');
    const selected = item.querySelector('li.selected');
    const correctOpt = testAnswers[testId][qid];
    
    // Highlight correct answer
    const correctLi = item.querySelector(`li[data-opt="${correctOpt}"]`);
    if (correctLi) correctLi.classList.add('correct');
    
    if (selected) {
      const userOpt = selected.getAttribute('data-opt');
      if (userOpt === correctOpt) {
        score++;
      } else {
        selected.classList.add('wrong');
      }
    }
  });
  
  testSubmitted[testId] = true;
  document.getElementById('submit-test-' + testId.split('-')[1]).style.display = 'none';
  document.getElementById('ans-' + testId).classList.remove('hidden');
  
  const res = document.getElementById('res-' + testId);
  res.classList.remove('hidden');
  res.innerHTML = `<h3>Your Score: ${score} / 30</h3><p>${score >= 25 ? 'Excellent preparation!' : score >= 15 ? 'Good effort, keep revising.' : 'Needs more practice. Review your concepts.'}</p>`;
}
