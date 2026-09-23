import { freshTrial, playbackTransition } from './playback-state.mjs';
import { ruleExamples, freshRuleCheck, answerRuleCheck, moveRuleCheck, ruleCheckComplete } from './rule-check.mjs?v=clear-parent-language-v1';
import { ruleRoleTitle, ruleLessonSteps } from './rule-lesson.mjs?v=clear-parent-language-v1';
import { renderRuleScene } from './rule-scene.mjs?v=clear-parent-language-v1';
import { ruleIntroPages } from './rule-intro.mjs?v=clear-parent-language-v1';
import { practiceSequence, freshGuidedPractice, practiceVisual, startGuidedPractice, advanceGuidedPractice, checkPracticePress, pauseGuidedPractice } from './timing-practice.mjs?v=clear-parent-language-v1';

const $ = id => document.getElementById(id);
const mapUrl = './group-v3-v5-aligned-v2-parent-ux-v1-study-map.json';
const state = { map: null, cell: null, index: -1, trial: null, timer: null, generation: 0, page: 'study-entry', movie: $('movie') };
const localUrl = file => new URL('./' + file, location.href).href;
const trialLabel = entry => entry.type === 'attention' ? 'Getting your baby’s attention' : 'Time to watch';
const parentPages = ['welcome', 'setup', 'instructions', 'timing-practice', 'example', 'practice', 'ready'];
const progressSteps = { welcome: 1, setup: 2, instructions: 3, 'timing-practice': 3, example: 3, practice: 3, ready: 4 };
let practiceRunning = false;
let researcherMode = false;
const narrationFiles = {
  welcome: '01-welcome.mp3', setup: '02-get-ready.mp3', instructions: '03-look-away-rule.mp3',
  example: '04-example-intro.mp3', practice: '05-practice-intro.mp3', ready: 'ready-watch-baby-and-movie.mp3'
};
const narration = {
  auto: true, audio: $('parent-narration'), generation: 0,
  page: null, phase: 'idle', heard: new Set(), messages: new Map(), controls: new Map()
};
// Parent setup is deliberately one small decision at a time. These are exact
// excerpts of the existing Evelyn recordings, not newly synthesized speech.
const setupSteps = [
  { title: 'Use a laptop or desktop.', copy: 'You’ll need a webcam, speakers, and a physical keyboard.', scene: 'setup-computer', next: 'Next: the room →',
    audio: 'setup-device.mp3', transcript: "First, use a laptop or desktop with a webcam, speakers, and a physical keyboard. Please don't use a phone or tablet." },
  { title: 'Light your baby from the front.', copy: 'A quiet spot: no toys, extra screens, or other sound.', scene: 'setup-room', next: 'Next: a clear camera view →',
    audio: 'setup-quiet-light.mp3', transcript: 'Second, find a quiet spot. Move toys and other distractions out of view, and turn off extra screens and other sound. Make sure their full face and both eyes are clearly visible, with even light. Avoid a bright window behind them.' },
  { title: 'Make both eyes easy to see.', copy: 'Keep your baby’s whole head in view, with even light on their face.', scene: 'setup-camera', next: 'Next: check the sound →',
    audio: 'setup-camera.mp3', transcript: 'Make sure their full face and both eyes are clearly visible, with even light. Avoid a bright window behind them.' },
  { title: 'Can you hear the chimes?', copy: 'Turn on your speakers at a comfortable volume.', scene: 'setup-sound', next: 'Continue to parent practice →',
    audio: 'setup-sound-no-ordinal.mp3', transcript: 'Turn on your speakers at a comfortable volume.' }
];
const setup = { index: 0, sound: 'idle', soundConfirmed: false, generation: 0, message: '' };
const isSoundSetup = () => setupSteps[setup.index].scene === 'setup-sound';
const narrationKey = page => page === 'setup' ? `setup:${setup.index}` : page === 'instructions' ? `instructions:${ruleLesson.introIndex}` : page;

function renderSetup() {
  const step = setupSteps[setup.index];
  $('setup-position').textContent = `Setup · ${setup.index + 1} of ${setupSteps.length}`;
  $('setup-title').textContent = step.title;
  $('setup-copy').textContent = step.copy;
  setupSteps.forEach(item => { $(item.scene).hidden = item !== step; });
  $('setup-sound-actions').hidden = !isSoundSetup();
  $('setup-next').hidden = false;
  $('setup-next').disabled = isSoundSetup() && !(setup.sound === 'complete' && setup.soundConfirmed);
  $('setup-next').textContent = step.next;
  $('setup-next-note').hidden = !isSoundSetup() || setup.soundConfirmed;
  $('setup-next-note').textContent = setup.sound === 'complete' ? 'Check the box above, then Continue.' : 'First play the chimes. Then confirm you heard them.';
  $('sound-confirm-row').hidden = setup.sound !== 'complete';
  $('sound-confirm').disabled = setup.sound !== 'complete';
  $('sound-confirm').checked = setup.soundConfirmed;
  $('sound-play').disabled = ['loading', 'playing'].includes(setup.sound);
  $('sound-play').className = setup.sound === 'complete' ? 'secondary' : 'primary';
  $('sound-play').textContent = setup.sound === 'complete' ? '↻ Replay the chimes' : setup.sound === 'playing' ? 'Playing the chimes…' : setup.sound === 'loading' ? 'Loading the chimes…' : 'Play 3 gentle chimes';
  $('sound-status').textContent = setup.message || 'Play the sound, then tell us if you heard it.';
  const controls = narration.controls.get('setup');
  if (controls) {
    controls.querySelector('.narration-transcript p').textContent = step.transcript;
    controls.querySelector('.narration-transcript').hidden = false;
  }
  renderNarration();
}

