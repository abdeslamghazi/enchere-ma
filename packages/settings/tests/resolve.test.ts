import { describe, expect, it } from "vitest";
import { resolveSetting, SETTING_KEYS } from "../src/index.js";

const d = (s: string) => new Date(s);
const key = SETTING_KEYS.antiSnipingWindowMin;

const records = [
  { key, categoryId: null, value: 3, effectiveFrom: d("2026-01-01") },
  { key, categoryId: null, value: 5, effectiveFrom: d("2026-06-01") },
  { key, categoryId: "auto", value: 10, effectiveFrom: d("2026-03-01") },
];

describe("resolveSetting", () => {
  it("ignore une valeur pas encore en vigueur", () => {
    expect(resolveSetting(records, key, d("2026-03-15"))?.value).toBe(3);
  });

  it("prend la plus récente parmi celles en vigueur", () => {
    expect(resolveSetting(records, key, d("2026-09-30"))?.value).toBe(5);
  });

  it("fait primer la catégorie sur le global", () => {
    expect(resolveSetting(records, key, d("2026-09-30"), "auto")?.value).toBe(10);
  });

  it("retombe sur le global si la catégorie n'a pas de valeur", () => {
    expect(resolveSetting(records, key, d("2026-09-30"), "immobilier")?.value).toBe(5);
  });

  it("ne rend rien avant la première date d'effet", () => {
    expect(resolveSetting(records, key, d("2025-12-31"))).toBeUndefined();
  });
});
