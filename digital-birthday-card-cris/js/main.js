// This file contains additional JavaScript functionality for the digital birthday card.
// You can add animations or interactions to enhance the user experience.

document.addEventListener('DOMContentLoaded', function() {
  // Example of adding a simple fade-in effect for the birthday message
  const message = document.getElementById('birthday-message');
  if (message) {
    message.style.opacity = 0;
    message.style.transition = 'opacity 1s';
    message.style.opacity = 1;
  }
});

// Sentence-by-sentence animation after unlock, with extra delay between paragraphs.
const SENTENCE_DELAY_MS = 100;     // time between sentences in the same paragraph
const PARAGRAPH_PAUSE_MS = 1000;   // extra pause between paragraphs

function splitIntoSentencesByParagraph() {
  const paras = Array.from(document.querySelectorAll('#card p'));
  const sentenceRegex = /[^.!?;…]+[.!?;…]?[\u00A0\s]*/g; // keep punctuation + spaces

  const groups = [];
  for (const p of paras) {
    const original = p.textContent || '';
    p.textContent = '';
    const parts = original.match(sentenceRegex) || [original];

    const group = [];
    for (const part of parts) {
      const span = document.createElement('span');
      span.className = 'sentence';
      span.textContent = part;
      p.appendChild(span);
      group.push(span);
    }
    groups.push(group);
  }
  return groups; // array of arrays (one inner array per paragraph)
}

function animateSentences(){
  const groups = splitIntoSentencesByParagraph();
  const all = groups.flat();

  let groupIndex = 0;

  function playGroup() {
    if (groupIndex >= groups.length) return;

    const group = groups[groupIndex];
    let sentenceIndex = 0;

    function tickSentence() {
      if (sentenceIndex < group.length) {
        group[sentenceIndex].classList.add('in');
        sentenceIndex++;
        setTimeout(tickSentence, SENTENCE_DELAY_MS);
      } else {
        groupIndex++;
        if (groupIndex < groups.length) {
          setTimeout(playGroup, PARAGRAPH_PAUSE_MS);
        }
      }
    }
    tickSentence();
  }

  // Safety: if animations don’t run, un-blur everything
  setTimeout(()=>{
    const anyIn = document.querySelector('#card .sentence.in');
    if (!anyIn) all.forEach(s => s.classList.add('in'));
  }, 2000);

  setTimeout(playGroup, 150);
}

document.addEventListener('card:unlocked', animateSentences);

document.addEventListener('DOMContentLoaded', ()=>{
  // If already visible (session restore), animate immediately
  const card = document.getElementById('card');
  if (card && !card.classList.contains('hidden')) {
    animateSentences();
  }
});

