/**
 * A parent-only illustration, never a webcam view or a gaze measurement.
 * The caller supplies the visible, accessible explanation of every state.
 * `count` is the number of completed full seconds, not the second in progress.
 */
export function renderRuleScene({
  movie = 'moving',
  gaze = 'on',
  count = 0,
  reset = false,
  cue = 'wait',
  showCount,
} = {}) {
  const isStill = movie === 'still';
  const isAway = gaze === 'away';
  const isReset = reset || cue === 'reset';
  const elapsed = isStill && isAway && !isReset
    ? Math.min(3, Math.max(0, Math.floor(Number(count) || 0)))
    : 0;
  const isPress = cue === 'press' && elapsed === 3;
  const showSecondMarks = showCount ?? (isStill || isReset);

  // Caregiver viewpoint: the baby faces the computer, with the adult behind.
  // Two matched panels change only the illustrated head direction. The original
  // Raz rear-view practice video remains a separate, unchanged later step.
  const babyViewBox = isAway ? '768 0 768 768' : '0 0 768 768';

  const secondMarks = [1, 2, 3].map((second, index) => {
    const x = 368 + index * 49;
    const done = second <= elapsed;
    return `<g class="rule-scene-second${done ? ' is-complete' : ''}">
      <circle cx="${x}" cy="222" r="18" fill="${done ? '#3f755f' : '#ffffff'}" stroke="${done ? '#3f755f' : '#c4d8ce'}" stroke-width="2"/>
      ${done
        ? `<text x="${x}" y="228" text-anchor="middle" fill="#ffffff" font-size="19" font-weight="750">${second}</text>`
        : `<circle cx="${x}" cy="222" r="2.4" fill="#b9cec2"/>`}
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" class="rule-lesson-scene" viewBox="0 0 600 284" aria-hidden="true" focusable="false" fill="none">
    <g font-family="Avenir Next, Avenir, ui-sans-serif, system-ui, sans-serif" stroke-linecap="round" stroke-linejoin="round">
      <g class="rule-scene-baby" data-gaze="${isAway ? 'away' : 'on'}">
        <svg x="16" y="10" width="264" height="264" viewBox="${babyViewBox}" preserveAspectRatio="xMidYMid slice" overflow="hidden">
          <image href="./parent-view-practice.png" x="0" y="0" width="1536" height="1024"/>
        </svg>
      </g>
      <g class="rule-scene-laptop">
        <path d="M 110 83 H 185" stroke="#acc7d1" stroke-width="2"/>
        <g class="${isStill ? 'rule-scene-frozen' : 'rule-scene-motion'}">
          <circle cx="148" cy="72" r="10" fill="#d89038" stroke="#775622" stroke-width="2"/>
          <circle cx="145" cy="69" r="2.5" fill="#ffdf9e"/>
        </g>
      </g>
      <text x="425" y="38" text-anchor="middle" fill="#355b4c" font-size="19" font-weight="700">Your view from behind</text>
      <text x="425" y="64" text-anchor="middle" fill="#566e65" font-size="16">Watch your baby.</text>
      <rect x="322" y="84" width="206" height="38" rx="10" fill="#ffffff" stroke="#d7e5de"/>
      <text x="425" y="109" text-anchor="middle" fill="#3d6063" font-size="17" font-weight="650">${isStill ? '❚❚ Picture frozen' : '▶ Movie playing'}</text>
      <g class="rule-scene-space${isPress ? ' is-ready' : ''}">
        <rect x="366" y="150" width="119" height="39" rx="9" fill="${isPress ? '#2c5846' : '#d3e0d9'}"/>
        <rect x="366" y="145" width="119" height="39" rx="9" fill="${isPress ? '#3f755f' : '#ffffff'}" stroke="${isPress ? '#3f755f' : '#a8c1b3'}" stroke-width="2"/>
        <text x="425.5" y="171" text-anchor="middle" fill="${isPress ? '#ffffff' : '#456555'}" font-size="17" font-weight="750" letter-spacing="1">SPACE</text>
        ${isPress ? '<path d="M 350 156 L 343 152 M 351 171 H 342 M 500 156 L 507 152 M 500 171 H 509" stroke="#609579" stroke-width="3"/>' : ''}
      </g>

      ${showSecondMarks ? `<g class="rule-scene-seconds">
        ${secondMarks}
        <text x="417" y="261" text-anchor="middle" fill="#587167" font-size="13" font-weight="600">full seconds looking away</text>
        ${isReset ? '<path d="M 516 228 A 13 13 0 1 0 515 213 M 515 205 V 214 H 507" stroke="#b28667" stroke-width="2.5"/>' : ''}
      </g>` : ''}
    </g>
  </svg>`;
}
