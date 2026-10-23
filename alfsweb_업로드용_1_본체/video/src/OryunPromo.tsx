// size=1280x720 · 30fps · 5초(150프레임)와 10초(300프레임) 두 가지 길이
// 길이가 바뀌어도 움직임 속도는 같고, 등장 시점만 길이에 맞춰 넓어집니다.
import {AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from './font';

// ── 여기만 바꾸면 다른 제품 광고가 돼요 ──
const PRODUCT = staticFile('oryun-bottle.png'); // 배경을 지운 오륜미네랄 1,000ml 병
const RATIO = 231 / 721; // 제품 이미지 가로 ÷ 세로
const MAIN = '#2F6B4A'; // 가운데 밝은 뽕잎색
const MID = '#1F4D34'; // 알프스 대표 초록
const DEEP = '#0B1F14'; // 바깥쪽 어두운 색
const GOLD = '#E2C47A'; // 라벨 금박색
const DROP = '#A9D3EE'; // 미네랄 물방울색
const BACK_WORD = 'MINERAL'; // 제품 뒤 큰 글자
const TAGLINE = ['생명의 원소, ', '오륜미네랄'];
// 수상·특허는 제품이 아니라 제조사 유디아미네랄의 이력이므로, 영상 내내 왼쪽 아래에 표기합니다.
const NOTE = '수상·특허: 제조사 유디아미네랄 보유 · 오륜미네랄은 유디아미네랄 기술로 만든 기타가공품(일반식품)';

// 양옆에서 차례로 나오는 특징 문구 (왼쪽·오른쪽 번갈아). 효능 표현은 쓰지 않습니다.
const FEATURES: {side: 'L' | 'R'; label: string; text: string}[] = [
  {side: 'L', label: '제조사 전통', text: '9대 한의 가문의 비방'},
  {side: 'R', label: '원료', text: '뽕잎 먹은 누에에서'},
  {side: 'L', label: '제조사 수상', text: '국제 발명전 금메달'},
  {side: 'R', label: '성분', text: '50여 종 바이오 미네랄'},
  {side: 'L', label: '제조사 특허', text: '발명특허 제1541516호'},
  {side: 'R', label: '루틴', text: '물·요리·쉐이크로 매일'},
];
const FIRST = 26; // 첫 문구가 나오는 프레임 (5초 기준)
const GAP = 11; // 문구 사이 간격 (5초 기준)

const H = 540; // 제품 높이(px)
const W = H * RATIO;
const TOP = 62; // 제품 윗변 위치

// 반짝이(물방울 빛) 위치: random(seed)로 고정 → 렌더할 때마다 같은 자리
const SPARKS = new Array(12).fill(0).map((_, i) => ({
  x: 0.12 + random(`sx${i}`) * 0.76,
  y: 0.1 + random(`sy${i}`) * 0.8,
  size: 10 + random(`ss${i}`) * 14,
  delay: random(`sd${i}`) * 45,
}));

// 떠오르는 미네랄 입자
const BUBBLES = new Array(18).fill(0).map((_, i) => ({
  x: random(`bx${i}`) * 1280,
  r: 3 + random(`br${i}`) * 7,
  speed: 0.8 + random(`bs${i}`) * 1.6,
  offset: random(`bo${i}`) * 720,
}));

const Sparkle = ({size, opacity}: {size: number; opacity: number}) => (
  <svg width={size} height={size} viewBox="-10 -10 20 20" style={{opacity, filter: 'drop-shadow(0 0 4px #fff)'}}>
    <path d="M0 -10 Q1 -1 10 0 Q1 1 0 10 Q-1 1 -10 0 Q-1 -1 0 -10Z" fill="#fff" />
  </svg>
);

const SceneBody = () => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: dur} = useVideoConfig();
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const k = dur / 150; // 5초 기준 등장 시점을 영상 길이에 맞춰 늘리는 배율
  const T = (n: number) => Math.round(n * k);

  // 1) 제품 등장: 아래에서 스프링으로 솟아오르며 살짝 기울어짐
  const rise = spring({frame: f - 4, fps, config: {damping: 13, mass: 1}});
  const y = interpolate(rise, [0, 1], [640, 0]);
  const tilt = interpolate(rise, [0, 1], [-14, -3]) + Math.sin(f / 20) * 1.2;
  const float = Math.sin(f / 16) * 6;

  // 2) 빛줄기 회전 + 빛 쓸기
  const rays = interpolate(f, [0, 24], [0, 1], clamp);
  const sweep2At = k > 1.5 ? T(108) : 9999; // 10초 버전은 마무리 문구 때 한 번 더 빛이 지나갑니다
  const sweep = f < sweep2At - 5 ? interpolate(f, [38, 72], [-60, 160], clamp) : interpolate(f, [sweep2At, sweep2At + 34], [-60, 160], clamp);
  const flash = interpolate(f, [20, 23, 36], [0, 0.35, 0], clamp); // 착지 순간 번쩍

  // 3) 문구: 양옆에서 차례로 미끄러져 들어오기
  const txt = (d: number) => spring({frame: f - d, fps, config: {damping: 15, mass: 0.8}});
  const tag = spring({frame: f - T(100), fps, config: {damping: 16}});
  const outro = interpolate(f, [dur - 10, dur], [0, 1], clamp); // 끝에서 어둡게 → 반복 재생이 자연스럽게

  const left = FEATURES.map((x, i) => ({...x, at: FIRST + T(i * GAP)})).filter((x) => x.side === 'L');
  const right = FEATURES.map((x, i) => ({...x, at: FIRST + T(i * GAP)})).filter((x) => x.side === 'R');

  const Feature = ({label, text, at, side}: {label: string; text: string; at: number; side: 'L' | 'R'}) => {
    const p = txt(at);
    const bar = interpolate(f, [at + 6, at + 20], [0, 1], clamp);
    return (
      <div style={{opacity: p, transform: `translateX(${(1 - p) * (side === 'L' ? -140 : 140)}px)`, textAlign: side === 'L' ? 'right' : 'left'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, justifyContent: side === 'L' ? 'flex-end' : 'flex-start'}}>
          {side === 'R' && <div style={{width: 34 * bar, height: 3, background: GOLD, borderRadius: 2}} />}
          <span style={{fontSize: 20, fontWeight: 700, color: GOLD, letterSpacing: '0.12em'}}>{label}</span>
          {side === 'L' && <div style={{width: 34 * bar, height: 3, background: GOLD, borderRadius: 2}} />}
        </div>
        <div style={{fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginTop: 4, letterSpacing: '-0.02em', textShadow: '0 6px 24px rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>{text}</div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{fontFamily: FONT, overflow: 'hidden', background: `radial-gradient(circle at 50% 50%, ${MAIN} 0%, ${MID} 42%, ${DEEP} 100%)`}}>
      {/* 회전하는 빛줄기 */}
      <AbsoluteFill style={{opacity: rays * 0.45, transform: `rotate(${f * 0.35}deg) scale(1.8)`,
        background: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(169,211,238,0.22) 0deg 6deg, transparent 6deg 18deg)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, #000 0%, transparent 42%)'}} />

      {/* 떠오르는 미네랄 입자 */}
      {BUBBLES.map((b, i) => {
        const yy = 720 - ((f * b.speed * 3 + b.offset) % 820);
        return <div key={i} style={{position: 'absolute', left: b.x, top: yy, width: b.r * 2, height: b.r * 2, borderRadius: '50%',
          border: `1.5px solid ${DROP}`, opacity: 0.35 * rays}} />;
      })}

      {/* 제품 뒤 큰 글자 */}
      <AbsoluteFill style={{alignItems: 'center', top: 150}}>
        <div style={{fontSize: 210, fontWeight: 900, letterSpacing: '0.04em', color: 'transparent', WebkitTextStroke: '2.5px rgba(255,255,255,0.22)',
          transform: `scale(${interpolate(f, [10, dur], [1.15, 1])})`, opacity: interpolate(f, [10, 30], [0, 1], clamp)}}>{BACK_WORD}</div>
      </AbsoluteFill>

      {/* 바닥 그림자 */}
      <div style={{position: 'absolute', left: 640 - 120, top: TOP + H - 18, width: 240, height: 36, borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(0,0,0,0.55), transparent)', opacity: rise}} />

      {/* 제품 + 빛 쓸기 + 반짝이 */}
      <div style={{position: 'absolute', left: 640 - W / 2, top: TOP, width: W, height: H,
        transform: `translateY(${y + float}px) rotate(${tilt}deg)`}}>
        <Img src={PRODUCT} style={{width: W, height: H, filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.5))'}} />
        <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen',
          WebkitMaskImage: `url(${PRODUCT})`, WebkitMaskSize: '100% 100%',
          background: `linear-gradient(110deg, transparent ${sweep - 18}%, rgba(255,255,255,0.8) ${sweep}%, transparent ${sweep + 18}%)`}} />
        {SPARKS.map((s, i) => {
          const t = (f - 42 - s.delay * k) / 28;
          const o = t > 0 ? Math.max(0, Math.sin(t * Math.PI)) * (t < 3 * k ? 1 : 0) : 0;
          return <div key={i} style={{position: 'absolute', left: s.x * W - s.size / 2, top: s.y * H - s.size / 2, transform: `scale(${0.4 + o})`}}>
            <Sparkle size={s.size} opacity={o} /></div>;
        })}
      </div>

      {/* 양옆 특징 문구: 왼쪽·오른쪽 번갈아 차례로 */}
      <div style={{position: 'absolute', right: 640 + W / 2 + 56, top: 150, display: 'flex', flexDirection: 'column', gap: 34}}>
        {left.map((x) => <Feature key={x.text} {...x} />)}
      </div>
      <div style={{position: 'absolute', left: 640 + W / 2 + 56, top: 150, display: 'flex', flexDirection: 'column', gap: 34}}>
        {right.map((x) => <Feature key={x.text} {...x} />)}
      </div>

      {/* 마무리 문구 */}
      <div style={{position: 'absolute', left: 0, right: 0, top: TOP + H + 24, textAlign: 'center', opacity: tag, transform: `translateY(${(1 - tag) * 24}px)`}}>
        <span style={{fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em'}}>{TAGLINE[0]}</span>
        <span style={{fontSize: 40, fontWeight: 900, color: GOLD, letterSpacing: '-0.02em'}}>{TAGLINE[1]}</span>
      </div>

      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <div style={{position: 'absolute', left: 26, bottom: 20, fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.82)'}}>{NOTE}</div>
      <AbsoluteFill style={{background: DEEP, opacity: outro}} />
    </AbsoluteFill>
  );
};

export const Scene = () => (
  <AbsoluteFill>
    <SceneBody />
  </AbsoluteFill>
);

// 배경음악을 넣은 버전 (음악: scripts/make-bgm.py 로 직접 합성한 오리지널 음원)
export const SceneWithMusic = () => (
  <AbsoluteFill>
    <Scene />
    <Audio src={staticFile('bgm-oryun-10s.wav')} />
  </AbsoluteFill>
);
