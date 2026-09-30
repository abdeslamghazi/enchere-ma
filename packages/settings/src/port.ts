import type { SettingKey } from "./types.js";

export interface SettingsPort {
  /** Lit la valeur applicable à `at`. Jamais « maintenant » implicite. */
  get<T>(key: SettingKey, at: Date, categoryId?: string | null): Promise<T>;
}
