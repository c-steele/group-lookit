// Known scripted illustration only. This does not observe or score a real baby.
export const practiceSequence = [
  {durationMs:1000,movie:'moving',gaze:'on'},
  {durationMs:3000,movie:'moving',gaze:'away'},
  {durationMs:1000,movie:'still',gaze:'on'},
  {durationMs:2000,movie:'still',gaze:'away'},
  {durationMs:1000,movie:'still',gaze:'on'},
  {durationMs:5000,movie:'still',gaze:'away'},
  {durationMs:1000,movie:'still',gaze:'on'},
  {durationMs:5000,movie:'still',gaze:'away'}
];
export const freshGuidedPractice = () => ({phase:'idle',index:0,awaySince:null,feedback:''});
export const practiceVisual = state => state.phase === 'running'
  ? practiceSequence[state.index] : {movie:'still',gaze:'on'};
export function startGuidedPractice() { return {...freshGuidedPractice(),phase:'running'}; }
export function advanceGuidedPractice(state, now) {
  if(state.phase !== 'running') return state;
  const index=state.index+1;
  if(index>=practiceSequence.length) return {...state,phase:'missed',awaySince:null,feedback:'She looked back. Try again: press space after 3 full seconds away, while she is still looking away.'};
  const frame=practiceSequence[index];
  const eligible=frame.movie==='still' && frame.gaze==='away';
  return {...state,index,awaySince:eligible ? (state.awaySince ?? now) : null,feedback:''};
}
export function checkPracticePress(state, now) {
  if(state.phase!=='running') return state;
  const frame=practiceVisual(state);
  if(frame.movie!=='still') return {...state,feedback:'Not yet—let the movie finish first.'};
  if(frame.gaze!=='away') return {...state,feedback:'She is looking at the screen. Wait for a new look away.'};
  if(state.awaySince===null || now-state.awaySince<3000) return {...state,feedback:'Not yet—wait for 3 full seconds away. Keep watching her.'};
  return {...state,phase:'success',awaySince:null,feedback:'Yes! You pressed after 3 full seconds while she was still looking away.'};
}
export function pauseGuidedPractice(state) {
  if(state.phase!=='running') return state;
  return {...state,phase:'paused',awaySince:null,feedback:'Practice paused. Restart when you’re ready.'};
}
