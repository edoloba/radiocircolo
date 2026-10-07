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
import { BsShuffle } from "react-icons/bs";

// Intero casuale in [from, to).
const randomIn = (from, to) => from + Math.floor(Math.random() * (to - from));

// Punto di ingresso casuale, lasciando almeno 30s prima della fine del file.
const randomOffset = (track) =>
  track.duration > 60 ? Math.random() * (track.duration - 30) : 0;

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
// 🔀 salta a un file e un punto casuali. Espone pause() e toggle() via ref, per
// l'alternanza con Mixcloud e la barra spaziatrice.
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

  // File casuale, sempre diverso da quello in corso.
  const playRandom = useCallback(() => {
    const i = index !== null && count > 1 ? (index + randomIn(1, count)) % count : randomIn(0, count);
    playAt(i, randomOffset(tracks[i]));
  }, [index, count, tracks, playAt]);

  const next = useCallback(() => {
    if (index === null) return playRandom();
    playAt((index + 1) % count, 0);
  }, [index, count, playAt, playRandom]);

  const previous = useCallback(() => {
    if (index === null) return playRandom();
    if (audioRef.current.currentTime > RESTART_THRESHOLD) return playAt(index, 0);
    playAt((index - 1 + count) % count, 0);
  }, [index, count, playAt, playRandom]);

  const toggle = useCallback(() => {
    if (playing) pause();
    else if (index === null) playRandom();
    else resume();
  }, [playing, index, pause, playRandom, resume]);

  useImperativeHandle(ref, () => ({ pause, toggle }), [pause, toggle]);

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
        <button
          type="button"
          onClick={playRandom}
          aria-label="Random recording"
          className="ml-2 opacity-60 hover:opacity-100"
        >
          <BsShuffle />
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
