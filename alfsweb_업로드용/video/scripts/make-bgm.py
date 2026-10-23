"""
오륜미네랄 10초 홍보 영상 배경음악 생성기 (직접 합성한 오리지널 음원 · 저작권 걱정 없음)

영상 타이밍(30fps, 10초 버전)에 맞춰 소리를 배치합니다.
  0.00~0.73초  상승음(라이저) → 병이 착지하는 순간 '쿵'
  0.87~4.53초  특징 문구 6개가 나올 때마다 물방울 '퐁' (음이 한 단계씩 올라감)
  6.67초       '생명의 원소, 오륜미네랄' 문구에 맞춰 종소리
  9.4~10초     페이드아웃
템포 120BPM, C장조 (Fmaj7 → G → Em7·Am7 → Dm7·G → Cmaj9)

실행: python3 scripts/make-bgm.py   →  public/bgm-oryun-10s.wav
필요: numpy, scipy
"""
import numpy as np
from scipy.signal import butter, lfilter
from scipy.io import wavfile
from pathlib import Path

SR = 44100
DUR = 10.0
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(7)  # 매번 같은 소리가 나오도록 고정

def note(n):  # MIDI 번호 → 주파수
    return 440.0 * 2 ** ((n - 69) / 12)

def env(n, a, d):  # 시작(a초)·감쇠(d초) 포락선
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
    return e

def put(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))

def lowpass(x, fc, order=2):
    b, a = butter(order, min(fc, SR * 0.45) / (SR / 2), 'low')
    return lfilter(b, a, x)

def highpass(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), 'high')
    return lfilter(b, a, x)

def bandpass(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band')
    return lfilter(b, a, x)

def saw(f, n, phase=0.0):
    t = np.arange(n) / SR
    return 2 * ((f * t + phase) % 1.0) - 1

# ── 악기 ──
def pad(midis, t0, t1, gain=0.06):
    n = int((t1 - t0 + 0.6) * SR)
    s = np.zeros(n)
    for m in midis:
        for det in (-0.08, 0.0, 0.08):
            s += saw(note(m + det), n, rng.random())
    s = lowpass(s, 1400)
    t = np.arange(n) / SR
    a = np.minimum(1, t / 0.35) * np.clip((t1 - t0 + 0.6 - t) / 0.6, 0, 1)
    put(s * a / len(midis), t0, gain, pan=-0.15)
    put(s * a / len(midis), t0, gain * 0.9, pan=0.15)

def pluck(m, t0, gain=0.22, pan=0.0):  # 마림바 느낌
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    f = note(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.28) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.05)
    put(s * env(n, 0.002, 1.0), t0, gain, pan)

def kick(t0, gain=0.42):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 75 * np.exp(-t / 0.04)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)
    put(s, t0, gain)

def clap(t0, gain=0.16):
    n = int(0.2 * SR)
    s = bandpass(rng.standard_normal(n), 900, 3500) * env(n, 0.001, 0.07)
    put(s, t0, gain, pan=0.1)

def hat(t0, gain=0.06, pan=0.3):
    n = int(0.06 * SR)
    s = highpass(rng.standard_normal(n), 7000) * env(n, 0.0005, 0.018)
    put(s, t0, gain, pan)

def drop(m, t0, gain=0.3, pan=0.0):  # 물방울 '퐁'
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f0 = note(m)
    f = f0 * (1 + 1.2 * (1 - np.exp(-t / 0.035)))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09)
    put(s, t0, gain, pan)
    pluck(m + 12, t0 + 0.01, gain * 0.35, -pan)

def bell(m, t0, gain=0.18, pan=0.0):
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    f = note(m)
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) for r, a, d in [(1, 1, 1.2), (2.76, 0.4, 0.6), (5.4, 0.2, 0.3)])
    put(s * env(n, 0.003, 9), t0, gain, pan)

def riser(t0, t1, gain=0.12):
    n = int((t1 - t0) * SR)
    t = np.arange(n) / SR
    p = t / (t1 - t0)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    seg = n // 12
    for k in range(12):  # 구간마다 필터를 열어 '쉬이익' 상승감
        a, b = k * seg, (k + 1) * seg if k < 11 else n
        out[a:b] = lowpass(noise[a:b], 400 + 9000 * (k / 11) ** 2)
    gl = np.sin(2 * np.pi * np.cumsum(220 + 660 * p ** 2) / SR) * 0.25
    put((out + gl) * p ** 2, t0, gain)