function moveSetup(direction) {
  if (state.page !== 'setup' || document.hidden) return;
  if (direction === -1 && setup.index === 0) { showPage('welcome'); return; }
  if (direction === 1 && setup.index === setupSteps.length - 1) {
    if (setup.sound === 'complete' && setup.soundConfirmed) showPage('instructions');
    return;
  }
  const next = setup.index + direction;
  if (![1, -1].includes(direction) || next < 0 || next >= setupSteps.length) return;
  stopParentMedia();
  setup.index = next;
  setup.sound = 'idle';
  setup.soundConfirmed = false;
  setup.message = '';
  setup.generation += 1;
  $('sound-help').open = false;
  $('setup-audio').open = false;
  renderSetup();
  window.scrollTo({ top: 0, behavior: 'instant' });
  $('setup-title').focus({ preventScroll: true });
  if (narration.auto) startNarration('setup');
}

function playSetupSound() {
  if (state.page !== 'setup' || !isSoundSetup() || document.hidden || ['loading', 'playing'].includes(setup.sound)) return;
  const token = ++setup.generation;
  const audio = freshParentMedia('sound-check');
  setup.sound = 'loading';
  setup.soundConfirmed = false;
  setup.message = 'The sample is loading…';
  renderSetup();
  const current = () => state.page === 'setup' && isSoundSetup() && !document.hidden && setup.generation === token && $('sound-check') === audio;
  const failure = error => {
    if (!current()) return;
    audio.pause();
    setup.sound = 'error';
    setup.message = error?.name === 'NotAllowedError'
      ? 'Your browser blocked the sound. Click Play 3 gentle chimes to try again.'
      : 'The chimes couldn’t play. Check your sound and try again.';
    $('sound-help').open = true;
    renderSetup();
  };
  audio.onplaying = () => {
    if (!current()) { audio.pause(); return; }
    setup.sound = 'playing';
    setup.message = 'Listen for 3 gentle chimes.';
    renderSetup();
  };
  audio.onended = () => {
    if (!current() || setup.sound !== 'playing') return;
    setup.sound = 'complete';
    setup.message = 'Heard all 3? Check the box below.';
    renderSetup();
    $('sound-confirm').focus({ preventScroll: false });
  };
  audio.onerror = failure;
  audio.play().catch(failure);
}

let ruleCheck = freshRuleCheck();
let timingPractice = freshGuidedPractice();
let timingTimer = null;
let timingGeneration = 0;
const practiceArt = $('practice-art-loader');
let practiceArtReady = practiceArt.complete && practiceArt.naturalWidth > 0;
let practiceArtFailed = false;
practiceArt.onload = () => { practiceArtReady=true; practiceArtFailed=false; renderTimingPractice(); };
practiceArt.onerror = () => { practiceArtReady=false; practiceArtFailed=true; stopTimingPractice(); renderTimingPractice(); };

function stopTimingPractice() {
  clearTimeout(timingTimer);
  timingTimer = null;
  timingGeneration += 1;
  timingPractice = pauseGuidedPractice(timingPractice);
}

function renderTimingPractice() {
  const running=timingPractice.phase==='running';
  const success=timingPractice.phase==='success';
  const visual=practiceVisual(timingPractice);
  $('timing-visual').innerHTML=renderRuleScene({...visual,cue:'none',showCount:false});
  $('timing-visual').dataset.moving=String(running && visual.movie==='moving');
  $('timing-start').hidden=running;
  $('timing-start').disabled=!practiceArtReady;
  $('timing-start').textContent=timingPractice.phase==='idle' ? 'Start practice' : 'Try again';
  $('timing-response').hidden=!running;
  $('timing-next').disabled=!success;
  $('timing-feedback').textContent=!practiceArtReady
    ? practiceArtFailed ? 'The practice picture could not load. Please reload this page.' : 'Loading the practice picture…'
    : timingPractice.feedback;
  $('timing-feedback').className='timing-feedback '+(success ? 'success' : '');
  $('timing-caption').textContent=running
    ? visual.movie==='moving' ? 'The movie is moving.' : visual.gaze==='away' ? 'She is looking away.' : 'She is watching the screen.'
    : success ? 'That movie would end now.' : 'Watch this practice baby. You do the counting.';
}

function beginTimingPractice() {
  if(state.page!=='timing-practice' || document.hidden || !practiceArtReady) return;
  stopTimingPractice();
  stopParentMedia();
  timingPractice=startGuidedPractice();
  const token=timingGeneration;
  const schedule=() => {
    renderTimingPractice();
    if(timingPractice.phase!=='running') return;
    timingTimer=setTimeout(() => {
      if(token!==timingGeneration || state.page!=='timing-practice' || document.hidden) return;
      timingTimer=null;
      timingPractice=advanceGuidedPractice(timingPractice,performance.now());
      schedule();
    },practiceSequence[timingPractice.index].durationMs);
  };
  schedule();
  $('timing-title').focus({preventScroll:true});
}

function pressTimingSpace() {
  if(state.page!=='timing-practice' || document.hidden || timingPractice.phase!=='running') return;
  timingPractice=checkPracticePress(timingPractice,performance.now());
  if(timingPractice.phase==='success') stopTimingPractice();
  renderTimingPractice();
  if(timingPractice.phase==='success') $('timing-feedback').focus({preventScroll:false});
}

const ruleLesson = { mode: 'overview', introIndex: 0, introStarted: false, frame: 0, ended: false, paused: false, timer: null, generation: 0 };

