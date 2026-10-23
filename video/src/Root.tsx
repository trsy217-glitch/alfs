import {Composition} from 'remotion';
import {Scene, SceneWithMusic} from './OryunPromo';

// 같은 장면을 길이만 다르게 등록합니다 (30fps 가로 영상)
export const RemotionRoot = () => (
  <>
    <Composition id="OryunPromo10Music" component={SceneWithMusic} durationInFrames={300} fps={30} width={1280} height={720} />
    <Composition id="OryunPromo10" component={Scene} durationInFrames={300} fps={30} width={1280} height={720} />
    <Composition id="OryunPromo" component={Scene} durationInFrames={150} fps={30} width={1280} height={720} />
  </>
);