def impact(t0, gain=0.5):
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * 55 * t) * np.exp(-t / 0.45) + 0.4 * lowpass(rng.standard_normal(n), 1800) * np.exp(-t / 0.08)
    put(s, t0, gain)

def shimmer(t0, gain=0.05):
    n = int(1.5 * SR)
    s = highpass(rng.standard_normal(n), 6000) * env(n, 0.02, 0.5)
    put(s, t0, gain, -0.4)

# ── 편곡 ──
BEAT = 0.5  # 120BPM
HIT = 0.73  # 병 착지
CHORDS = [  # (시작, 끝, 화음 MIDI)
    (0.0, 2.0, [53, 57, 60, 64]),       # Fmaj7
    (2.0, 4.0, [55, 59, 62, 67]),       # G
    (4.0, 5.0, [52, 55, 59, 62]),       # Em7
    (5.0, 6.0, [57, 60, 64, 67]),       # Am7
    (6.0, 6.67, [50, 57, 60, 65]),      # Dm7
    (6.67, 10.0, [48, 55, 62, 64, 71]), # Cmaj9 (문구 등장과 함께 해결)
]
ARP = {  # 화음별 아르페지오 음
    0: [65, 69, 72, 76], 2: [67, 71, 74, 79], 4: [64, 67, 71, 74], 5: [69, 72, 76, 79], 6: [62, 65, 69, 72], 6.67: [67, 72, 74, 76, 79],
}

riser(0.0, HIT)
impact(HIT)
shimmer(HIT, 0.04)

for t0, t1, ch in CHORDS:
    pad(ch, max(t0, 0.25), t1, 0.05 if t0 < HIT else 0.065)
    pluck(ch[0] - 12, max(t0, HIT), 0.25)  # 베이스

# 리듬: 착지 이후 시작, 마지막 0.6초는 비움
t = HIT
i = 0
while t < 9.4:
    beat_in_bar = i % 4
    if beat_in_bar in (0, 2):
        kick(t)
    if beat_in_bar in (1, 3):
        clap(t)
    hat(t + BEAT / 2, 0.05, 0.35)
    hat(t, 0.025, -0.35)
    t += BEAT
    i += 1

# 아르페지오 (8분음표)
t = HIT + BEAT / 2
k = 0
while t < 9.3:
    key = max(x for x in ARP if x <= t + 1e-6)
    notes = ARP[key]
    pluck(notes[k % len(notes)], t, 0.11, pan=0.45 if k % 2 else -0.45)
    t += BEAT / 2
    k += 1

# 특징 문구 6개 → 물방울 (펜타토닉으로 한 칸씩 상승)
FEATURE_TIMES = [26 / 30, 48 / 30, 70 / 30, 92 / 30, 114 / 30, 136 / 30]
SCALE = [72, 74, 76, 79, 81, 84]
for j, (ft, m) in enumerate(zip(FEATURE_TIMES, SCALE)):
    drop(m, ft, 0.28, pan=-0.35 if j % 2 == 0 else 0.35)  # 왼쪽 문구는 왼쪽, 오른쪽 문구는 오른쪽에서

# 마무리 문구 (200프레임 = 6.67초) → 종소리 아르페지오 + 반짝임
TAG = 200 / 30
for j, m in enumerate([72, 76, 79, 84]):
    bell(m, TAG + j * 0.09, 0.16, pan=-0.3 + j * 0.2)
shimmer(TAG + 0.53, 0.05)  # 두 번째 빛 쓸기(216프레임)
bell(91, 216 / 30, 0.06, 0.4)

# ── 마스터 ──
mix = np.stack([L, R], axis=1)
fade = np.ones(N)
fs = int(9.35 * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
mix *= fade[:, None]
mix = np.tanh(mix * 1.6) / np.tanh(1.6)  # 부드러운 압축
mix *= 0.89 / np.max(np.abs(mix))  # 약 -1dBFS
out = Path(__file__).resolve().parent.parent / 'public' / 'bgm-oryun-10s.wav'
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print('saved', out)