function stopRuleDemo() {
  clearTimeout(ruleLesson.timer);
  ruleLesson.timer = null;
  ruleLesson.generation += 1;
}

function renderRuleCheck() {
  const step = ruleLessonSteps[ruleCheck.index];
  const overview = ruleLesson.mode === 'overview';
  const intro = ruleIntroPages[ruleLesson.introIndex];
  const teaching = ruleLesson.mode === 'teach';
  const questionReady = ruleLesson.mode === 'question' && ruleLesson.ended && !ruleLesson.paused;
  const answered = ruleCheck.answered[ruleCheck.index];
  const lastComplete = questionReady && ruleCheck.index === ruleLessonSteps.length - 1 && ruleCheckComplete(ruleCheck);
  const frame = (overview ? intro.frames : teaching ? step.frames : step.questionFrames)[ruleLesson.frame];
  $('rule-position').hidden = false;
  $('rule-position').textContent = overview ? `Your part · ${ruleLesson.introIndex + 1} of ${ruleIntroPages.length}` : `Example ${ruleCheck.index + 1} of ${ruleLessonSteps.length} · ${teaching ? 'Watch what happens' : questionReady ? 'Now choose' : 'Watch, then choose'}`;
  $('instructions-title').textContent = overview ? intro.title : teaching ? step.title : questionReady ? step.questionTitle : 'Watch this short example.';
  $('rule-heading-copy').textContent = overview
    ? intro.copy
    : teaching ? step.copy : questionReady ? step.questionCopy : 'Watch the movie and the baby. Then choose what you would do.';
  const visual = frame.visual;
  $('rule-visual').innerHTML = renderRuleScene(visual);
  // A question about a moving movie must keep visibly moving while parents answer.
  $('rule-visual').dataset.moving = String(!ruleLesson.paused && visual.movie === 'moving');
  $('rule-scene-caption').textContent = ruleLesson.paused ? 'Example paused. Replay it when you’re ready.' : frame.caption;
  $('rule-example-note').hidden = overview && intro.frames.length === 1;
  $('rule-example-note').textContent = overview ? 'Teaching example—not a timer for your baby.' : 'Animated practice example—not your baby or a live camera.';
  $('rule-review-tools').hidden = overview && intro.frames.length === 1;
  $('rule-review-overview').hidden = overview;
  $('rule-replay-demo').textContent = overview ? '↻ Watch this step again' : '↻ Show this again';
  $('rule-audio-area').hidden = !overview;
  $('rule-extra').hidden = true; // Breaks now have their own short, narrated page.
  const controls = narration.controls.get('instructions');
  if (overview && controls) {
    controls.querySelector('.narration-transcript p').textContent = intro.transcript;
    controls.querySelector('.narration-transcript').hidden = false;
  }
  $('rule-answer-group').hidden = !questionReady || answered;
  $('rule-question').textContent = step.questionCopy;
  ['rule-answer-a', 'rule-answer-b'].forEach((id, choice) => {
    const button = $(id);
    button.textContent = step.choices[choice];
    button.disabled = !questionReady || answered;
    button.className = 'rule-answer' + (ruleCheck.selected === choice ? ` ${answered ? 'correct' : 'retry'}` : '');
  });
  $('rule-feedback').hidden = !questionReady || !ruleCheck.feedback;
  $('rule-feedback').textContent = ruleCheck.feedback ? step[ruleCheck.feedback] : '';
  $('rule-feedback').className = `rule-feedback ${ruleCheck.feedback}`;
  $('rule-previous').disabled = false;
  $('rule-next').hidden = lastComplete;
  $('rule-next').disabled = !overview && !ruleLesson.paused && (teaching ? !ruleLesson.ended : !questionReady || !answered);
  $('rule-next').textContent = overview ? intro.next
    : ruleLesson.paused ? 'Replay this example'
      : teaching ? (ruleLesson.ended ? 'Watch & try →' : 'Watch the example…')
        : questionReady ? 'Next example →' : 'Watch the example…';
  $('instructions-next').hidden = !lastComplete;
  $('instructions-next').disabled = !lastComplete;
}

function showRuleOverview() {
  showRuleIntro(0);
}

function showRuleIntro(index) {
  if (state.page !== 'instructions') return;
  stopRuleDemo();
  stopNarration();
  ruleLesson.mode = 'overview';
  ruleLesson.introIndex = Math.max(0, Math.min(ruleIntroPages.length - 1, index));
  ruleLesson.frame = 0;
  ruleLesson.ended = false;
  ruleLesson.introStarted = false;
  ruleLesson.paused = false;
  $('rule-audio-area').querySelector('details').open = false;
  renderRuleCheck();
  $('instructions-title').focus({ preventScroll: false });
  if (narration.auto) startNarration('instructions');
  else startRuleIntroAnimation();
}

function startRuleIntroAnimation() {
  if (state.page !== 'instructions' || ruleLesson.mode !== 'overview' || document.hidden) return;
  stopRuleDemo();
  ruleLesson.paused = false;
  ruleLesson.introStarted = true;
  const token = ruleLesson.generation;
  const introIndex = ruleLesson.introIndex;
  const frames = ruleIntroPages[introIndex].frames;
  const advanceFrame = index => {
    if (token !== ruleLesson.generation || state.page !== 'instructions' || ruleLesson.mode !== 'overview' || ruleLesson.introIndex !== introIndex || document.hidden) return;
    ruleLesson.frame = index;
    ruleLesson.ended = index === frames.length - 1;
    ruleLesson.timer = null;
    renderRuleCheck();
    if (!ruleLesson.ended) ruleLesson.timer = setTimeout(() => advanceFrame(index + 1), frames[index + 1].afterMs);
  };
  advanceFrame(0);
}

