import { resolveSetting } from "../resolve.js";
import type { SettingsPort } from "../port.js";
import type { SettingKey, SettingRecord } from "../types.js";

/** Le minimum dont l'adaptateur a besoin : le paquet ne dépend pas du client Prisma. */
export interface SettingStore {
  setting: {
    findMany(args: {
      where: { key: string };
      orderBy: { effectiveFrom: "desc" };
    }): Promise<
      {
        key: string;
        categoryId: string | null;
        value: unknown;
        effectiveFrom: Date;
      }[]
    >;
  };
}

export type PrismaSettings = SettingsPort & {
  /** À appeler après toute écriture depuis le back-office. */
  invalidate(key?: SettingKey): void;
};

export function createPrismaSettings(
  db: SettingStore,
  options: { ttlMs?: number } = {},
): PrismaSettings {
  const ttlMs = options.ttlMs ?? 60_000;
  const cache = new Map<string, { loadedAt: number; rows: SettingRecord[] }>();

  async function rowsFor(key: SettingKey): Promise<SettingRecord[]> {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.loadedAt < ttlMs) return hit.rows;

    const found = await db.setting.findMany({
      where: { key },
      orderBy: { effectiveFrom: "desc" },
    });

    const rows: SettingRecord[] = found.map((r) => ({
      key: r.key as SettingKey,
      categoryId: r.categoryId,
      value: r.value,
      effectiveFrom: r.effectiveFrom,
    }));

    cache.set(key, { loadedAt: Date.now(), rows });
    return rows;
  }

  return {
    async get<T>(
      key: SettingKey,
      at: Date,
      categoryId: string | null = null,
    ): Promise<T> {
      const found = resolveSetting(await rowsFor(key), key, at, categoryId);
      if (!found) {
        throw new Error(`paramètre absent : ${key} au ${at.toISOString()}`);
      }
      return found.value as T;
    },

    invalidate(key?: SettingKey): void {
      if (key) cache.delete(key);
      else cache.clear();
    },
  };
}
