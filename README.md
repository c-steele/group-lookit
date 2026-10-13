# GROUP — current collaborator review

This is this GROUP project's own latest parent-instructions and scientific-movie preview, updated October 13, 2026. It is a standalone review copy, not a live Children Helping Science (CHS)/Lookit study or another project's demo.

## October 13: reference-style parent interface and local camera check

The opening now adapts the supplied Find the Caregiver! / Who Helps Where? parent-interface design: Open Sans typography, soft cream/blue background, white rounded shell, sage illustrated cards, three colored floating icon badges, connected progress, blue callouts, clear green next buttons, and a styled review ending. GROUP-specific wording, the six-step toy/real-parent walkthrough, automatic Evelyn narration, 3-full-second practice, scientific timings, counterbalance and all 148 scientific movies are preserved. The reference studies were inspected but not edited or activated. Only their visual design is reused—not child-choice instructions, durations, payments, consent or participant data.

The baby-ready screen adds an optional **Show my camera view** action. It requests video only, on that explicit click; microphone, recording, uploads and stored responses remain off. The mirrored local feed lets a collaborator check their own framing. Confirmation appears only after a rendered video frame, and is a human check, not automated validation of eyes/lighting or a new trial gate. Leaving the screen, hiding/navigating the tab, cancelling a request or disconnecting the camera stops its tracks. The feed is never shown during scientific movies. Permission denial and unsupported browsers leave the review available without camera access. Hardware-camera testing and the actual CHS runner pilot are still required.

Open Sans comes from the same jsPsych 7.3.4 vendor stylesheet already used by the supplied reference study, hosted on the same lab-owner GitHub account. The GROUP-specific theme is isolated in `parent-theme.css`. The camera module never uses MediaRecorder, image capture, upload, analytics, or local storage.

For CHS, use a native `exp-lookit-webcam-display` check (`startRecordingAutomatically:false`) after approved consent and before `exp-lookit-start-recording`. This standalone optional camera preview is not that integration and does not grant CHS access to the stream, record consent, certify training, or replace its upload/recording flow. Do not iframe the public reviewer preview and assume CHS knows that training was completed. Do not copy over-the-shoulder positioning from child-study/default camera instructions: GROUP parents must see baby's eyes and reach Space.

