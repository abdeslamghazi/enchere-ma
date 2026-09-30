import { resolveSetting } from "../resolve.js";
import type { SettingsPort } from "../port.js";
import type { SettingKey, SettingRecord } from "../types.js";

export type MemorySettings = SettingsPort & {
  /** Ajoute une valeur — comme en base, on n'écrase pas. */
  add(record: SettingRecord): void;
};

export function createMemorySettings(
  initial: readonly SettingRecord[] = [],
): MemorySettings {
  let store: SettingRecord[] = [...initial];

  return {
    async get<T>(
      key: SettingKey,
      at: Date,
      categoryId: string | null = null,
    ): Promise<T> {
      const found = resolveSetting(store, key, at, categoryId);
      if (!found) {
        throw new Error(`paramètre absent : ${key} au ${at.toISOString()}`);
      }
      return found.value as T;
    },

    add(record: SettingRecord): void {
      store = [...store, record];
    },
  };
}
