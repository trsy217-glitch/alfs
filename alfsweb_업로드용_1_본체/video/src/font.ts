import {continueRender, delayRender, staticFile} from 'remotion';

// Pretendard (SIL Open Font License) — public/fonts 에 들어 있어 렌더할 때 인터넷이 필요 없습니다.
export const FONT = "'Pretendard', 'Noto Sans CJK KR', sans-serif";

const WEIGHTS: [string, number][] = [['SemiBold', 600], ['Bold', 700], ['ExtraBold', 800], ['Black', 900]];

if (typeof document !== 'undefined' && !document.getElementById('pretendard-faces')) {
  const handle = delayRender('Pretendard 폰트 불러오기');
  const style = document.createElement('style');
  style.id = 'pretendard-faces';
  style.textContent = WEIGHTS.map(([name, w]) =>
    `@font-face{font-family:'Pretendard';font-weight:${w};font-style:normal;src:url('${staticFile(`fonts/Pretendard-${name}.woff2`)}') format('woff2');}`
  ).join('\n');
  document.head.appendChild(style);
  Promise.all(WEIGHTS.map(([, w]) => document.fonts.load(`${w} 40px Pretendard`, '오륜미네랄')))
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
}