function startRuleSequence(mode) {
  if (state.page !== 'instructions' || document.hidden) return;
  stopNarration();
  stopRuleDemo();
  ruleLesson.mode = mode;
  ruleLesson.frame = 0;
  ruleLesson.ended = false;
  ruleLesson.paused = false;
  const token = ruleLesson.generation;
  const frames = ruleLessonSteps[ruleCheck.index][mode === 'teach' ? 'frames' : 'questionFrames'];
  const advanceFrame = index => {
    if (token !== ruleLesson.generation || state.page !== 'instructions' || ruleLesson.mode !== mode || document.hidden) return;
    ruleLesson.frame = index;
    ruleLesson.ended = index === frames.length - 1;
    ruleLesson.timer = null;
    renderRuleCheck();
    if (!ruleLesson.ended) ruleLesson.timer = setTimeout(() => advanceFrame(index + 1), frames[index + 1].afterMs);
  };
  advanceFrame(0);
  $('instructions-title').focus({ preventScroll: false });
}

function startRuleTeaching() { startRuleSequence('teach'); }
function startRuleQuestion() { startRuleSequence('question'); }

function advanceRuleLesson() {
  if (state.page !== 'instructions' || document.hidden) return;
  if (ruleLesson.mode === 'overview') {
    if (ruleLesson.introIndex < ruleIntroPages.length - 1) showRuleIntro(ruleLesson.introIndex + 1);
    else startRuleQuestion();
    return;
  }
  if (ruleLesson.paused) { startRuleSequence(ruleLesson.mode); return; }
  if (ruleLesson.mode === 'teach') {
    if (!ruleLesson.ended) return;
    startRuleQuestion();
    return;
  }
  if (!ruleLesson.ended || !ruleCheck.answered[ruleCheck.index] || ruleCheck.index === ruleLessonSteps.length - 1) return;
  ruleCheck = moveRuleCheck(ruleCheck, 1);
  startRuleQuestion();
}

function backRuleLesson() {
  if (state.page !== 'instructions') return;
  if (ruleLesson.mode === 'overview') {
    if (ruleLesson.introIndex > 0) showRuleIntro(ruleLesson.introIndex - 1);
    else showPage('setup');
    return;
  }
  if (ruleLesson.mode === 'question') {
    if (ruleCheck.index === 0) showRuleIntro(ruleIntroPages.length - 1);
    else { ruleCheck = moveRuleCheck(ruleCheck, -1); startRuleQuestion(); }
    return;
  }
  if (ruleCheck.index === 0) { showRuleOverview(); return; }
  stopRuleDemo();
  ruleCheck = moveRuleCheck(ruleCheck, -1);
  startRuleQuestion();
}

function chooseRuleAnswer(choice) {
  if (state.page !== 'instructions' || document.hidden || ruleLesson.mode !== 'question' || !ruleLesson.ended || ruleLesson.paused) return;
  stopNarration();
  ruleCheck = answerRuleCheck(ruleCheck, choice);
  renderRuleCheck();
  $(ruleCheck.feedback === 'retry' ? 'rule-answer-a' : 'rule-feedback').focus({ preventScroll: false });
}

function renderNarration() {
  narration.controls.forEach((controls, page) => {
    const active = narration.page === page && ['loading', 'playing'].includes(narration.phase);
    const replay = controls.querySelector('.narration-replay');
    replay.textContent = page === 'instructions' ? '↻ Replay this step' : '↻ Replay audio';
    replay.hidden = !narration.heard.has(narrationKey(page));
    controls.querySelector('.narration-stop').disabled = !active;
    controls.querySelector('.narration-auto').hidden = false;
    controls.querySelector('input').checked = narration.auto;
    controls.querySelector('.narration-status').textContent = narration.messages.get(page) || '';
  });
  $('rule-audio-stop').hidden = !(narration.page === 'instructions' && ['loading', 'playing'].includes(narration.phase));
}

function stopNarration(message = '') {
  const page = narration.page;
  narration.generation += 1;
  narration.audio.onplaying = narration.audio.onended = narration.audio.onerror = null;
  narration.audio.pause();
  try { narration.audio.currentTime = 0; } catch { /* An unloaded clip has no seekable range. */ }
  narration.page = null;
  narration.phase = 'idle';
  if (page) narration.messages.set(page, message);
  renderNarration();
}