Primary method sources: [Raz and colleagues’ paper](https://bpb-us-e1.wpmucdn.com/sites.mit.edu/dist/0/2045/files/2024/07/raz_devpsych_2024.pdf), [author stimulus repository](https://github.com/GalRaz/mcs_lookit_stims), [native CHS webcam frame](https://lookit.readthedocs.io/projects/frameplayer/en/latest/components/exp-lookit-webcam-display/doc.html). Parent instructions use 3 continuous seconds away with look-back reset; the paper's separate 2-second offline analysis rule is not a parent instruction. Waiting for the action to finish and the picture to stay still is GROUP's added gate, taught separately from the original Gal camera-view examples.

Current parent flow: setup → guided walkthrough (six short lessons) → one scored illustration practice → baby setup. The walkthrough is: toy movie finishing → toy 3-second look away → corresponding real-parent moment → toy look-back reset → corresponding real-parent moment → P to pause. Each page explains one point, with automatic matching Evelyn narration; the real excerpts start after their short narration finishes. The full original front and rear videos remain optional researcher references, not another mandatory training loop. The dense four-question quiz remains removed.

The real-parent excerpts explicitly introduce what the parent will do with their own baby. They play continuous windows of the original author-hosted OSF front video at normal speed: 19.5–26.0 seconds for a sustained look away and parent ending the trial, and 6.0–10.0 seconds for a brief look away and return without ending the trial. These are teaching playback boundaries, not frame-coded gaze ground truth or exact key-down labels. No exact countdown is overlaid on the real footage. The toy example teaches GROUP’s additional requirement to wait for the picture to become still; the real camera view does not show the movie screen. This distinction is displayed beside each real excerpt.

The two short real-example introductions are contiguous intact-sentence excerpts of the previously verified Evelyn recording (`demo-your-role.mp3`), not new speech or word splicing. Their source/export hashes, transcripts, silent cut boundaries, and extraction script are recorded locally. Human listening and parent usability review remain pending. The real footage itself is not edited, downloaded anew, or uploaded to this repository; it continues to play from its original OSF source.

The live collaborator review is https://c-steele.github.io/group-lookit/. Open it through a web server, not directly as a downloaded file.

## Included

- The current parent pages, physical-space-bar timing practice, original Evelyn audio plus setup/training excerpts and two short guided-example introductions with matching transcripts, AI-generated camera-lighting examples and a caregiver-view practice illustration, and review chime candidate. The movie-finish excerpt is used again in the current walkthrough; other historical recordings remain preserved.
- Both V3 and V5, 16 counterbalance cells each, their complete 37-entry sequences, and 148 original selected scientific video files. V3 PS09 is the review default.
- The current player timing and review controls. Researcher skips are an explicit review convenience available to every visitor, not authentication or proof that training was passed.

## Review only

No microphone access, recording, consent workflow, uploads, saved participant responses, random assignment, or iCatcher processing runs here. Camera access is off by default and available only for an explicitly requested local preview on the baby-ready page. No participant data, local Raz training-video copies, project documents, Keynotes, unrelated reference-project assets, or credentials are included. This public repository is not access-controlled; noindex and robots.txt merely discourage indexing.

The example and practice videos play directly from the existing author-hosted OSF sources by Gal Raz and colleagues:

- [Original demonstration](https://osf.io/download/v4npq/)
- [Original practice](https://osf.io/download/juea4/)

Internet access is required for those third-party videos; availability and playback are not guaranteed. They are not redistributed in this repository.

Setup shows four short steps: computer, lighting, clear camera view, and sound. A prominent checkbox confirms hearing the sample, then enables Continue. The walkthrough reuses the existing verified Evelyn recordings and two new contiguous sentence excerpts from the real-demo introduction. Exact provider export transcripts and hashes are verified; independent listening review remains pending. The chime remains a review candidate, not approved release audio. Parent usability testing and actual CHS integration remain pending. This preview is not validated gaze detection, a competency assessment, or a participant-ready protocol.

## Packaging and rights

Files are deliberately flat for GitHub's browser uploader. The parent setup now uses four concise screens, explicit no-phone/tablet and front-light guidance, and paired synthetic camera examples. Practice is illustrated from behind the baby, matching the caregiver viewpoint; the original Raz front demonstration and rear practice remain unchanged. Runtime asset references are adapted for this public review. Scientific media bytes, scientific timing, counterbalance mapping, and parent-training timing rules are unchanged. Historical provenance fields in the study map are retained as metadata, not downloadable asset links.

No blanket license is granted by publishing this review. Third-party research materials retain their applicable rights and attribution; public access is not permission for unrestricted reuse.

## Animated comprehension examples

Historical revision notes below describe prior builds. The latest October 3 interleaved guided walkthrough above supersedes prior whole-video-first/whole-video-after instructions, three/five rule pages, mandatory quizzes, and prior narration arrangements.

Each question now enacts its short scene before answer buttons appear. A moving-movie question stays visibly animated while answering; frozen scenes remain frozen. A brighter moving ball makes the demonstration screen easier to follow. Leaving the tab pauses the example and requires replay, without credit for unseen frames. Existing four comprehension rules, 3-second thresholds, scientific movies and study timing are unchanged.

## Three full seconds, not any glance

Parent headings now say “Press space after your baby has looked away for 3 full seconds.” Teaching captions explicitly say keep waiting at 1 second and not yet at 2 seconds; questions retain neutral scenarios. A fixed reminder beside the space-bar illustration repeats the full 3-second requirement and still-picture condition. Independent timing practice still has no live countdown or automatic press-now cue. Original Evelyn audio/transcripts and the 3-second timing model are unchanged.

## One point at a time: parent rule pages

The parent rule is now five short pages: watch your baby; wait for the still picture; count 3 full seconds away; restart after a look back; and take a break with P. Each page automatically plays a matching excerpt of the existing NaturalReaders Evelyn recording (subject to browser audio permission and the parent's audio setting). The animated teaching example starts after that page's narration ends. With narration off or unavailable, the example starts without waiting for audio.

The teaching count advances only after completed 1-second intervals: 1 → 2 → 3. A look back resets the count before a fresh look away. The spoken “one, two, three” is an instruction, not a calibrated timer. Independent hands-on timing practice still has no live countdown or press-now cue. The four comprehension questions, 3-second timing threshold, scientific timing, counterbalance mapping, and all 148 scientific movies are unchanged. Researcher skips remain review-only conveniences.

These are contiguous excerpts of the existing `03-look-away-rule.mp3` performance, not new speech. Source SHA-256: `c07dbd3cba466313d82dd9b1c1d5e75b954d52288b2daee222f08e23573cd668`. No pitch, speed, or gain changes were made. Sentence boundaries were checked against pauses below −60 dBFS, but neither independent transcription nor human listening verification was performed. Listen to every excerpt before participant release.

| Excerpt | Source interval (seconds) | Decoded duration |
| --- | --- | --- |
| rule-watch.mp3 | 0.000–2.569 | 2.569 s |
| rule-finish.mp3 | 2.569–11.113 | 8.544 s |
| rule-count.mp3 | 13.062–22.886 | 9.824 s |
| rule-reset.mp3 | 22.886–33.172 | 10.286 s |
| rule-break.mp3 | 33.172–42.789 | 9.617 s |

Exact page transcripts are included in `rule-intro.mjs`. Full technical provenance and an unchanged-file SHA-256 audit remain in the local project's incremental manifest. This builder does not run the regression suites, publish to GitHub, or change CHS. Parent usability and listening review, participant-protocol validation, and actual CHS integration remain pending.

## High-chair and lap seating

The baby-ready page replaces the old faceless camera drawing with two AI-generated seating examples: high chair and supported lap. These are synthetic illustrations, not real participants or a live webcam, and do not validate physical safety or exact camera coverage. The caregiver must be able to observe baby’s eyes and reach Space. No over-the-shoulder option is included for this parent-controlled paradigm. Existing Evelyn narration already covers high chair/lap and is unchanged, as are all scientific videos, timing models and CHS settings. The exact image-generation prompt and inspection notes are retained in the local project.

## Checking the movie and watching baby

Parents glance at the screen to check when the picture becomes still, then watch baby’s eyes. The first teaching page demonstrates this transition. The baby-ready narration now uses `ready-watch-baby-and-movie.mp3`, removing the outdated sentence telling parents not to watch the movies; its displayed transcript matches the edited recording. This is a sentence deletion from the existing Evelyn audio, not new speech. The original recording and manifest remain as provenance; the old sentence is not played or displayed by the current ready page. Technical silent-boundary checks passed, but human listening verification is still required before participant release. No pointing/prompting, 3 full continuous seconds away, look-back resets, practice checks, and all scientific timing/movies remain unchanged. CHS is not modified by this preview update.

## Clear parent-language revision

Headings now explicitly identify looking away from the screen for 3 full seconds, a look back before 3 seconds, and pressing P to pause. Captions and practice feedback use the same explicit references. A look back stops the count; a new count starts at the next look away. These are wording-only changes: teaching delays, scientific timing, answer keys, independent practice eligibility, and look-back resets are unchanged. Existing narration excerpts and their exact transcripts remain unchanged.

## Still-picture rule and simplified training — 2026-10-03

The normal preview flow is setup → Gal Raz’s original real-child front demonstration → three short GROUP-specific instruction pages → one scored illustration practice → baby setup. The old four-question quiz and unscored original rear video are no longer mandatory; the rear video is an optional researcher reference. The author-hosted demonstration teaches sustained look-away versus brief glances, not GROUP’s action-finished/still-picture gate. The next pages explicitly teach that gate, a continuous 3-second look-away, look-back reset, and P to pause. New NaturalReaders Commercial Evelyn Soft recordings (180 WPM creation setting) match their exact exported transcripts, including “When the movie finishes, the picture will stay still” and “from the screen for three full seconds without looking back.” Historical audio remains preserved locally. Counting animations are teaching aids, not live gaze coding. Hands-on practice remains scripted and checks the 3000-ms threshold, moving-picture rejection and look-back resets. No participant recordings, original Gal media copies or scientific stimulus changes are included; CHS is unchanged. Human listening and parent usability review remain required before participant release.
