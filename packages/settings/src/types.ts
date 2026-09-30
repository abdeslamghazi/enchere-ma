export const SETTING_KEYS = {
  bidStepScale: "bid_step_scale",
  antiSnipingWindowMin: "anti_sniping_window_min",
  antiSnipingExtensionMin: "anti_sniping_extension_min",
  lateAcceptanceHours: "late_acceptance_hours",
  secondBidderOfferHours: "second_bidder_offer_hours",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export type SettingRecord = {
  readonly key: SettingKey;
  readonly categoryId: string | null;   // null = portée globale
  readonly value: unknown;
  readonly effectiveFrom: Date;
};
