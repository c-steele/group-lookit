// A short, continuous window of the author's original video, not a new edit.
// Parent examples have no live gaze timer and do not measure a real child.
export function freshGuidedVideo(clip) {
  if (!Number.isFinite(clip?.start) || !Number.isFinite(clip?.end) || clip.start < 0 || clip.end <= clip.start) throw new Error('Invalid guided video range');
  return { start: clip.start, end: clip.end, phase: 'idle', lastTime: clip.start, lastWallMs: null, watched: 0, complete: false };
}
export function guidedVideoTransition(state, event) {
  const next = { ...state };
  const interrupt = () => ({ ...next, phase: 'interrupted', complete: false });
  if (event.type === 'begin') return { ...freshGuidedVideo(state), phase: 'seeking' };
  if (['hidden', 'error', 'seek', 'rate'].includes(event.type)) return interrupt();
  if (event.type === 'pause') return state.complete ? next : interrupt();
  if (event.type === 'ready') return state.phase === 'seeking' && Math.abs(event.time - state.start) <= .15
    ? { ...next, phase: 'ready', lastTime: event.time } : interrupt();
  if (event.type === 'playing') {
    if (state.phase !== 'ready' || Math.abs(event.time - state.start) > .2 || !Number.isFinite(event.wallMs)) return interrupt();
    return { ...next, phase: 'playing', lastTime: event.time, lastWallMs: event.wallMs };
  }
  if (event.type !== 'tick' || state.phase !== 'playing') return next;
  const elapsed = (event.wallMs - state.lastWallMs) / 1000;
  const delta = event.time - state.lastTime;
  if (event.hidden || event.seeking || event.rate !== 1 || !Number.isFinite(elapsed) || !Number.isFinite(delta) || elapsed < 0 || delta < -.05 || delta > elapsed + .25) return interrupt();
  next.lastTime = event.time;
  next.lastWallMs = event.wallMs;
  next.watched += Math.max(0, Math.min(event.time, state.end) - Math.max(state.lastTime, state.start));
  if (event.time >= state.end && next.watched >= state.end - state.start - .2) {
    next.phase = 'complete';
    next.complete = true;
  }
  return next;
}
