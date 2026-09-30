// tests/contract.ts — écrite une fois, exécutée contre chaque adaptateur
import { describe, expect, it } from "vitest";
import { SETTING_KEYS } from "../src/index.js";
import type { SettingsPort, SettingRecord } from "../src/index.js";

const key = SETTING_KEYS.antiSnipingWindowMin;
const d = (s: string) => new Date(s);

export const FIXTURE: SettingRecord[] = [
  { key, categoryId: null, value: 3, effectiveFrom: d("2026-01-01") },
  { key, categoryId: null, value: 5, effectiveFrom: d("2026-06-01") },
  { key, categoryId: "auto", value: 10, effectiveFrom: d("2026-03-01") },
];

export function runSettingsContract(
  name: string,
  makePort: () => Promise<SettingsPort>,
): void {
  describe(`contrat SettingsPort — ${name}`, () => {
    it("sert la valeur en vigueur à la date demandée", async () => {
      const port = await makePort();
      await expect(port.get(key, d("2026-03-15"))).resolves.toBe(3);
      await expect(port.get(key, d("2026-09-30"))).resolves.toBe(5);
    });

    it("fait primer la catégorie sur le global", async () => {
      const port = await makePort();
      await expect(port.get(key, d("2026-09-30"), "auto")).resolves.toBe(10);
    });

    it("retombe sur le global pour une catégorie sans valeur", async () => {
      const port = await makePort();
      await expect(port.get(key, d("2026-09-30"), "immobilier")).resolves.toBe(5);
    });

    it("échoue avant la première date d'effet", async () => {
      const port = await makePort();
      await expect(port.get(key, d("2025-12-31"))).rejects.toThrow();
    });
  });
}
