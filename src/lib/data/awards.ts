import type { AwardData } from '@/lib/types';
import goldenBallData from '@/data/awards/golden-ball.json';
import goldenBootData from '@/data/awards/golden-boot.json';
import goldenGloveData from '@/data/awards/golden-glove.json';

export function getGoldenBall(): AwardData {
  return goldenBallData as unknown as AwardData;
}

export function getGoldenBoot(): AwardData {
  return goldenBootData as unknown as AwardData;
}

export function getGoldenGlove(): AwardData {
  return goldenGloveData as unknown as AwardData;
}

export function getAllAwards(): { goldenBall: AwardData; goldenBoot: AwardData; goldenGlove: AwardData } {
  return {
    goldenBall: getGoldenBall(),
    goldenBoot: getGoldenBoot(),
    goldenGlove: getGoldenGlove(),
  };
}
