import type { Project, Status } from "./types";

export const CARD_COLORS = ["#ffd23f", "#8ec5ff", "#ff90e8", "#b6f2a0", "#ff9b5e"] as const;
export const FEATURED_ROTATION = [-1.2, 1, 1.2, -1] as const;

export const cardColor = (i: number) => CARD_COLORS[i % CARD_COLORS.length];
export const pad2 = (i: number) => String(i + 1).padStart(2, "0");

export const statusOf = (p: Pick<Project, "homepage" | "days">): Status =>
  p.homepage ? "Deployed" : p.days < 30 ? "Active" : "Dormant";

export const stripeArt = (color: string) =>
  `repeating-linear-gradient(45deg, ${color}55 0 14px, #fff 14px 28px)`;

export const HEAT_OPACITY = [0.15, 0.35, 0.55, 0.78, 1] as const;
