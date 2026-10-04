// One parent instruction per page. These examples never measure a real baby.
// Counts are COMPLETED seconds. Each increment follows a full 1000 ms delay.
const frame = (afterMs, caption, visual) => ({ afterMs, caption, visual });
const scene = (movie, gaze, count = 0, cue = 'none', reset = false) =>
  ({ movie, gaze, count, cue, reset, showCount: true, animateCount: true });
export const ruleIntroPages = [
  {
    id: 'count', title: 'When the picture is still: if your baby looks away from the screen for 3 full seconds, press space.',
    copy: 'Your baby must keep looking away for all 3 seconds, without looking back. Press space once.',
    audio: 'still-picture-rule.mp3',
    transcript: "When the movie finishes, the picture will stay still. Now watch your baby's eyes. If your baby looks away from the screen for three full seconds without looking back, press the space bar once.",
    next: 'Next: a look back before 3 seconds →',
    frames: [
      frame(0, 'First, let the movie finish.', { movie: 'moving', gaze: 'on', panel: 'finish', showCount: false }),
      frame(1500, 'The picture is still. Now watch your baby’s eyes.', scene('still', 'on')),
      frame(800, 'She looks away from the screen. Start counting.', scene('still', 'away', 0, 'count')),
      frame(1000, 'She has looked away for 1 full second. Keep waiting.', scene('still', 'away', 1, 'count')),
      frame(1000, 'She has looked away for 2 full seconds. Keep waiting.', scene('still', 'away', 2, 'count')),
      frame(1000, 'She has looked away from the screen for 3 full seconds without looking back. Press space once.', scene('still', 'away', 3, 'press'))
    ]
  },
  {
    id: 'reset', title: 'What if your baby looks back before 3 seconds?',
    copy: 'Stop counting. The next time your baby looks away from the screen, start a new 3-second count.',
    audio: 'look-back-reset.mp3',
    transcript: 'What if your baby looks back before three seconds? Stop counting. The next time your baby looks away from the screen, start a new three-second count.',
    next: 'Next: taking a break →',
    frames: [
      frame(0, 'Watch: the picture stays still.', scene('still', 'on')),
      frame(600, 'She looks away from the screen. Start counting.', scene('still', 'away', 0, 'count')),
      frame(1000, 'She has looked away for 1 full second.', scene('still', 'away', 1, 'count')),
      frame(1000, 'She has looked away for 2 full seconds.', scene('still', 'away', 2, 'count')),
      frame(300, 'She looks back before 3 seconds. Stop counting; don’t press space.', scene('still', 'on', 0, 'reset', true)),
      frame(1600, 'She looks away from the screen again. Start a new count.', scene('still', 'away', 0, 'count')),
      frame(1000, 'She has looked away for 1 full second. Keep waiting.', scene('still', 'away', 1, 'count')),
      frame(1000, 'She has looked away for 2 full seconds. Keep waiting.', scene('still', 'away', 2, 'count')),
      frame(1000, 'She has looked away from the screen for 3 full seconds without looking back. Press space once.', scene('still', 'away', 3, 'press'))
    ]
  },
  {
    id: 'break', title: 'Need a break? Press P to pause.',
    copy: 'Continuing restarts that movie from the beginning.',
    audio: 'pause-break.mp3',
    transcript: 'Need a break? Press P to pause. When you continue, that movie starts again from the beginning. Some movies move on by themselves.',
    next: 'Watch a parent do this →',
    frames: [frame(0, 'Some movies move on by themselves.', { movie: 'still', gaze: 'on', panel: 'break', showCount: false })]
  }
];
