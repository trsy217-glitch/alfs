"""
'영상 만들기' 자동생성 템플릿용 배경음악 (직접 합성한 오리지널 음원 · 저작권 걱정 없음)

템플릿(src/videomaker/adScene.js) 타이밍에 맞춥니다. 6초(180프레임) 기준, 10초는 같은 비율로 늘림.
  0 ~ 40프레임   상승음 → 제품 착지 '쿵' + 번쩍
  55프레임       빛 쓸기 반짝임
  70 / 80프레임  왼쪽·오른쪽 문구 → 물방울 '퐁'
  95프레임       밑줄 → 종소리
  마지막 0.6초   페이드아웃
악기는 make-bgm.py 것을 그대로 씁니다.

실행: python3 scripts/make-ad-bgm.py [6|10]  →  ../public/video-maker/bgm-ad-6s.wav (mp3 변환은 ffmpeg)
"""
import sys
from pathlib import Path
import numpy as np
from scipy.io import wavfile

# make-bgm.py 의 악기 정의만 불러오기 (편곡 부분 앞까지)
_src = Path(__file__).with_name('make-bgm.py').read_text(encoding='utf-8').split('# ── 편곡 ──')[0]
exec(_src)  # SR, DUR(명령줄 인수), N, L, R, rng, pad/pluck/kick/clap/hat/drop/bell/riser/impact/shimmer

K6 = DUR / 6.0
F = lambda n: n * K6 / 30  # 6초 기준 프레임 → 초
BEAT = 0.5
HIT = F(40)
TAG = F(95)
CHORDS = [
    (0.0, F(70), [53, 57, 60, 64]),      # Fmaj7
    (F(70), F(95), [55, 59, 62, 67]),    # G
    (F(95), DUR, [48, 55, 62, 64, 71]),  # Cmaj9
]
ARP = {0: [65, 69, 72, 76], F(70): [67, 71, 74, 79], F(95): [67, 72, 74, 76, 79]}

riser(0.0, HIT)
impact(HIT)
shimmer(F(55), 0.05)
for t0, t1, ch in CHORDS:
    pad(ch, max(t0, 0.25), t1, 0.05 if t0 < HIT else 0.065)
    pluck(ch[0] - 12, max(t0, HIT), 0.25)
t, i = HIT, 0
while t < DUR - 0.6:
    if i % 4 in (0, 2): kick(t)
    if i % 4 in (1, 3): clap(t)
    hat(t + BEAT / 2, 0.05, 0.35); hat(t, 0.025, -0.35)
    t += BEAT; i += 1
t, k = HIT + BEAT / 2, 0
while t < DUR - 0.7:
    notes = ARP[max(x for x in ARP if x <= t + 1e-6)]
    pluck(notes[k % len(notes)], t, 0.11, pan=0.45 if k % 2 else -0.45)
    t += BEAT / 2; k += 1
drop(76, F(70), 0.3, pan=-0.4)
drop(81, F(80), 0.3, pan=0.4)
for j, m in enumerate([72, 76, 79, 84]):
    bell(m, TAG + j * 0.09, 0.15, pan=-0.3 + j * 0.2)

mix = np.stack([L, R], axis=1)
fade = np.ones(N); fs = int((DUR - 0.6) * SR); fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
mix *= fade[:, None]
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
mix *= 0.89 / np.max(np.abs(mix))
out = Path(__file__).resolve().parent.parent.parent / 'public' / 'video-maker' / f'bgm-ad-{int(DUR)}s.wav'
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print('saved', out)
