// Teaching examples only: no gaze detection, timing score, persistence or study events.
export const ruleExamples = [
  {
    title: 'The action is still happening.',
    detail: 'Your baby looks away while the movie is moving.',
    movie: 'Movie is moving', baby: 'Baby looks away', movieIcon: '#i-play', babyIcon: '#i-eye',
    beats: ['Action playing', 'Wait for the still picture'],
    question: 'What should you do?',
    choices: ['Wait for the action to finish', 'Press space now'], correct: 0,
    success: 'Exactly. Let the action finish first. Only start a look-away count once the picture is still.',
    retry: 'Not yet. Let the action finish—even if your baby looks away. Start a fresh count after the picture becomes still.'
  },
  {
    title: 'The picture is still. Your baby keeps watching.',
    detail: 'The action has finished, but your baby is still looking at the screen.',
    movie: 'Picture is still', baby: 'Baby is looking', movieIcon: '#i-monitor', babyIcon: '#i-eye',
    beats: ['Still watching', 'No count yet'],
    question: 'What should you do?',
    choices: ['Count to 3 and press space', 'Keep waiting without counting'], correct: 1,
    success: 'Yes. A still picture is not a cue to press space. Count only while your baby is looking away.',
    retry: 'Keep waiting. Do not count while your baby is looking at the screen.'
  },
  {
    title: 'A quick look away… then a look back.',
    detail: 'The picture is still. Your baby looks away for two seconds, then looks back.',
    movie: 'Picture is still', baby: 'Baby looks back', movieIcon: '#i-monitor', babyIcon: '#i-eye',
    beats: ['1 second away', '2 seconds away', 'Looks back → reset'],
    question: 'What happens to your count?',
    choices: ['Start a fresh count next time', 'Keep counting from two next time'], correct: 0,
    success: 'That’s it. A look back resets the count. Wait for a new look away, then count 3 full seconds from the beginning.',
    retry: 'Do not add short looks together. A look back resets your count; start fresh the next time your baby looks away.'
  },
  {
    title: '3 full seconds away. No look back.',
    detail: 'The picture is still. Your baby has looked away for 3 seconds in a row and is still looking away.',
    movie: 'Picture is still', baby: 'Baby is still looking away', movieIcon: '#i-monitor', babyIcon: '#i-eye',
    beats: ['1 full second', '2 full seconds', '3 full seconds'],
    question: 'What should you do now?',
    choices: ['Wait for your baby to look back', 'Press the space bar once'], correct: 1,
    success: 'Exactly—press space once. You watch your baby and count; the study does not detect their gaze for you.',
    retry: 'This is when you press space once: the picture is still, and your baby has looked away for 3 full, continuous seconds.'
  }
];

export const freshRuleCheck = () => ({ index: 0, answered: ruleExamples.map(() => false), selected: null, feedback: '' });
export const ruleCheckComplete = state => state.answered.length === ruleExamples.length && state.answered.every(Boolean);

export function answerRuleCheck(state, choice) {
  if (state.answered[state.index] || ![0, 1].includes(choice)) return state;
  const correct = choice === ruleExamples[state.index].correct;
  return {
    ...state, selected: choice, feedback: correct ? 'success' : 'retry',
    answered: state.answered.map((value, index) => index === state.index ? correct : value)
  };
}

export function moveRuleCheck(state, direction) {
  if (![1, -1].includes(direction) || (direction === 1 && !state.answered[state.index])) return state;
  const index = Math.max(0, Math.min(ruleExamples.length - 1, state.index + direction));
  return {
    ...state, index, selected: state.answered[index] ? ruleExamples[index].correct : null,
    feedback: state.answered[index] ? 'success' : ''
  };
}
