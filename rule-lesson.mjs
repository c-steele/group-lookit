// Parent-only demonstrations. Delays run after the preceding frame is rendered,
// so a busy browser can lengthen, but never compress, a full-second example.
export const ruleRoleTitle = 'Press space after your baby has looked away for 3 full seconds.';
const scene = (movie, gaze, count = 0, cue = 'none', showCount = false, reset = false) => ({ movie, gaze, count, cue, showCount, reset });
const frame = (afterMs, caption, visual) => ({ afterMs, caption, visual });
export const ruleLessonSteps = [
  {
    title: 'First, let the movie finish.', copy: 'Wait—even if your baby looks away.',
    frames: [
      frame(0, 'The movie is moving. Keep waiting.', scene('moving', 'on')),
      frame(1000, 'Baby looks away. The movie is still moving—wait.', scene('moving', 'away')),
      frame(2400, 'Picture still: start counting—not pressing.', scene('still', 'away')),
      frame(1000, 'She looks back. Wait for her next look away.', scene('still', 'on'))
    ],
    questionTitle: 'The movie is still moving.', questionCopy: 'Your baby turns away. What do you do?',
    questionFrames: [
      frame(0, 'The movie is moving. Baby is watching.', scene('moving', 'on')),
      frame(1200, 'Baby turns away. The movie is still moving.', scene('moving', 'away'))
    ],
    questionScene: scene('moving', 'away'), questionCaption: 'Movie moving · Baby looking away',
    choices: ['Keep waiting', 'Press space'],
    success: 'Yes. Wait for a still picture, then count 3 full seconds away before pressing.',
    retry: 'Not yet. A look away alone is not enough: first a still picture, then 3 full seconds away.'
  },
  {
    title: 'Still watching? Keep waiting.', copy: 'A still picture does not mean it’s time to press space.',
    frames: [frame(0, 'Baby is watching. Don’t start counting yet.', scene('still', 'on'))],
    questionTitle: 'Your baby is still watching.', questionCopy: 'The picture is still. What do you do?',
    questionFrames: [
      frame(0, 'The movie is moving. Baby is watching.', scene('moving', 'on')),
      frame(1800, 'The picture stops. Baby is still watching.', scene('still', 'on'))
    ],
    questionScene: scene('still', 'on'), questionCaption: 'Still picture · Baby watching',
    choices: ['Start counting', 'Keep watching your baby'],
    success: 'Yes. Once baby looks away, wait 3 full seconds without a look back before pressing.',
    retry: 'Keep waiting. Don’t count while your baby is watching.'
  },
  {
    title: 'A look back? Start over.', copy: 'Short looks away do not add together.',
    frames: [
      frame(0, 'The picture is still. Baby is watching.', scene('still', 'on', 0, 'none', true)),
      frame(600, 'She looks away. Count—don’t press yet.', scene('still', 'away', 0, 'count', true)),
      frame(1000, '1 full second away—keep waiting.', scene('still', 'away', 1, 'count', true)),
      frame(1000, '2 full seconds away—not yet.', scene('still', 'away', 2, 'count', true)),
      frame(400, 'Baby looks back. Clear the count; start fresh at the next look away.', scene('still', 'on', 0, 'reset', true, true))
    ],
    questionTitle: 'Your baby looks back after 2 seconds.', questionCopy: 'What happens to your count?',
    questionFrames: [
      frame(0, 'The picture is still. Baby is watching.', scene('still', 'on', 0, 'none', true)),
      frame(600, 'Baby turns away.', scene('still', 'away', 0, 'none', true)),
      frame(1000, '1 full second away.', scene('still', 'away', 1, 'none', true)),
      frame(1000, '2 full seconds away.', scene('still', 'away', 2, 'none', true)),
      frame(400, 'Baby looks back.', scene('still', 'on', 0, 'none', true))
    ],
    questionScene: scene('still', 'on', 0, 'none', true), questionCaption: 'Still picture · Baby looking back',
    choices: ['Start over next time', 'Continue from 2 next time'],
    success: 'Yes. Wait for a new look away, then count 3 full seconds from the beginning.',
    retry: '2 seconds is not enough. A look back resets the count; start a fresh 3-second count next time.'
  },
  {
    title: 'Watch the full 3-second wait.', copy: 'Don’t press as soon as your baby looks away.',
    frames: [
      frame(0, 'The picture is still. Baby is watching.', scene('still', 'on', 0, 'none', true)),
      frame(600, 'She looks away. Count—don’t press yet.', scene('still', 'away', 0, 'count', true)),
      frame(1000, '1 full second away—keep waiting.', scene('still', 'away', 1, 'count', true)),
      frame(1000, '2 full seconds away—not yet.', scene('still', 'away', 2, 'count', true)),
      frame(1000, '3 full seconds, with no look back. Press space once.', scene('still', 'away', 3, 'press', true)),
      frame(2000, 'She looks back. Stop counting and wait for a new look away.', scene('still', 'on', 0, 'reset', true, true))
    ],
    questionTitle: '3 full seconds away. No look back.', questionCopy: 'The picture is still, and baby is still looking away. What do you do?',
    questionFrames: [
      frame(0, 'The picture is still. Baby is watching.', scene('still', 'on', 0, 'none', true)),
      frame(600, 'Baby turns away.', scene('still', 'away', 0, 'none', true)),
      frame(1000, '1 full second away.', scene('still', 'away', 1, 'none', true)),
      frame(1000, '2 full seconds away.', scene('still', 'away', 2, 'none', true)),
      frame(1000, '3 full seconds away. No look back.', scene('still', 'away', 3, 'none', true))
    ],
    questionScene: scene('still', 'away', 3, 'none', true), questionCaption: 'Still picture · 3 full seconds away',
    choices: ['Wait for a look back', 'Press space once'],
    success: 'Yes—after 3 full seconds away, with no look back. Press once while baby is still looking away.',
    retry: 'This is the moment to press space: 3 full seconds away, with no look back.'
  }
];
