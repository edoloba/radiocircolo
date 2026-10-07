import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BsPauseFill, BsPlayFill, BsSkipEndFill, BsSkipStartFill } from "react-icons/bs";

// Intero casuale in [from, to).
const randomIn = (from, to) => from + Math.floor(Math.random() * (to - from));

// Punto di ingresso casuale, lasciando almeno 30s prima della fine del file.
const randomOffset = (track) =>
  track.duration > 60 ? Math.random() * (track.duration - 30) : 0;

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
// in ordine cronologico. ⏮/⏭ saltano a un file casuale prima/dopo quello in
// corso. Espone pause() via ref, per fermarlo quando parte Mixcloud.
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

  const next = useCallback(() => {
    if (index === null) return playRandom();
    // Dall'ultimo file si riparte da uno qualsiasi degli altri.
    const i = index < count - 1 ? randomIn(index + 1, count) : randomIn(0, count - 1);
    playAt(i, randomOffset(tracks[i]));
  }, [index, count, tracks, playAt, playRandom]);

  const previous = useCallback(() => {
    if (index === null) return playRandom();
    // Dal primo file si salta a uno qualsiasi degli altri.
    const i = index > 0 ? randomIn(0, index) : randomIn(1, count);
    playAt(i, randomOffset(tracks[i]));
  }, [index, count, tracks, playAt, playRandom]);

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
  const dot = playing ? (buffering ? "bg-yellow-400" : "bg-red-500 animate-pulse") : "bg-[#ffffff44]";

  // Un blocco della topbar: flex-1, così più player si dividono la barra.
  return (
    <div className="flex h-12 min-w-0 flex-1 items-center gap-4 bg-[#0e0a0b] px-4 uppercase">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="shrink-0 text-3xl hover:opacity-70"
      >
        {playing ? <BsPauseFill /> : <BsPlayFill />}
      </button>
      <div className="flex shrink-0 items-center gap-1 text-lg">
        <button
          type="button"
          onClick={previous}
          aria-label="Random earlier recording"
          className="opacity-60 hover:opacity-100"
        >
          <BsSkipStartFill />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Random later recording"
          className="opacity-60 hover:opacity-100"
        >
          <BsSkipEndFill />
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
