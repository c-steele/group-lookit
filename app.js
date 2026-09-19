import { freshTrial, playbackTransition } from './playback-state.mjs';
import { ruleExamples, freshRuleCheck, answerRuleCheck, moveRuleCheck, ruleCheckComplete } from './rule-check.mjs';
import { ruleRoleTitle, ruleLessonSteps } from './rule-lesson.mjs';
import { renderRuleScene } from './rule-scene.mjs';
import { practiceSequence, freshGuidedPractice, practiceVisual, startGuidedPractice, advanceGuidedPractice, checkPracticePress, pauseGuidedPractice } from './timing-practice.mjs';

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
  example: '04-example-intro.mp3', practice: '05-practice-intro.mp3', ready: '06-baby-ready.mp3'
};
const narration = {
  auto: true, audio: $('parent-narration'), generation: 0,
  page: null, phase: 'idle', heard: new Set(), messages: new Map(), controls: new Map()
};
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

const ruleLesson = { mode: 'overview', frame: 0, ended: false, paused: false, timer: null, generation: 0 };

function stopRuleDemo() {
  clearTimeout(ruleLesson.timer);
  ruleLesson.timer = null;
  ruleLesson.generation += 1;
}

function renderRuleCheck() {
  const step = ruleLessonSteps[ruleCheck.index];
  const overview = ruleLesson.mode === 'overview';
  const teaching = ruleLesson.mode === 'teach';
  const answered = ruleCheck.answered[ruleCheck.index];
  const lastComplete = ruleLesson.mode === 'question' && ruleCheck.index === ruleLessonSteps.length - 1 && ruleCheckComplete(ruleCheck);
  const frame = step.frames[ruleLesson.frame];
  $('rule-position').hidden = overview;
  $('rule-position').textContent = `Example ${ruleCheck.index + 1} of ${ruleLessonSteps.length} · ${teaching ? 'See it' : 'Try it'}`;
  $('instructions-title').textContent = overview ? ruleRoleTitle : teaching ? step.title : step.questionTitle;
  $('rule-heading-copy').textContent = overview
    ? 'Start counting only when the picture is still. A look back resets the count.'
    : teaching ? step.copy : step.questionCopy;
  const visual = overview ? { movie: 'still', gaze: 'on', cue: 'none', showCount: false }
    : teaching ? frame.visual : step.questionScene;
  $('rule-visual').innerHTML = renderRuleScene(visual);
  $('rule-visual').dataset.moving = String(teaching && !ruleLesson.paused && !ruleLesson.ended && visual.movie === 'moving');
  $('rule-scene-caption').textContent = overview ? 'Watch your baby—not the movies.'
    : teaching ? (ruleLesson.paused ? 'Example paused. Replay it when you’re ready.' : frame.caption)
      : step.questionCaption;
  $('rule-example-note').hidden = overview;
  $('rule-review-tools').hidden = overview;
  $('rule-audio-area').hidden = !overview;
  $('rule-extra').hidden = !overview;
  $('rule-answer-group').hidden = ruleLesson.mode !== 'question' || answered;
  $('rule-question').textContent = step.questionCopy;
  ['rule-answer-a', 'rule-answer-b'].forEach((id, choice) => {
    const button = $(id);
    button.textContent = step.choices[choice];
    button.disabled = ruleLesson.mode !== 'question' || answered;
    button.className = 'rule-answer' + (ruleCheck.selected === choice ? ` ${answered ? 'correct' : 'retry'}` : '');
  });
  $('rule-feedback').hidden = ruleLesson.mode !== 'question' || !ruleCheck.feedback;
  $('rule-feedback').textContent = ruleCheck.feedback ? step[ruleCheck.feedback] : '';
  $('rule-feedback').className = `rule-feedback ${ruleCheck.feedback}`;
  $('rule-previous').disabled = false;
  $('rule-next').hidden = lastComplete;
  $('rule-next').disabled = teaching ? !ruleLesson.ended && !ruleLesson.paused : !overview && !answered;
  $('rule-next').textContent = overview ? 'Show me how →'
    : teaching ? (ruleLesson.paused ? 'Replay this example' : ruleLesson.ended ? 'Let me try →' : 'Watch the example…')
      : 'Next example →';
  $('instructions-next').hidden = !lastComplete;
  $('instructions-next').disabled = !lastComplete;
}