function startNarration(page) {
  if (!narrationFiles[page] || state.page !== page || document.hidden) return;
  if (page === 'instructions' && ruleLesson.mode !== 'overview') return;
  if (page === 'instructions') {
    stopRuleDemo();
    ruleLesson.frame = 0;
    ruleLesson.ended = false;
    ruleLesson.paused = false;
    ruleLesson.introStarted = false;
    renderRuleCheck();
  }
  // Stop pending and active parent media before starting a spoken instruction.
  stopParentMedia();
  ['sound-check', 'example-movie', 'practice-movie'].forEach(id => {
    try { $(id).currentTime = 0; } catch { /* The media may not yet be loaded. */ }
  });
  if (page === 'practice') {
    $('practice-replay').hidden = true;
    $('practice-status').textContent = 'Listen to the instructions, then start the practice when you’re ready.';
  }
  const old = narration.audio;
  const audio = old.cloneNode(false);
  old.replaceWith(audio);
  narration.audio = audio;
  narration.page = page;
  narration.phase = 'loading';
  narration.messages.set(page, 'Loading the spoken instructions…');
  const token = narration.generation;
  const current = () => token === narration.generation && narration.audio === audio && narration.page === page && state.page === page && !document.hidden && (page !== 'instructions' || ruleLesson.mode === 'overview');
  const failure = error => {
    if (!current()) return;
    // An unavailable clip never prevents reading or moving through the setup pages.
    const message = error?.name === 'NotAllowedError'
      ? 'Your browser blocked the spoken instructions. You can read them below.'
      : 'The spoken instructions couldn’t play. You can read them below and continue.';
    if (page === 'setup') $('setup-audio').open = true;
    stopNarration(message + (narration.auto ? ' Automatic narration is still on for the next page.' : ' Automatic narration is off.'));
    if (page === 'instructions') startRuleIntroAnimation();
  };
  audio.onplaying = () => {
    if (!current()) { audio.pause(); return; }
    narration.phase = 'playing';
    narration.heard.add(narrationKey(page));
    narration.messages.set(page, 'Reading this page aloud.');
    renderNarration();
  };
  audio.onended = () => {
    if (!current()) return;
    stopNarration('Finished. You can replay the instructions at any time.');
    if (page === 'instructions') startRuleIntroAnimation();
  };
  audio.onerror = failure;
  const narrationFile = page === 'setup' ? setupSteps[setup.index].audio : page === 'instructions' ? ruleIntroPages[ruleLesson.introIndex].audio : narrationFiles[page];
  audio.src = new URL(`./${narrationFile}`, location.href).href;
  renderNarration();
  audio.play().catch(failure);
}

Object.keys(narrationFiles).forEach(page => {
  const controls = $('narration-controls-template').content.firstElementChild.cloneNode(true);
  (page === 'instructions' ? $('rule-narration') : page === 'ready' ? $('ready-narration') : page === 'setup' ? $('setup-narration') : $(page).querySelector('.page-heading')).append(controls);
  narration.controls.set(page, controls);
  controls.querySelector('.narration-replay').onclick = () => {
    if (narration.heard.has(narrationKey(page))) startNarration(page);
  };
  controls.querySelector('.narration-stop').onclick = () => {
    stopNarration('Stopped for this page. Uncheck “Read pages aloud” to keep later pages silent.');
    if (page === 'instructions') startRuleIntroAnimation();
  };
  controls.querySelector('input').onchange = event => {
    narration.auto = event.target.checked;
    if (!narration.auto) {
      stopNarration();
      narration.messages.set(page, 'Automatic narration is off. Check “Read pages aloud” to turn it back on.');
      renderNarration();
      if (page === 'instructions' && !ruleLesson.introStarted) startRuleIntroAnimation();
    } else startNarration(page);
  };
});
renderNarration();

fetch('./narration-manifest.json').then(response => {
  if (!response.ok) throw new Error('Narration transcript is unavailable');
  return response.json();
}).then(manifest => {
  for (const clip of manifest.clips || []) {
    if (clip.page === 'setup' || clip.page === 'instructions') continue; // Step pages show only their matching excerpt.
    const controls = narration.controls.get(clip.page);
    if (!controls || typeof clip.text !== 'string' || !clip.text.trim()) continue;
    // The ready derivative removes the outdated instruction not to watch movies.
    const transcript = clip.page === 'ready' ? clip.text.replace('Watch your baby, not the movies. ', '') : clip.text;
    controls.querySelector('.narration-transcript p').textContent = transcript;
    controls.querySelector('.narration-transcript').hidden = false;
  }
}).catch(() => { /* A transcript or missing asset never blocks the parent flow. */ });

// Native training-video controls can also start playback; stop narration first.
document.addEventListener('play', event => {
  if (event.target instanceof HTMLMediaElement && event.target !== narration.audio) stopNarration();
}, true);

function stopParentMedia() {
  stopNarration();
  ['sound-check', 'example-movie', 'practice-movie'].forEach(id => {
    const media = $(id);
    media.onplaying = media.onended = media.onerror = null;
    media.pause();
  });
  if (['loading', 'playing'].includes(setup.sound)) {
    setup.sound = 'idle';
    setup.soundConfirmed = false;
    setup.message = 'The sound stopped. Play the chimes again when you’re ready.';
    setup.generation += 1;
    renderSetup();
  }
  practiceRunning = false;
  $('practice-space').disabled = true;
  $('practice-start').hidden = false;
  $('example-start').hidden = false;
  $('sound-play').disabled = false;
}

function freshParentMedia(id) {
  stopNarration();
  const old = $(id);
  old.pause();
  old.onplaying = old.onended = old.onerror = null;
  const media = old.cloneNode(false);
  old.replaceWith(media);
  return media;
}

function clearPlayback() {
  clearTimeout(state.timer);
  state.timer = null;
  state.generation += 1;
  state.movie.pause();
  state.movie.onplaying = null;
  state.movie.onended = null;
  state.movie.onerror = null;
  state.movie.onwaiting = null;
}

// Explicit review-only bypasses. These never answer parent questions or alter
// the normal completion gates, response data, protocol or scientific player.
function renderResearcherControls() {
  const screens = ['study-entry', ...parentPages];
  const index = screens.indexOf(state.page);
  $('researcher-navigation').hidden = !researcherMode;
  $('preview-badge').textContent = researcherMode ? 'Researcher review · recording off' : 'Design preview · camera off';
  $('researcher-back').disabled = !researcherMode || state.page === 'study-entry';
  $('researcher-next').disabled = !researcherMode || index < 0 || index === screens.length - 1;
  $('researcher-stimuli').disabled = !researcherMode || !state.map;
  $('researcher-movie').hidden = state.page !== 'session';
  $('researcher-movie').disabled = !researcherMode || state.page !== 'session' || !state.cell;
  $('researcher-status').textContent = state.page === 'session'
    ? `Reviewing ${state.cell?.study_arm || ''} · ${state.cell?.ps_condition_id || ''}. Movie ${state.index + 1} of ${state.cell?.entries.length || 0}.`
    : 'Skip controls are for review only. Normal parent checks are unchanged.';
}

