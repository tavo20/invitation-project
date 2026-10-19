# Genera la narración línea por línea con ElevenLabs (voz Brian, multilingüe) usando el endpoint
# with-timestamps: los tiempos por palabra salen del texto exacto del guion (no de una transcripción).
# Escribe assets/voice/NN.wav, audio_meta.json y audio_engine_meta.json con el formato del proceso.
# Uso: python3 -I capture/voice.py   (desde la raíz del proyecto, con ELEVENLABS_API_KEY)
import base64, json, os, re, subprocess, sys, time, urllib.request

VOICE = 'nPczCjzI2devNBz1zQrb'
MODEL = 'eleven_multilingual_v2'
SETTINGS = {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.25, 'use_speaker_boost': True}
ROOT = os.getcwd()

def lines_from_script():
    text = open(os.path.join(ROOT, 'SCRIPT.md'), encoding='utf-8').read()
    out = []
    for m in re.finditer(r'## Line (\d+) — [^\n]*\(Frame (\d+)\)\n(.*?)(?=\n## Line |\Z)', text, re.S):
        spoken = ' '.join(l.strip() for l in m.group(3).split('\n') if l.startswith('    '))
        out.append((int(m.group(2)), spoken))
    return out

def tts(text):
    body = json.dumps({'text': text, 'model_id': MODEL, 'voice_settings': SETTINGS,
                       'output_format': 'mp3_44100_128'}).encode()
    req = urllib.request.Request(
        f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps',
        data=body, headers={'xi-api-key': os.environ['ELEVENLABS_API_KEY'], 'Content-Type': 'application/json'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 3:
                time.sleep(4 * (attempt + 1))
                continue
            raise SystemExit(f'ElevenLabs {e.code}: {e.read()[:300]}')

def words_from_alignment(al):
    chars, starts, ends = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
    words, cur, ws, we = [], '', None, None
    for c, s, e in zip(chars, starts, ends):
        if c.isspace():
            if cur:
                words.append((cur, ws, we))
            cur, ws = '', None
            continue
        if ws is None:
            ws = s
        cur += c
        we = e
    if cur:
        words.append((cur, ws, we))
    return [{'id': f'w{i}', 'text': t, 'start': round(s, 3), 'end': round(e, 3)} for i, (t, s, e) in enumerate(words)]

def duration(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                       capture_output=True, text=True)
    return round(float(r.stdout.strip()), 3)

voices = []
os.makedirs(os.path.join(ROOT, 'assets', 'voice'), exist_ok=True)
for frame, text in lines_from_script():
    data = tts(text)
    mp3 = os.path.join(ROOT, 'assets', 'voice', f'{frame:02d}.mp3')
    wav = os.path.join(ROOT, 'assets', 'voice', f'{frame:02d}.wav')
    open(mp3, 'wb').write(base64.b64decode(data['audio_base64']))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-ar', '44100', '-ac', '1', wav], check=True)
    os.remove(mp3)
    words = words_from_alignment(data['alignment'])
    voices.append({'frame': frame, 'path': f'assets/voice/{frame:02d}.wav', 'duration_s': duration(wav), 'words': words})
    print(f'  {frame:02d}  {voices[-1]["duration_s"]:5.2f}s  {" ".join(w["text"] for w in words)}')
    time.sleep(0.5)

json.dump({'bgm': None, 'bgm_pending': False, 'voices': voices, 'sfx': []},
          open(os.path.join(ROOT, 'audio_meta.json'), 'w'), ensure_ascii=False, indent=2)
engine = json.load(open(os.path.join(ROOT, 'audio_engine_meta.json')))
engine['voices'] = [{'id': f'{v["frame"]:02d}', 'path': v['path'], 'duration_s': v['duration_s'], 'words': v['words']} for v in voices]
engine['total_duration_s'] = round(sum(v['duration_s'] for v in voices), 3)
json.dump(engine, open(os.path.join(ROOT, 'audio_engine_meta.json'), 'w'), ensure_ascii=False, indent=2)
print('total', engine['total_duration_s'], 's')