function showRuleOverview() {
  if (state.page !== 'instructions') return;
  stopRuleDemo();
  stopNarration();
  ruleLesson.mode = 'overview';
  ruleLesson.paused = false;
  renderRuleCheck();
  $('instructions-title').focus({ preventScroll: false });
  if (narration.auto) startNarration('instructions');
}

function startRuleTeaching() {
  if (state.page !== 'instructions' || document.hidden) return;
  stopNarration();
  stopRuleDemo();
  ruleLesson.mode = 'teach';
  ruleLesson.frame = 0;
  ruleLesson.ended = false;
  ruleLesson.paused = false;
  const token = ruleLesson.generation;
  const frames = ruleLessonSteps[ruleCheck.index].frames;
  const advanceFrame = index => {
    if (token !== ruleLesson.generation || state.page !== 'instructions' || ruleLesson.mode !== 'teach' || document.hidden) return;
    ruleLesson.frame = index;
    ruleLesson.ended = index === frames.length - 1;
    ruleLesson.timer = null;
    renderRuleCheck();
    if (!ruleLesson.ended) ruleLesson.timer = setTimeout(() => advanceFrame(index + 1), frames[index + 1].afterMs);
  };
  advanceFrame(0);
  $('instructions-title').focus({ preventScroll: false });
}

function advanceRuleLesson() {
  if (state.page !== 'instructions' || document.hidden) return;
  if (ruleLesson.mode === 'overview') { startRuleTeaching(); return; }
  if (ruleLesson.mode === 'teach') {
    if (ruleLesson.paused) { startRuleTeaching(); return; }
    if (!ruleLesson.ended) return;
    stopRuleDemo();
    ruleLesson.mode = 'question';
    renderRuleCheck();
    $('instructions-title').focus({ preventScroll: false });
    return;
  }
  if (!ruleCheck.answered[ruleCheck.index] || ruleCheck.index === ruleLessonSteps.length - 1) return;
  ruleCheck = moveRuleCheck(ruleCheck, 1);
  startRuleTeaching();
}

function backRuleLesson() {
  if (state.page !== 'instructions') return;
  if (ruleLesson.mode === 'overview') { showPage('setup'); return; }
  if (ruleLesson.mode === 'question') { startRuleTeaching(); return; }
  if (ruleCheck.index === 0) { showRuleOverview(); return; }
  stopRuleDemo();
  ruleCheck = moveRuleCheck(ruleCheck, -1);
  ruleLesson.mode = 'question';
  renderRuleCheck();
  $('instructions-title').focus({ preventScroll: false });
}

function chooseRuleAnswer(choice) {
  if (state.page !== 'instructions' || ruleLesson.mode !== 'question') return;
  stopNarration();
  ruleCheck = answerRuleCheck(ruleCheck, choice);
  renderRuleCheck();
  $(ruleCheck.feedback === 'retry' ? 'rule-answer-a' : 'rule-feedback').focus({ preventScroll: false });
}

