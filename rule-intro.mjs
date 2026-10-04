// One parent instruction per page. These examples never measure a real baby.
// Counts are COMPLETED seconds. Each increment follows a full 1000 ms delay.
const frame = (afterMs, caption, visual) => ({ afterMs, caption, visual });
const scene = (movie, gaze, count = 0, cue = 'none', reset = false) =>
  ({ movie, gaze, count, cue, reset, showCount: true, animateCount: true });
export const ruleIntroPages = [
  {
    id: 'finish', title: 'First, let the movie finish.',
    copy: 'Glance at the screen to check when the picture becomes still. Then watch your baby’s eyes.',
    audio: 'rule-finish.mp3',
    transcript: "First, let the movie finish. The space bar won't skip the action. After the action, the picture will stay still.",
    next: 'Next: when to press Space →',
    frames: [
      frame(0, 'The movie is moving. Wait—even if baby looks away.', { movie: 'moving', gaze: 'on', panel: 'finish', showCount: false }),
      frame(2000, 'Baby looks away, but the movie is still moving. Keep waiting.', { movie: 'moving', gaze: 'away', showCount: false }),
      frame(1500, 'The picture is still. Now watch baby’s eyes.', scene('still', 'on', 0, 'none'))
    ]
  },
  {
    id: 'count', title: 'When the picture is still: if your baby looks away from the screen for 3 full seconds, press space.',
    copy: 'Your baby must keep looking away for all 3 seconds, without looking back. Press space once.',
    audio: 'still-picture-rule.mp3',
    transcript: "When the movie finishes, the picture will stay still. Now watch your baby's eyes. If your baby looks away from the screen for three full seconds without looking back, press the space bar once.",
    next: 'See a parent do this →',
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
    id: 'count-real', title: 'Watch a parent wait, then end the trial.',
    copy: 'This is an example of what you’ll do with your own baby. Watch the baby’s eyes and the parent’s hand.',
    audio: 'gal-count-intro.mp3',
    transcript: 'This video shows what you will do during the study. Watch how this parent waits until their baby has looked away from the screen for three full seconds before pressing space.',
    next: 'Next: what if baby looks back? →',
    clip: { start: 19.5, end: 26, source: 'https://osf.io/download/v4npq/' },
    caption: 'The parent waits through a sustained look away before ending the trial.',
    frames: []
  },
  {
    id: 'reset', title: 'What if your baby looks back before 3 seconds?',
    copy: 'Stop counting. The next time your baby looks away from the screen, start a new 3-second count.',
    audio: 'look-back-reset.mp3',
    transcript: 'What if your baby looks back before three seconds? Stop counting. The next time your baby looks away from the screen, start a new three-second count.',
    next: 'See a quick look back →',
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
    id: 'reset-real', title: 'A quick look back? Keep waiting.',
    copy: 'Watch this baby look away, then back. The parent does not end the trial.',
    audio: 'gal-reset-intro.mp3',
    transcript: 'A quick look back resets the count.',
    next: 'Next: taking a break →',
    clip: { start: 6, end: 10, source: 'https://osf.io/download/v4npq/' },
    caption: 'Baby looks back before 3 full seconds. Start a new count at the next look away.',
    frames: []
  },
  {
    id: 'break', title: 'Need a break? Press P to pause.',
    copy: 'Continuing restarts that movie from the beginning.',
    audio: 'pause-break.mp3',
    transcript: 'Need a break? Press P to pause. When you continue, that movie starts again from the beginning. Some movies move on by themselves.',
    next: 'Now try it yourself →',
    frames: [frame(0, 'Some movies move on by themselves.', { movie: 'still', gaze: 'on', panel: 'break', showCount: false })]
  }
];
