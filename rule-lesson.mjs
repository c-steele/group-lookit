// Parent-only demonstrations. Delays run after the preceding frame is rendered,
// so a busy browser can lengthen, but never compress, a full-second example.
export const ruleRoleTitle = 'If your baby looks away from the screen for 3 full seconds, press space.';
const scene = (movie, gaze, count = 0, cue = 'none', showCount = false, reset = false) => ({ movie, gaze, count, cue, showCount, reset });
const frame = (afterMs, caption, visual) => ({ afterMs, caption, visual });
export const ruleLessonSteps = [
  {
    title: 'First, let the movie finish.', copy: 'Wait—even if your baby looks away from the screen.',
    frames: [
      frame(0, 'The movie is moving. Keep waiting.', scene('moving', 'on')),
      frame(1000, 'Baby looks away from the screen, but not yet for 3 full seconds. The movie is still moving—wait.', scene('moving', 'away')),
      frame(2400, 'The picture is still. Baby is looking away from the screen—start counting.', scene('still', 'away')),
      frame(1000, 'Baby looks back at the screen. Stop counting until the next look away.', scene('still', 'on'))
    ],
    questionTitle: 'The movie is still moving.', questionCopy: 'Your baby looks away from the screen, but has not yet looked away for 3 full seconds. What do you do?',
    questionFrames: [
      frame(0, 'The movie is moving. Baby is watching.', scene('moving', 'on')),
      frame(1200, 'Baby looks away from the screen. The movie is still moving. Baby has not yet looked away for 3 full seconds.', scene('moving', 'away'))
    ],
    questionScene: scene('moving', 'away'), questionCaption: 'The movie is still moving. Baby has not yet looked away from the screen for 3 full seconds.',
    choices: ['Keep waiting', 'Press space'],
    success: 'Yes. Wait for the picture to become still. Then count 3 full seconds looking away from the screen, without a look back, before pressing space.',
    retry: 'Not yet. First wait for the picture to become still. Then count 3 full seconds looking away from the screen, without a look back.'
  },
  {
    title: 'What if your baby is still watching the screen?', copy: 'Keep waiting. Start counting when your baby looks away from the still picture.',
    frames: [frame(0, 'Baby is watching. Don’t start counting yet.', scene('still', 'on'))],
    questionTitle: 'Your baby is still watching the screen.', questionCopy: 'The picture is still. What do you do?',
    questionFrames: [
      frame(0, 'The movie is moving. Baby is watching.', scene('moving', 'on')),
      frame(1800, 'The picture stops. Baby is still watching.', scene('still', 'on'))
    ],
    questionScene: scene('still', 'on'), questionCaption: 'The picture is still. Baby is looking at the screen.',
    choices: ['Start counting', 'Keep watching your baby'],
    success: 'Yes. Once your baby looks away from the screen, count 3 full seconds without a look back before pressing space.',
    retry: 'Keep waiting. Don’t count while your baby is looking at the screen.'
  },
  {
    title: 'What if your baby looks back before 3 seconds?', copy: 'Stop counting. Start a new count the next time your baby looks away from the screen.',
    frames: [
      frame(0, 'The picture is still. Baby is watching.', scene('still', 'on', 0, 'none', true)),
      frame(600, 'Baby looks away from the screen. Start counting.', scene('still', 'away', 0, 'count', true)),
      frame(1000, 'Baby has looked away from the screen for 1 full second. Keep counting.', scene('still', 'away', 1, 'count', true)),
      frame(1000, 'Baby has looked away from the screen for 2 full seconds. Keep counting.', scene('still', 'away', 2, 'count', true)),
      frame(400, 'Baby looks back at the screen. Stop counting; start a new count at the next look away.', scene('still', 'on', 0, 'reset', true, true))
    ],
    questionTitle: 'Your baby looks back at the screen before 3 seconds.', questionCopy: 'This look away lasted 2 seconds. What happens to your count?',
    questionFrames: [
      frame(0, 'The picture is still. Baby is watching.', scene('still', 'on', 0, 'none', true)),
      frame(600, 'Baby looks away from the screen.', scene('still', 'away', 0, 'none', true)),
      frame(1000, 'Baby has looked away from the screen for 1 full second.', scene('still', 'away', 1, 'none', true)),
      frame(1000, 'Baby has looked away from the screen for 2 full seconds.', scene('still', 'away', 2, 'none', true)),
      frame(400, 'Baby looks back at the screen.', scene('still', 'on', 0, 'none', true))
    ],
    questionScene: scene('still', 'on', 0, 'none', true), questionCaption: 'The picture is still. Baby has looked back at the screen.',
    choices: ['Start over next time', 'Continue from 2 next time'],
    success: 'Yes. Stop counting when your baby looks back. Start a new 3-second count the next time they look away from the screen.',
    retry: 'Stop counting when your baby looks back. Don’t add short looks away together; start a new count at the next look away from the screen.'
  },
  {
    title: 'If your baby looks away from the screen for 3 full seconds, press space.', copy: 'Wait for the picture to become still. Count 3 seconds without a look back.',
    frames: [
      frame(0, 'The picture is still. Baby is watching.', scene('still', 'on', 0, 'none', true)),
      frame(600, 'Baby looks away from the screen. Start counting.', scene('still', 'away', 0, 'count', true)),
      frame(1000, 'Baby has looked away from the screen for 1 full second. Keep counting.', scene('still', 'away', 1, 'count', true)),
      frame(1000, 'Baby has looked away from the screen for 2 full seconds. Keep counting.', scene('still', 'away', 2, 'count', true)),
      frame(1000, 'Baby has looked away from the screen for 3 full seconds without looking back. Press space once.', scene('still', 'away', 3, 'press', true)),
      frame(2000, 'Baby looks back at the screen. Stop counting until the next look away.', scene('still', 'on', 0, 'reset', true, true))
    ],
    questionTitle: 'Your baby has looked away from the screen for 3 full seconds.', questionCopy: 'The picture is still. Your baby has not looked back and is still looking away. What do you do?',
    questionFrames: [
      frame(0, 'The picture is still. Baby is watching.', scene('still', 'on', 0, 'none', true)),
      frame(600, 'Baby looks away from the screen.', scene('still', 'away', 0, 'none', true)),
      frame(1000, 'Baby has looked away from the screen for 1 full second.', scene('still', 'away', 1, 'none', true)),
      frame(1000, 'Baby has looked away from the screen for 2 full seconds.', scene('still', 'away', 2, 'none', true)),
      frame(1000, 'Baby has looked away from the screen for 3 full seconds without looking back.', scene('still', 'away', 3, 'none', true))
    ],
    questionScene: scene('still', 'away', 3, 'none', true), questionCaption: 'Baby has looked away from the still picture for 3 full seconds without looking back.',
    choices: ['Wait for a look back', 'Press space once'],
    success: 'Yes. Your baby has looked away from the screen for 3 full seconds without looking back. Press space once while they are still looking away.',
    retry: 'Press space once now: the picture is still, and your baby has looked away from the screen for 3 full seconds without looking back.'
  }
];
