#!/usr/bin/env node
// Converte le registrazioni in MP3 128k CBR (seek preciso nel browser) e genera
// la playlist letta dal player della radio.
//
// Uso:
//   node scripts/prepare-radio.js <cartella-originali> [base-url-pubblico] [nome]
//
// Esempio:
//   node scripts/prepare-radio.js ~/Desktop/"MP3 TAGLIACOZZO" https://pub-xxxx.r2.dev Tagliacozzo
//
// Richiede ffmpeg (brew install ffmpeg). I file convertiti finiscono in
// radio-export/ (da caricare sullo storage), la playlist in
// client/public/radio/playlist.json. Rilanciarlo salta i file già convertiti,
// quindi per aggiungere registrazioni basta rilanciarlo con i nuovi file nella
// cartella. Eventuali "title" scritti a mano nella playlist vengono mantenuti.
//
// I file sono ordinati per data di registrazione, letta dal nome del file nel
// formato del registratore (GGMMAA_HHMMSS_...). Gli altri vanno in coda per nome.

const { execFileSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const BITRATE = process.env.BITRATE || "128k";
// Conversioni in parallelo: 6 lascia qualche core libero su un M1 Pro.
const JOBS = Number(process.env.JOBS) || 6;
const AUDIO_EXT = /\.(wav|aiff?|flac|mp3|m4a|aac|ogg|opus)$/i;
const RECORDER_NAME = /^(\d{2})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/;

const [inputDir, baseUrlArg, nameArg] = process.argv.slice(2);
if (!inputDir) {
  console.error("Uso: node scripts/prepare-radio.js <cartella-originali> [base-url-pubblico] [nome]");
  process.exit(1);
}

const root = path.join(__dirname, "..");
const outDir = path.join(root, "radio-export");
const playlistPath = path.join(root, "client/public/radio/playlist.json");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.dirname(playlistPath), { recursive: true });

const previous = fs.existsSync(playlistPath)
  ? JSON.parse(fs.readFileSync(playlistPath, "utf8"))
  : { tracks: [] };
const previousTitles = Object.fromEntries(
  previous.tracks.filter((t) => t.title).map((t) => [t.file, t.title])
);
const baseUrl = (baseUrlArg ?? previous.baseUrl ?? "").replace(/\/$/, "");
const name = nameArg ?? previous.name ?? "Radio Circolo";

// Ora locale della registrazione, salvata come se fosse UTC così il player la
// mostra identica in qualunque fuso orario.
const recordedAt = (filename) => {
  const m = filename.match(RECORDER_NAME);
  if (!m) return null;
  const [, dd, mm, yy, h, min, s] = m.map(Number);
  return Date.UTC(2000 + yy, mm - 1, dd, h, min, s) / 1000;
};

const slugify = (str) =>
  str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const probeDuration = (file) =>
  parseFloat(
    execFileSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      file,
    ]).toString()
  );

const sources = fs
  .readdirSync(inputDir)
  .filter((f) => AUDIO_EXT.test(f))
  .map((f) => ({ src: f, recordedAt: recordedAt(f) }))
  .sort(
    (a, b) =>
      (a.recordedAt ?? Infinity) - (b.recordedAt ?? Infinity) ||
      a.src.localeCompare(b.src, undefined, { numeric: true })
  );

if (!sources.length) {
  console.error(`Nessun file audio trovato in ${inputDir}`);
  process.exit(1);
}

const convert = (src, outPath) =>
  new Promise((resolve, reject) => {
    const tmpPath = `${outPath}.part.mp3`;
    const ffmpeg = spawn("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-i", path.join(inputDir, src),
      "-vn", "-map_metadata", "-1",
      "-ac", "2", "-ar", "44100",
      "-c:a", "libmp3lame", "-b:a", BITRATE,
      tmpPath,
    ], { stdio: ["ignore", "ignore", "inherit"] });
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => {
      if (code !== 0) return reject(new Error(`ffmpeg ha fallito su ${src}`));
      fs.renameSync(tmpPath, outPath);
      resolve();
    });
  });

const main = async () => {
  const jobs = sources.map(({ src }) => {
    const file = `${slugify(path.parse(src).name)}.mp3`;
    return { src, file, outPath: path.join(outDir, file) };
  });

  const todo = jobs.filter((j) => !fs.existsSync(j.outPath));
  console.log(`${jobs.length - todo.length} già convertiti, ${todo.length} da convertire (${JOBS} alla volta)`);

  const total = todo.length;
  let done = 0;
  const worker = async () => {
    while (todo.length) {
      const { src, file, outPath } = todo.shift();
      await convert(src, outPath);
      console.log(`[${++done}/${total}] ${file}`);
    }
  };
  await Promise.all(Array.from({ length: JOBS }, worker));

  return jobs.map(({ file, outPath }, i) => {
    const track = { file, duration: Math.round(probeDuration(outPath) * 1000) / 1000 };
    if (sources[i].recordedAt !== null) track.recordedAt = sources[i].recordedAt;
    if (previousTitles[file]) track.title = previousTitles[file];
    return track;
  });
};

main().then((tracks) => {
  fs.writeFileSync(playlistPath, JSON.stringify({ name, baseUrl, tracks }, null, 2) + "\n");

  const totalHours = tracks.reduce((s, t) => s + t.duration, 0) / 3600;
  const totalBytes = tracks.reduce((s, t) => s + fs.statSync(path.join(outDir, t.file)).size, 0);
  console.log(
    `\n${tracks.length} file, ${totalHours.toFixed(1)} ore, ${(totalBytes / 1e9).toFixed(2)} GB in radio-export/`
  );
  console.log(`Playlist scritta in ${path.relative(root, playlistPath)}`);
  if (!baseUrl) console.log("ATTENZIONE: base URL vuoto, rilancia lo script con l'URL pubblico dello storage.");
}).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