// ========= Visual effects: particles + fireworks + confetti =========
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('fx-canvas');
  if (!canvas || prefersReduced) return;

  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, DPR = Math.min(2, window.devicePixelRatio || 1);
  let rafId = 0;

  const bg = [];
  const rockets = [];
  const sparks = [];
  const confetti = [];

  const COLORS = ['#ff7aa2','#ffd166','#6ef3a5','#7cc0ff','#caa6ff','#ff9b73','#fff176','#a5ffd6'];
  const rand = (a,b)=>Math.random()*(b-a)+a;
  const pick = arr=>arr[(Math.random()*arr.length)|0];

  function resize(){
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  window.addEventListener('resize', resize, { passive:true });
  resize();

  function initBG(){
    bg.length = 0;
    const count = w < 420 ? 18 : w < 768 ? 28 : 40;
    for (let i=0;i<count;i++){
      bg.push({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.08, 0.08),
        vy: rand(-0.05, 0.05),
        r: rand(0.8, 2.0),
        a: rand(0.25, 0.55),
        hue: rand(0, 360)
      });
    }
  }
  initBG();

  function launchFirework(){
    const x = rand(w*0.15, w*0.85);
    const targetY = rand(h*0.18, h*0.45);
    rockets.push({
      x, y: h + 10,
      vx: rand(-0.6,0.6),
      vy: rand(-7.5, -6.0),
      color: pick(COLORS),
      targetY
    });
  }

  function explode(x, y, color){
    const count = 45;
    for (let i=0;i<count;i++){
      const ang = rand(0, Math.PI*2);
      const spd = rand(1.2, 3.4);
      sparks.push({
        x, y,
        vx: Math.cos(ang)*spd,
        vy: Math.sin(ang)*spd,
        life: 0,
        ttl: rand(55, 95),
        color,
        size: rand(1, 2.2)
      });
    }
  }

  function burstConfetti(n=180){
    for (let i=0;i<n;i++){
      confetti.push({
        x: rand(0, w),
        y: rand(-40, -10),
        vx: rand(-0.6, 0.6),
        vy: rand(1.0, 2.2),
        w: rand(4, 7),
        h: rand(8, 12),
        rot: rand(0, Math.PI*2),
        rotV: rand(-0.15, 0.15),
        color: pick(COLORS),
        sway: rand(0.6, 1.5),
        flip: rand(0, Math.PI)
      });
    }
  }

  function confettiRain(duration=3000){
    const start = performance.now();
    function spawn(){
      const t = performance.now();
      if (t - start > duration) return;
      burstConfetti(w < 420 ? 40 : 80);
      setTimeout(spawn, 350);
    }
    spawn();
  }

  function step(){
    ctx.clearRect(0,0,w,h);

    // BG particles
    for (const p of bg){
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = w+10; if (p.x > w+10) p.x = -10;
      if (p.y < -10) p.y = h+10; if (p.y > h+10) p.y = -10;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 60%, 80%, ${p.a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    // Rockets
    for (let i=rockets.length-1;i>=0;i--){
      const r = rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.08;
      ctx.beginPath();
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = 0.8;
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - r.vx*2, r.y - r.vy*2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      if (r.vy >= 0 || r.y <= r.targetY){
        explode(r.x, r.y, r.color);
        rockets.splice(i,1);
      }
    }

    // Sparks
    for (let i=sparks.length-1;i>=0;i--){
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy;
      s.vy += 0.02;
      s.vx *= 0.992; s.vy *= 0.992;
      s.life++;

      const a = Math.max(0, 1 - s.life / s.ttl);
      if (a <= 0){ sparks.splice(i,1); continue; }

      ctx.beginPath();
      ctx.fillStyle = s.color;
      ctx.globalAlpha = a;
      ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Confetti
    for (let i=confetti.length-1;i>=0;i--){
      const c = confetti[i];
      c.x += c.vx + Math.sin((c.y + c.flip)*0.02) * c.sway*0.3;
      c.y += c.vy;
      c.vy += 0.012;
      c.rot += c.rotV;

      const fade = Math.min(1, Math.max(0, (h - c.y) / (h*0.6)));
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.globalAlpha = 0.9 * fade;
      ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
      ctx.restore();
      ctx.globalAlpha = 1;

      if (c.y - 20 > h) confetti.splice(i,1);
    }

    rafId = requestAnimationFrame(step);
  }

  function start(){
    cancelAnimationFrame(rafId);
    step();
  }

  // Expose a simple confetti trigger for other modules (timeline)
  window.fxConfetti = function(){
    burstConfetti(w < 420 ? 100 : 160);
    confettiRain(w < 420 ? 1600 : 2200);
  };

  // Orchestrate effects on unlock
  function runShow(){
    start();

    // Fireworks sequence on unlock
    const fireworksTime = w < 420 ? 5000 : 6500;
    const fwInterval = setInterval(()=> launchFirework(), 650);
    setTimeout(()=> { clearInterval(fwInterval); }, fireworksTime);

    // Confetti only when letter is shown (on unlock)
    window.fxConfetti();
  }

  document.addEventListener('card:unlocked', runShow);
})();

/* ========= Fullscreen timeline (text/img sequence) ========= */
(function(){
  const overlay = document.getElementById('timeline-overlay');
  const btn = document.getElementById('timeline-btn');
  if(!overlay || !btn) return;

  const frames = Array.from(overlay.querySelectorAll('.timeline__frame'));
  const closeBtn = overlay.querySelector('.timeline__close');

  const FADE_MS = 600;       // match CSS transition
  const DISPLAY_MS = 2200;   // time each frame stays fully visible

  let idx = -1;
  let timer = null;

  // Preload images for smoother transitions
  const preloadSrcs = [];
  frames.forEach(f=>{
    if(f.classList.contains('timeline__frame--image')){
      const m = /url\(['"]?(.+?)['"]?\)/.exec(getComputedStyle(f).getPropertyValue('--img'));
      if (m && m[1]) preloadSrcs.push(m[1]);
    }
  });
  const preload = () => preloadSrcs.forEach(src => { const im = new Image(); im.src = src; });

  function showOverlay(){
    overlay.classList.remove('hidden');
    requestAnimationFrame(()=> overlay.classList.add('is-visible'));
    document.body.style.overflow = 'hidden';
  }
  function hideOverlay(){
    overlay.classList.remove('is-visible');
    setTimeout(()=>{
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
      frames.forEach(f=> f.classList.remove('is-active'));
      idx = -1;
      if (timer) { clearTimeout(timer); timer = null; }
    }, Math.max(250, FADE_MS));
  }

  function next(){
    // fade out current
    if (idx >= 0 && idx < frames.length){
      frames[idx].classList.remove('is-active');
      frames[idx].setAttribute('aria-hidden', 'true');
    }
    // advance
    idx++;
    if (idx >= frames.length){
      // end -> close after brief pause
      timer = setTimeout(hideOverlay, 900);
      return;
    }
    // fade in next
    frames[idx].classList.add('is-active');
    frames[idx].setAttribute('aria-hidden', 'false');

    // If this is the last frame, fire confetti once
    if (idx === frames.length - 1) {
      window.fxConfetti?.();
    }

    timer = setTimeout(next, DISPLAY_MS);
  }

  function startTimeline(){
    preload();
    showOverlay();
    setTimeout(next, 120);
  }

  // Events
  btn.addEventListener('click', startTimeline);
  closeBtn?.addEventListener('click', hideOverlay);
  overlay.addEventListener('click', (e)=>{
    if (e.target === overlay) hideOverlay();
  });
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && overlay.classList.contains('is-visible')) hideOverlay();
  });

  document.addEventListener('card:unlocked', ()=>{
    btn.disabled = false;
  });
})();