function renderNarration() {
  narration.controls.forEach((controls, page) => {
    const active = narration.page === page && ['loading', 'playing'].includes(narration.phase);
    const replay = controls.querySelector('.narration-replay');
    replay.textContent = page === 'instructions' ? '↻ Replay the rule' : '↻ Replay audio';
    replay.hidden = !narration.heard.has(page);
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
    stopNarration(message + (narration.auto ? ' Automatic narration is still on for the next page.' : ' Automatic narration is off.'));
  };
  audio.onplaying = () => {
    if (!current()) { audio.pause(); return; }
    narration.phase = 'playing';
    narration.heard.add(page);
    narration.messages.set(page, 'Reading this page aloud.');
    renderNarration();
  };
  audio.onended = () => {
    if (!current()) return;
    stopNarration('Finished. You can replay the instructions at any time.');
  };
  audio.onerror = failure;
  audio.src = new URL(`./${narrationFiles[page]}`, location.href).href;
  renderNarration();
  audio.play().catch(failure);
}

Object.keys(narrationFiles).forEach(page => {
  const controls = $('narration-controls-template').content.firstElementChild.cloneNode(true);
  (page === 'instructions' ? $('rule-narration') : page === 'ready' ? $('ready-narration') : $(page).querySelector('.page-heading')).append(controls);
  narration.controls.set(page, controls);
  controls.querySelector('.narration-replay').onclick = () => {
    if (narration.heard.has(page)) startNarration(page);
  };
  controls.querySelector('.narration-stop').onclick = () => stopNarration('Stopped for this page. Uncheck “Read pages aloud” to keep later pages silent.');
  controls.querySelector('input').onchange = event => {
    narration.auto = event.target.checked;
    if (!narration.auto) {
      stopNarration();
      narration.messages.set(page, 'Automatic narration is off. Check “Read pages aloud” to turn it back on.');
      renderNarration();
    } else startNarration(page);
  };
});
renderNarration();

fetch('./narration-manifest.json').then(response => {
  if (!response.ok) throw new Error('Narration transcript is unavailable');
  return response.json();
}).then(manifest => {
  for (const clip of manifest.clips || []) {
    const controls = narration.controls.get(clip.page);
    if (!controls || typeof clip.text !== 'string' || !clip.text.trim()) continue;
    controls.querySelector('.narration-transcript p').textContent = clip.text;
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
  if (page === 'timing-practice') { timingPractice=freshGuidedPractice(); renderTimingPractice(); }
  if (page === 'instructions') { ruleLesson.mode = 'overview'; ruleLesson.paused = false; renderRuleCheck(); }
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
    hold: 'Picture is still. Use the 3-second look-away rule.', paused: 'Paused. Resume restarts this item.',
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
$('begin').onclick = () => { selectCell(); showPage('setup'); };
$('play').onclick = () => { selectCell(); showPage('session'); playEntry(0); };
document.querySelectorAll('[data-page]').forEach(button => { button.onclick = () => showPage(button.dataset.page); });
$('review-go').onclick = () => { $('preview-tools').open = false; showPage($('review-page').value); };
$('setup-next').onclick = () => showPage('instructions');
$('rule-answer-a').onclick = () => chooseRuleAnswer(0);
$('rule-answer-b').onclick = () => chooseRuleAnswer(1);
$('rule-previous').onclick = backRuleLesson;
$('rule-next').onclick = advanceRuleLesson;
$('rule-replay-demo').onclick = startRuleTeaching;
$('rule-review-overview').onclick = showRuleOverview;
$('rule-audio-stop').onclick = () => stopNarration('Stopped. You can replay the rule in Audio & written instructions.');
$('instructions-next').onclick = () => {
  if (state.page === 'instructions' && ruleLesson.mode === 'question' && ruleCheck.index === ruleLessonSteps.length - 1 && ruleCheckComplete(ruleCheck)) showPage('timing-practice');
};
$('timing-start').onclick=beginTimingPractice;
$('timing-next').onclick=() => { if(state.page==='timing-practice' && timingPractice.phase==='success') showPage('example'); };
renderTimingPractice();
renderRuleCheck();
$('sound-confirm').onchange = () => { $('setup-next').disabled = !$('sound-confirm').checked; };
$('sound-play').onclick = () => {
  const audio = freshParentMedia('sound-check');
  $('sound-play').disabled = true;
  $('sound-status').textContent = 'Playing…';
  const current = () => state.page === 'setup' && $('sound-check') === audio;
  const failure = () => {
    if (!current()) return;
    $('sound-play').disabled = false;
    $('sound-status').textContent = 'The sample couldn’t play. Check your sound and try again.';
  };
  audio.onended = () => {
    if (!current()) return;
    $('sound-play').disabled = false;
    $('sound-play').textContent = '↻ Play the sound again';
    $('sound-confirm').disabled = false;
    $('sound-status').textContent = 'Could you hear all three chimes?';
  };
  audio.onerror = failure;
  audio.play().catch(failure);
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
    $('practice-status').textContent = 'Watch the child. Press space after 3 full seconds looking away. A look back resets your count.';
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
  if (state.page === 'instructions' && ruleLesson.mode === 'teach' && !ruleLesson.ended) {
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
    if (state.page === 'setup') $('sound-status').textContent = '';
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