function researcherNavigate(page) {
  if (!researcherMode || document.hidden || !['study-entry', ...parentPages].includes(page)) return;
  clearPlayback();
  state.trial = null;
  state.index = -1;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  showPage(page);
}

function researcherStep(direction) {
  if (!researcherMode || ![1, -1].includes(direction)) return;
  const screens = ['study-entry', ...parentPages];
  const index = screens.indexOf(state.page);
  if (index < 0) { if (direction === -1) researcherNavigate('ready'); return; }
  const next = screens[index + direction];
  if (next) researcherNavigate(next);
}

function researcherStartMovies() {
  if (!researcherMode || document.hidden || !state.map) return;
  selectCell();
  showPage('session');
  playEntry(0);
}

function researcherSkipMovie() {
  if (!researcherMode || document.hidden || state.page !== 'session' || !state.cell) return;
  playEntry(state.index + 1);
}

function showPage(page) {
  stopRuleDemo();
  stopTimingPractice();
  stopParentMedia();
  state.page = page;
  if (page === 'setup') renderSetup();
  if (page === 'timing-practice') { timingPractice=freshGuidedPractice(); renderTimingPractice(); }
  if (page === 'instructions') { ruleLesson.mode = 'overview'; ruleLesson.introIndex = 0; ruleLesson.frame = 0; ruleLesson.introStarted = false; ruleLesson.paused = false; renderRuleCheck(); }
  ['study-entry', ...parentPages, 'session', 'complete'].forEach(id => { $(id).hidden = id !== page; });
  $('parent-shell').hidden = !parentPages.includes(page);
  $('preview-tools').hidden = !parentPages.includes(page);
  if (parentPages.includes(page)) $('review-page').value = page;
  document.querySelectorAll('[data-step]').forEach(item => {
    const n = Number(item.dataset.step);
    item.classList.toggle('active', n === progressSteps[page]);
    item.classList.toggle('complete', n < progressSteps[page]);
    item.querySelector('i').textContent = n < progressSteps[page] ? '✓' : n;
    if (n === progressSteps[page]) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
  $(page).querySelector('h1')?.focus({ preventScroll: true });
  if (narration.auto && parentPages.includes(page)) startNarration(page);
  else if (page === 'instructions') startRuleIntroAnimation();
  renderResearcherControls();
}

function exitSession() {
  clearPlayback();
  state.trial = null;
  state.index = -1;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  showPage('welcome');
}

function renderState() {
  renderResearcherControls();
  const phase = state.trial?.phase;
  $('advance').disabled = phase !== 'hold';
  $('pause').disabled = !['playing','loading','hold','paused'].includes(phase);
  $('pause').textContent = phase === 'paused' ? 'Restart item · P' : 'Pause · P';
  const messages = {
    loading: 'Loading the movie…', playing: 'Let the movie finish. Space is disabled.',
    hold: 'The picture is still. Press space after your baby has looked away from the screen for 3 full seconds without looking back.', paused: 'Paused. Resume restarts this item.',
    error: 'The movie could not play. Retry this item.', finished: 'Continuing…'
  };
  $('status').textContent = messages[phase] || '';
  const entry = state.cell?.entries[state.index];
  $('progress').textContent = entry ? `${state.index + 1} of ${state.cell.entries.length}` : '';
  $('overlay').hidden = !['paused','error','blocked'].includes(phase);
  if (phase === 'paused') {
    $('overlay-title').textContent = 'Take your time';
    $('overlay-text').textContent = 'Press P or the button below when you are ready. The current item will start again.';
    $('overlay-action').textContent = 'Restart this item';
  } else if (phase === 'error' || phase === 'blocked') {
    $('overlay-title').textContent = phase === 'error' ? 'Let’s try that movie again' : 'Press play to continue';
    $('overlay-text').textContent = phase === 'error' ? 'The file did not load or playback was interrupted. The study has stayed on this item.' : 'Your browser needs a click before it can play sound.';
    $('overlay-action').textContent = 'Play this item';
  }
}

function dispatch(event) {
  if (!state.trial || state.page !== 'session') return;
  const result = playbackTransition(state.trial, event, performance.now());
  state.trial = result.state;
  if (event === 'pause' || event === 'error') { clearTimeout(state.timer); state.timer = null; state.movie.pause(); }
  renderState();
  if (result.advance) playEntry(state.index + 1);
}

function playEntry(index) {
  stopNarration();
  clearPlayback();
  if (index >= state.cell.entries.length) {
    state.trial = null;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    showPage('complete'); return;
  }
  state.index = index;
  state.trial = freshTrial(state.cell.entries[index].control_mode === 'parent-controlled');
  const entry = state.cell.entries[index];
  const token = state.generation;
  // A fresh element prevents queued media events from a previous source unlocking a new item.
  const old = state.movie;
  const video = old.cloneNode(false);
  old.replaceWith(video);
  state.movie = video;
  video.loop = false;
  video.controls = false;
  video.src = localUrl(entry.source_file);
  const isCurrent = () => token === state.generation && state.movie === video && state.page === 'session';
  video.onplaying = () => {
    if (!isCurrent()) return;
    if (state.trial.phase === 'playing') { renderState(); return; }
    if (state.trial.phase !== 'loading') return;
    dispatch('playing');
    if (state.trial.controlled) {
      state.timer = setTimeout(() => { if (isCurrent()) dispatch('ceiling'); }, state.map.method.trial_ceiling_seconds * 1000);
    }
  };
  video.onended = () => { if (isCurrent()) dispatch('ended'); };
  video.onerror = () => { if (isCurrent()) dispatch('error'); };
  video.onwaiting = () => {
    if (isCurrent() && state.trial.phase === 'playing') $('status').textContent = 'Buffering… Space remains disabled until the movie ends.';
  };
  $('trial-title').textContent = trialLabel(entry);
  $('assignment').textContent = `${state.cell.study_arm} · ${state.cell.ps_condition_id} · ${state.cell.group_size} characters per group`;
  $('entry').value = String(index);
  $('detail').textContent = [entry.event_id,entry.group,entry.actor,entry.action,entry.expectedness].filter(Boolean).join(' · ');
  renderState();
  video.load();
  video.play().catch(error => {
    if (!isCurrent() || state.trial.phase === 'paused') return;
    clearTimeout(state.timer);
    state.trial.phase = error.name === 'NotAllowedError' ? 'blocked' : 'error';
    renderState();
  });
}

function selectCell() {
  state.cell = state.map.cells.find(cell => cell.study_arm === $('arm').value && cell.ps_condition_id === $('condition').value);
  $('entry').replaceChildren(...state.cell.entries.map((entry,index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${index+1}. ${entry.event_id} · ${entry.control_mode}`;
    return option;
  }));
}

function togglePause() {
  stopNarration();
  if (state.page !== 'session' || !state.trial) return;
  if (state.trial.phase === 'paused') playEntry(state.index);
  else dispatch('pause');
}

// A normal study-start gesture permits audible welcome narration in browsers
// that block first-load sound. Keep this synchronous: do not await data/media.
$('start-study').onclick = () => {
  if (state.page !== 'study-entry' || document.hidden) return;
  showPage('welcome');
};
$('researcher-mode').onchange = event => { researcherMode = !!event.target.checked; renderResearcherControls(); };
$('researcher-back').onclick = () => researcherStep(-1);
$('researcher-next').onclick = () => researcherStep(1);
$('researcher-rule').onclick = () => researcherNavigate('instructions');
$('researcher-timing').onclick = () => researcherNavigate('timing-practice');
$('researcher-example').onclick = () => researcherNavigate('example');
$('researcher-practice').onclick = () => researcherNavigate('practice');
$('researcher-ready').onclick = () => researcherNavigate('ready');
$('researcher-stimuli').onclick = researcherStartMovies;
$('researcher-movie').onclick = researcherSkipMovie;
renderResearcherControls();
$('begin').onclick = () => { selectCell(); setup.index = 0; showPage('setup'); };
$('play').onclick = () => { selectCell(); showPage('session'); playEntry(0); };
document.querySelectorAll('[data-page]').forEach(button => { button.onclick = () => showPage(button.dataset.page); });
$('review-go').onclick = () => { $('preview-tools').open = false; showPage($('review-page').value); };
$('setup-back').onclick = () => moveSetup(-1);
$('setup-next').onclick = () => moveSetup(1);
$('rule-answer-a').onclick = () => chooseRuleAnswer(0);
$('rule-answer-b').onclick = () => chooseRuleAnswer(1);
$('rule-previous').onclick = backRuleLesson;
$('rule-next').onclick = advanceRuleLesson;
$('rule-replay-demo').onclick = () => {
  if (ruleLesson.mode === 'overview') { stopNarration(); startRuleIntroAnimation(); }
  else if (ruleLesson.mode === 'question') startRuleQuestion();
  else startRuleTeaching();
};
$('rule-review-overview').onclick = showRuleOverview;
$('rule-audio-stop').onclick = () => {
  stopNarration('Stopped. You can replay this step in Audio & written instructions.');
  startRuleIntroAnimation();
};
$('instructions-next').onclick = () => {
  if (state.page === 'instructions' && !document.hidden && ruleLesson.mode === 'question' && ruleLesson.ended && !ruleLesson.paused && ruleCheck.index === ruleLessonSteps.length - 1 && ruleCheckComplete(ruleCheck)) showPage('timing-practice');
};
$('timing-start').onclick=beginTimingPractice;
$('timing-next').onclick=() => { if(state.page==='timing-practice' && timingPractice.phase==='success') showPage('example'); };
renderTimingPractice();
renderRuleCheck();
$('sound-play').onclick = playSetupSound;
$('sound-confirm').onchange = event => {
  if (state.page !== 'setup' || !isSoundSetup() || document.hidden || setup.sound !== 'complete') return;
  setup.soundConfirmed = !!event.target.checked;
  renderSetup();
};

$('example-start').onclick = () => {
  const video = freshParentMedia('example-movie');
  video.src = 'https://osf.io/download/v4npq/';
  $('example-start').hidden = true;
  $('example-status').textContent = 'Watch how brief looks away are different from 3 continuous seconds away.';
  const current = () => state.page === 'example' && $('example-movie') === video;
  const failure = () => {
    if (!current()) return;
    $('example-start').hidden = false;
    $('example-status').textContent = 'The example couldn’t play. Please try again.';
  };
  video.onended = () => {
    if (!current()) return;
    $('example-next').disabled = false;
    $('example-status').textContent = 'Next, try the same look-away rule yourself. During the study, wait for the action to finish first.';
  };
  video.onerror = failure;
  video.play().catch(failure);
};

function finishPractice(pressed) {
  if (state.page !== 'practice' || !practiceRunning) return;
  practiceRunning = false;
  $('practice-movie').pause();
  $('practice-space').disabled = true;
  $('practice-replay').hidden = false;
  $('practice-next').disabled = false;
  $('practice-feedback').hidden = false;
  $('practice-status').textContent = pressed
    ? 'You pressed space. Your timing wasn’t scored. You can try again or continue.'
    : 'The example has finished. No key press was scored. You can try again or continue.';
}

function startPractice() {
  const video = freshParentMedia('practice-movie');
  video.src = 'https://osf.io/download/juea4/';
  practiceRunning = false;
  $('practice-start').hidden = true;
  $('practice-replay').hidden = true;
  $('practice-next').disabled = true;
  $('practice-feedback').hidden = true;
  $('practice-space').disabled = true;
  $('practice-status').textContent = 'Loading the practice video…';
  const current = () => state.page === 'practice' && $('practice-movie') === video;
  const failure = () => {
    if (!current()) return;
    practiceRunning = false;
    $('practice-space').disabled = true;
    $('practice-start').hidden = false;
    $('practice-status').textContent = 'The practice couldn’t play. Please try again.';
  };
  video.onplaying = () => {
    if (!current()) return;
    practiceRunning = true;
    $('practice-space').disabled = false;
    $('practice-status').textContent = 'Watch the child. Press space after they have looked away from the screen for 3 full seconds without looking back.';
  };
  video.onended = () => { if (current()) finishPractice(false); };
  video.onerror = failure;
  video.play().catch(failure);
}
$('practice-start').onclick = startPractice;
$('practice-replay').onclick = startPractice;
$('practice-space').onclick = () => finishPractice(true);
$('leave').onclick = exitSession;
$('again').onclick = exitSession;
$('advance').onclick = () => dispatch('space');
$('pause').onclick = togglePause;
$('overlay-action').onclick = () => playEntry(state.index);
$('jump').onclick = () => playEntry(Number($('entry').value));
$('replay').onclick = () => playEntry(state.index);
$('fullscreen').onclick = () => $('stage').requestFullscreen().catch(() => { $('status').textContent = 'Full screen is unavailable in this browser. Playback can continue here.'; });
document.addEventListener('keydown', event => {
  if (state.page === 'timing-practice' && event.code === 'Space' && !/^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) {
    if (event.target.tagName === 'BUTTON' && event.target.id !== 'timing-response') return;
    event.preventDefault();
    if (!event.repeat) pressTimingSpace();
    return;
  }
  if (state.page === 'practice' && event.code === 'Space' && !/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(event.target.tagName)) {
    event.preventDefault();
    if (!event.repeat) finishPractice(true);
    return;
  }
  if (state.page !== 'session' || /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(event.target.tagName)) return;
  if (event.code === 'Space') {
    event.preventDefault();
    if (!event.repeat) dispatch('space');
  } else if (event.code === 'KeyP') {
    event.preventDefault(); if (!event.repeat) togglePause();
  }
});
// Blur buttons after a click so subsequent space presses use the trial handler.
document.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
  if (!button.closest('.visual-rule-lesson')) button.blur();
}));
document.addEventListener('visibilitychange', () => {
  // Returning to a tab never starts the study or restarts interrupted speech.
  if (!document.hidden) return;
  if(state.page==='timing-practice') { stopTimingPractice(); renderTimingPractice(); }
  if (state.page === 'instructions') {
    stopRuleDemo();
    ruleLesson.paused = true;
    renderRuleCheck();
  }
  stopNarration('Paused while this page was hidden. Replay the audio or continue when you’re ready.');
  if (state.page === 'session') dispatch('pause');
  else {
    stopParentMedia();
    if (state.page === 'practice') $('practice-status').textContent = 'Practice paused while this page was hidden. Start the practice again when you’re ready.';
    if (state.page === 'example') $('example-status').textContent = 'Example paused. Play it again when you’re ready.';
    if (state.page === 'setup') renderSetup();
  }
});
let wasFullscreen = false;
document.addEventListener('fullscreenchange', () => {
  if (wasFullscreen && !document.fullscreenElement && state.page === 'session') dispatch('pause');
  wasFullscreen = !!document.fullscreenElement;
});

fetch(mapUrl).then(response => {
  if (!response.ok) throw new Error(`Study map returned ${response.status}`);
  return response.json();
}).then(map => {
  if (map.cells.length !== 32 || !map.cells.every(cell => cell.entries.length === 37)) throw new Error('Unexpected study structure');
  state.map = map;
  $('condition').replaceChildren(...map.ps_condition_ids.map(id => {
    const option = document.createElement('option'); option.value = id; option.textContent = id; return option;
  }));
  $('condition').value = 'PS09';
  $('condition').disabled = false;
  $('begin').disabled = false;
  $('play').disabled = false;
  $('startup-status').textContent = '';
  $('load-status').textContent = '32 versions available · 8 familiarizations and 6 tests in every sequence';
  renderResearcherControls();
}).catch(error => {
  $('load-status').textContent = `Could not load the study: ${error.message}. Serve this folder through the local preview server.`;
  $('startup-status').textContent = 'Please open this preview through the local preview server, not as a downloaded file.';
});

// No audible first-load attempt: the ordinary Begin action starts welcome.
$('start-study').disabled = false;
$('entry-status').textContent = '';
