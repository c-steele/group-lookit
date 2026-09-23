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
  if(index>=practiceSequence.length) return {...state,phase:'missed',awaySince:null,feedback:'She looked back at the screen. Try again: press space after she has looked away from the still picture for 3 full seconds without looking back.'};
  const frame=practiceSequence[index];
  const eligible=frame.movie==='still' && frame.gaze==='away';
  return {...state,index,awaySince:eligible ? (state.awaySince ?? now) : null,feedback:''};
}
export function checkPracticePress(state, now) {
  if(state.phase!=='running') return state;
  const frame=practiceVisual(state);
  if(frame.movie!=='still') return {...state,feedback:'Not yet—let the movie finish first.'};
  if(frame.gaze!=='away') return {...state,feedback:'She is looking at the screen. Start a new count the next time she looks away.'};
  if(state.awaySince===null || now-state.awaySince<3000) return {...state,feedback:'Not yet. Count 3 full seconds while she looks away from the screen, without a look back.'};
  return {...state,phase:'success',awaySince:null,feedback:'Yes! You pressed after she had looked away from the screen for 3 full seconds without looking back.'};
}
export function pauseGuidedPractice(state) {
  if(state.phase!=='running') return state;
  return {...state,phase:'paused',awaySince:null,feedback:'Practice paused. Restart when you’re ready.'};
}
