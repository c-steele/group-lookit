// One parent instruction per page. These examples never measure a real baby.
// Counts are COMPLETED seconds. Each increment follows a full 1000 ms delay.
const frame = (afterMs, caption, visual) => ({ afterMs, caption, visual });
const scene = (movie, gaze, count = 0, cue = 'none', reset = false) =>
  ({ movie, gaze, count, cue, reset, showCount: true, animateCount: true });
export const ruleIntroPages = [
  {
    id: 'watch', title: 'Check the movie. Watch your baby.',
    copy: 'Glance at the screen to see when the picture becomes still. Then watch your baby’s eyes.',
    audio: 'rule-watch.mp3',
    transcript: 'Your part is to watch your baby.',
    next: 'Next: when to start counting →',
    frames: [
      frame(0, 'Check the screen: the movie is still moving.', { movie: 'moving', gaze: 'on', panel: 'watch', showCount: false }),
      frame(2200, 'The picture is still. Now watch your baby’s eyes.', { movie: 'still', gaze: 'on', panel: 'watch', showCount: false })
    ]
  },
  {
    id: 'finish', title: 'First, let the movie finish.',
    copy: 'Wait for the picture to become still.',
    audio: 'rule-finish.mp3',
    transcript: "First, let the movie finish. The space bar won't skip the action. After the action, the picture will stay still.",
    next: 'Next: the 3-second wait →',
    frames: [
      frame(0, 'Movie moving? Keep waiting.', { movie: 'moving', gaze: 'on', panel: 'finish', showCount: false }),
      frame(1800, 'Even if baby looks away, wait for the still picture.', { movie: 'moving', gaze: 'away', panel: 'finish', showCount: false }),
      frame(1800, 'Now the picture is still. Watch your baby.', { movie: 'still', gaze: 'on', panel: 'finish', showCount: false })
    ]
  },
  {
    id: 'count', title: 'If your baby looks away from the screen for 3 full seconds, press space.',
    copy: 'When the picture is still, count 3 full seconds with your baby looking away from the screen the whole time.',
    audio: 'rule-count.mp3',
    transcript: 'If your baby looks away, count slowly: one, two, three. If your baby is still looking away after three full seconds, press the space bar once.',
    next: 'Next: a look back before 3 seconds →',
    frames: [
      frame(0, 'Watch the example: she is looking at the screen.', scene('still', 'on')),
      frame(800, 'She looks away from the screen. Start counting.', scene('still', 'away', 0, 'count')),
      frame(1000, 'She has looked away for 1 full second. Keep waiting.', scene('still', 'away', 1, 'count')),
      frame(1000, 'She has looked away for 2 full seconds. Keep waiting.', scene('still', 'away', 2, 'count')),
      frame(1000, 'She has looked away from the screen for 3 full seconds without looking back. Press space once.', scene('still', 'away', 3, 'press'))
    ]
  },
  {
    id: 'reset', title: 'What if your baby looks back before 3 seconds?',
    copy: 'Stop counting. The next time your baby looks away from the screen, start a new 3-second count.',
    audio: 'rule-reset.mp3',
    transcript: "If your baby looks back before three seconds, stop counting. Start a new count the next time they look away. Short glances away don't end the trial.",
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
    audio: 'rule-break.mp3',
    transcript: 'Some movies move on by themselves. Need a break? Press the P key. Continuing restarts that movie from the beginning.',
    next: 'Try a few examples →',
    frames: [frame(0, 'Some movies move on by themselves.', { movie: 'still', gaze: 'on', panel: 'break', showCount: false })]
  }
];
