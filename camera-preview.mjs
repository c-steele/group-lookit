/** Optional, local-only webcam check. It never records or sends camera data. */
export function createCameraPreview({ video, onChange = () => {}, getUserMedia } = {}) {
  if (!video) throw new TypeError('A video element is required for the camera preview.');
  let token = 0;
  let destroyed = false;
  let currentStream = null;
  let removeEvents = () => {};
  const stoppedTracks = new WeakSet();
  let state = { status: 'off', message: 'Camera is off. Preview is optional and stays on this device.', ready: false, active: false, recording: false };
  const getState = () => ({ ...state });

  function publish(status, message) {
    state = { status, message, ready: status === 'ready', active: status === 'loading' || status === 'ready', recording: false };
    onChange(getState());
  }

  function stopTracks(stream) {
    for (const track of stream?.getTracks?.() ?? []) {
      if (!stoppedTracks.has(track)) {
        stoppedTracks.add(track);
        track.stop();
      }
    }
  }

  function release() {
    removeEvents();
    removeEvents = () => {};
    const oldStream = currentStream;
    currentStream = null;
    stopTracks(oldStream);
    video.pause?.();
    if (video.srcObject === oldStream || video.srcObject == null) video.srcObject = null;
  }

  function stop(message = 'Camera is off. Nothing was recorded.') {
    ++token;
    release();
    if (!destroyed) publish('off', message);
    return getState();
  }

  async function start() {
    if (destroyed) return getState();
    const requestToken = ++token;
    release();
    if (globalThis.isSecureContext !== true) {
      publish('unsupported', 'Camera preview needs a secure HTTPS page. Camera remains off.');
      return getState();
    }
    const request = getUserMedia ?? (globalThis.navigator?.mediaDevices?.getUserMedia
      ? options => globalThis.navigator.mediaDevices.getUserMedia(options)
      : null);
    if (!request) {
      publish('unsupported', 'This browser does not support a camera preview. Camera remains off.');
      return getState();
    }
    publish('requesting', 'Allow camera access to see a local preview. Microphone and recording stay off.');
    let stream;
    try {
      stream = await request({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: false });
      if (destroyed || requestToken !== token) {
        stopTracks(stream);
        return getState();
      }
      currentStream = stream;
      let rendered = false;
      const markRendered = () => {
        if (destroyed || requestToken !== token || currentStream !== stream) return;
        rendered = true;
        checkReady();
      };
      const checkReady = () => {
        if (destroyed || requestToken !== token || currentStream !== stream) return;
        if (rendered && video.videoWidth > 0 && video.videoHeight > 0) {
          publish('ready', 'Live preview: check that both eyes and the whole face are clear and well lit. Nothing is being recorded.');
        }
      };
      const streamEnded = () => {
        if (destroyed || requestToken !== token || currentStream !== stream) return;
        ++token;
        release();
        publish('error', 'The camera preview stopped or disconnected. Try again, or continue without this optional preview. Nothing was recorded.');
      };
      const tracks = stream.getTracks?.() ?? [];
      video.addEventListener('playing', markRendered);
      video.addEventListener('loadeddata', markRendered);
      for (const track of tracks) track.addEventListener?.('ended', streamEnded);
      stream.addEventListener?.('inactive', streamEnded);
      removeEvents = () => {
        video.removeEventListener('playing', markRendered);
        video.removeEventListener('loadeddata', markRendered);
        for (const track of tracks) track.removeEventListener?.('ended', streamEnded);
        stream.removeEventListener?.('inactive', streamEnded);
      };
      publish('loading', 'Starting your local camera preview… Nothing is being recorded.');
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await video.play();
      checkReady();
    } catch (error) {
      if (destroyed || requestToken !== token) {
        stopTracks(stream);
        return getState();
      }
      release();
      const denied = error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError';
      publish(denied ? 'denied' : 'error', denied
        ? 'Camera permission was not granted. You can allow it and try again, or continue without this optional preview.'
        : 'The camera preview could not start. Close other apps using the camera and try again, or continue without this optional preview.');
    }
    return getState();
  }

  function destroy() {
    if (destroyed) return getState();
    stop();
    destroyed = true;
    publish('destroyed', 'Camera is off. Nothing was recorded.');
    return getState();
  }

  return { get state() { return getState(); }, getState, start, stop, destroy };
}
