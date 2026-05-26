/** Публичные картинки фона как на BoxCard: S / M / L по фрагменту названия. */
export function getCaseBoxBackdropSrc(nameForSize: string): string {
  const n = nameForSize.toUpperCase();
  if (/\bS\b/.test(n) || n.endsWith(' S')) return '/box-s3.webp';
  if (/\bL\b/.test(n) || n.endsWith(' L')) return '/box-l3.webp';
  return '/box-m3.webp';
}
