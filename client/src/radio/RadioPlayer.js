import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  AiFillCaretRight,
  AiOutlinePause,
  AiOutlineStepBackward,
  AiOutlineStepForward,
} from "react-icons/ai";

// Intero casuale in [from, to).
const randomIn = (from, to) => from + Math.floor(Math.random() * (to - from));

// Punto di ingresso casuale, lasciando almeno 30s prima della fine del file.
const randomOffset = (track) =>
  track.duration > 60 ? Math.random() * (track.duration - 30) : 0;

// ⏮/⏭ saltano i file più corti di così (tagli del registratore), che però
// suonano normalmente quando si prosegue in sequenza.
const MIN_SKIP_DURATION = 120;

// ⏮ oltre questi secondi dall'inizio del file riavvolge il file in corso.
const RESTART_THRESHOLD = 3;

const formatRecordedAt = (seconds) =>
  new Date(seconds * 1000).toLocaleString("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Player delle registrazioni: parte da un file e un punto casuali, poi prosegue
// in ordine cronologico. ⏮/⏭ vanno all'inizio del file precedente/successivo.
// Espone pause() via ref, per fermarlo quando parte Mixcloud.
const RadioPlayer = forwardRef(({ onPlay }, ref) => {
  const audioRef = useRef(null);
  const pendingSeekRef = useRef(0);
  const [playlist, setPlaylist] = useState(null);
  const [index, setIndex] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/radio/playlist.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.tracks?.length && setPlaylist(data))
      .catch(() => {});
  }, []);

  const tracks = playlist?.tracks;
  const count = tracks?.length ?? 0;

  const resume = useCallback(() => {
    onPlay?.();
    setPlaying(true);
    audioRef.current.play().catch((err) => {
      // AbortError: il file è stato cambiato prima che partisse, non è un errore.
      if (err.name !== "AbortError") {
        setPlaying(false);
        setBuffering(false);
      }
    });
  }, [onPlay]);

  const playAt = useCallback(
    (i, offset) => {
      const audio = audioRef.current;
      pendingSeekRef.current = offset;
      audio.src = `${playlist.baseUrl}/${encodeURIComponent(tracks[i].file)}`;
      setIndex(i);
      setPosition(offset);
      setBuffering(true);
      resume();
    },
    [playlist, tracks, resume]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const playRandom = useCallback(() => {
    const i = randomIn(0, count);
    playAt(i, randomOffset(tracks[i]));
  }, [count, tracks, playAt]);

  // Primo file nella direzione data (+1/-1, ciclico) abbastanza lungo da
  // meritare un salto; se non ce ne sono, semplicemente l'adiacente.
  const skipTarget = useCallback(
    (step) => {
      for (let n = 1; n < count; n++) {
        const i = (((index + step * n) % count) + count) % count;
        if (tracks[i].duration >= MIN_SKIP_DURATION) return i;
      }
      return (((index + step) % count) + count) % count;
    },
    [index, count, tracks]
  );

  const next = useCallback(() => {
    if (index === null) return playRandom();
    playAt(skipTarget(1), 0);
  }, [index, playAt, playRandom, skipTarget]);

  const previous = useCallback(() => {
    if (index === null) return playRandom();
    if (audioRef.current.currentTime > RESTART_THRESHOLD) return playAt(index, 0);
    playAt(skipTarget(-1), 0);
  }, [index, playAt, playRandom, skipTarget]);

  const toggle = () => {
    if (playing) pause();
    else if (index === null) playRandom();
    else resume();
  };

  useImperativeHandle(ref, () => ({ pause }), [pause]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const handlers = {
      play: () => (index === null ? playRandom() : resume()),
      pause,
      nexttrack: next,
      previoustrack: previous,
    };
    Object.entries(handlers).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {}
    });
  }, [index, playRandom, resume, pause, next, previous]);

  useEffect(() => {
    if (index === null || !("mediaSession" in navigator) || !window.MediaMetadata) return;
    const track = tracks[index];
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: track.title || playlist.name,
      artist: "Radio Circolo",
    });
  }, [index, tracks, playlist]);

  if (!playlist) return null;

  const track = index !== null ? tracks[index] : null;
  const title = track?.title || playlist.name;
  const when = track?.recordedAt ? formatRecordedAt(track.recordedAt + position) : null;
  const dot = playing ? (buffering ? "bg-yellow-400" : "bg-red-500 animate-pulse") : "bg-[#16141444]";

  // Un blocco della topbar: flex-1, così più player si dividono la barra.
  return (
    <div className="flex h-12 min-w-0 flex-1 items-center gap-4 bg-[#ffffff] text-[#000000] px-10 uppercase">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="shrink-0 text-3xl hover:opacity-70"
      >
        {playing ? <AiOutlinePause /> : <AiFillCaretRight />}
      </button>
      <div className="flex shrink-0 items-center gap-1 text-lg">
        <button
          type="button"
          onClick={previous}
          aria-label="Previous recording"
          className="opacity-60 hover:opacity-100"
        >
          <AiOutlineStepBackward />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next recording"
          className="opacity-60 hover:opacity-100"
        >
          <AiOutlineStepForward />
        </button>
      </div>
      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <p className="min-w-0 truncate text-sm font-bold">{title}</p>
      {when && (
        <p className="hidden shrink-0 text-sm opacity-60 sm:block">({when})</p>
      )}
      <audio
        ref={audioRef}
        preload="none"
        onLoadedMetadata={() => {
          if (pendingSeekRef.current > 0) audioRef.current.currentTime = pendingSeekRef.current;
          pendingSeekRef.current = 0;
        }}
        onTimeUpdate={() => setPosition(audioRef.current.currentTime)}
        // Fine file: si prosegue col successivo in ordine cronologico, da capo.
        onEnded={() => playAt((index + 1) % count, 0)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        // Pausa dall'esterno (cuffie staccate, sistema operativo...). Controlla
        // paused perché anche il cambio di file emette "pause".
        onPause={() => setPlaying(!audioRef.current.paused)}
      />
    </div>
  );
});

export default RadioPlayer;
