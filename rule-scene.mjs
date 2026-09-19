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

  // The two open-eyed states share a seated body and stationary highchair.
  // Select a tightly cropped sprite panel; never mirror the whole baby/chair.
  // The generated halves have different side margins, so align their chair centers.
  const babyViewBox = isAway ? '813 20 630 970' : '100 20 630 970';
  const gazeLine = isAway
    ? '<path d="M 486 64 H 550 M 543 58 L 551 64 L 543 70"/>'
    : '<path d="M 389 64 H 252 M 259 58 L 251 64 L 259 70"/>';

  const secondMarks = [1, 2, 3].map((second, index) => {
    const x = 384 + index * 49;
    const done = second <= elapsed;
    return `<g class="rule-scene-second${done ? ' is-complete' : ''}">
      <circle cx="${x}" cy="214" r="18" fill="${done ? '#3f755f' : '#ffffff'}" stroke="${done ? '#3f755f' : '#c4d8ce'}" stroke-width="2"/>
      ${done
        ? `<text x="${x}" y="220" text-anchor="middle" fill="#ffffff" font-size="19" font-weight="750">${second}</text>`
        : `<circle cx="${x}" cy="214" r="2.4" fill="#b9cec2"/>`}
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" class="rule-lesson-scene" viewBox="0 0 600 260" aria-hidden="true" focusable="false" fill="none">
    <g font-family="Avenir Next, Avenir, ui-sans-serif, system-ui, sans-serif" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="144" cy="168" rx="106" ry="9" fill="#e2ece7"/>

      <g class="rule-scene-laptop">
        <rect x="55" y="43" width="179" height="118" rx="11" fill="#526d79"/>
        <rect x="64" y="53" width="161" height="98" rx="5" fill="#eef6f8"/>
        <path d="M 55 160 H 234 L 250 172 H 39 Z" fill="#a4bac2"/>
        <path d="M 123 162 H 166 L 172 167 H 118 Z" fill="#e0ebed"/>
        <g class="${isStill ? 'rule-scene-frozen' : 'rule-scene-motion'}" stroke="#78a592" stroke-width="7">
          <path d="M 96 105 C 111 83 130 83 145 105 S 178 127 193 105"/>
        </g>
        <g fill="#557e8d">
          ${isStill
            ? '<rect x="77" y="65" width="4" height="12" rx="1"/><rect x="85" y="65" width="4" height="12" rx="1"/>'
            : '<path d="M 78 64 L 89 71 L 78 78 Z"/>'}
        </g>
      </g>

      <g class="rule-scene-gaze" stroke="${isAway ? '#b28667' : '#719c8b'}" stroke-width="2.5" stroke-dasharray="5 6">
        ${gazeLine}
      </g>

      <g class="rule-scene-baby" data-gaze="${isAway ? 'away' : 'on'}">
        <svg x="372" y="10" width="117" height="180" viewBox="${babyViewBox}" preserveAspectRatio="xMidYMid slice" overflow="hidden">
          <image href="./practice-baby-seated.png" x="0" y="0" width="1536" height="1024"/>
        </svg>
      </g>

      <g class="rule-scene-space${isPress ? ' is-ready' : ''}">
        <rect x="85" y="196" width="119" height="39" rx="9" fill="${isPress ? '#2c5846' : '#d3e0d9'}"/>
        <rect x="85" y="191" width="119" height="39" rx="9" fill="${isPress ? '#3f755f' : '#ffffff'}" stroke="${isPress ? '#3f755f' : '#a8c1b3'}" stroke-width="2"/>
        <text x="144.5" y="216" text-anchor="middle" fill="${isPress ? '#ffffff' : '#456555'}" font-size="17" font-weight="750" letter-spacing="1">SPACE</text>
        ${isPress ? '<path d="M 69 202 L 62 198 M 70 217 H 61 M 219 202 L 226 198 M 219 217 H 228" stroke="#609579" stroke-width="3"/>' : ''}
      </g>

      ${showSecondMarks ? `<g class="rule-scene-seconds">
        ${secondMarks}
        <text x="433" y="249" text-anchor="middle" fill="#587167" font-size="13" font-weight="600">full seconds looking away</text>
        ${isReset ? '<path d="M 528 220 A 13 13 0 1 0 527 205 M 527 197 V 206 H 519" stroke="#b28667" stroke-width="2.5"/>' : ''}
      </g>` : ''}
    </g>
  </svg>`;
}
