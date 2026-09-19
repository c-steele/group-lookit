// Local rehearsal mechanics only. This is not the CHS Frameplayer runtime.
export function freshTrial(controlled) {
  return { phase: 'loading', controlled, startedAt: null, ceilingReached: false };
}

export function playbackTransition(state, event, now = 0) {
  const next = { ...state };
  if (event === 'error') { next.phase = 'error'; return { state: next }; }
  if (event === 'pause' && ['loading', 'playing', 'hold'].includes(state.phase)) {
    next.phase = 'paused'; return { state: next };
  }
  if (event === 'playing' && state.phase === 'loading') {
    next.phase = 'playing'; next.startedAt = now; return { state: next };
  }
  if (event === 'ended' && state.phase === 'playing') {
    const advance = !state.controlled || state.ceilingReached;
    next.phase = advance ? 'finished' : 'hold';
    return { state: next, advance };
  }
  if (event === 'space' && state.phase === 'hold') {
    next.phase = 'finished'; return { state: next, advance: true };
  }
  if (event === 'ceiling' && state.controlled && ['playing', 'hold'].includes(state.phase)) {
    next.ceilingReached = true;
    if (state.phase === 'hold') { next.phase = 'finished'; return { state: next, advance: true }; }
    return { state: next, advance: false };
  }
  return { state: next, advance: false };
}
