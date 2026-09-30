import type { SettingKey, SettingRecord } from "./types.js";

/**
 * Valeur applicable pour `key` à l'instant `at`.
 * Une valeur de catégorie l'emporte sur la valeur globale.
 * Entre deux valeurs applicables, la plus récente gagne.
 */
export function resolveSetting(
  records: readonly SettingRecord[],
  key: SettingKey,
  at: Date,
  categoryId: string | null = null,
): SettingRecord | undefined {
  const applicables = records
    .filter((r) => r.key === key && r.effectiveFrom <= at)
    .filter((r) => r.categoryId === categoryId || r.categoryId === null);

  if (applicables.length === 0) return undefined;

  return applicables.sort((a, b) => {
    const scopeA = a.categoryId === null ? 0 : 1;
    const scopeB = b.categoryId === null ? 0 : 1;
    if (scopeA !== scopeB) return scopeB - scopeA;          // catégorie d'abord
    return b.effectiveFrom.getTime() - a.effectiveFrom.getTime();
  })[0];
}
