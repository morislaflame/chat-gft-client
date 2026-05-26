/** Фон-картинки в public по цене награды (совпадает с карточкой в RewardCard). */
export function getRewardBackdropSrcByPrice(price: number): string {
  if (price < 300) return '/lowp.webp';
  if (price < 1000) return '/midp.webp';
  if (price < 5000) return '/gp.webp';
  if (price < 10000) return '/gold.webp';
  if (price < 50000) return '/lp.webp';
  return '/rarep.webp';
}

/**
 * Те же .webp, что у наград: фон профиля по типу артефакта (как были цветные «ауры» на карточке).
 */
export function getArtifactBackdropSrcByBoostType(boostType: string | undefined): string {
  switch (boostType) {
    case 'WEAPON':
      return '/lowp.webp';
    case 'ARMOR':
      return '/midp.webp';
    case 'TRINKET':
      return '/gp.webp';
    case 'KEY':
      return '/gold.webp';
    case 'HELPER':
      return '/rarep.webp';
    default:
      return '/lp.webp';
  }
}
