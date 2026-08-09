import type {
  InvestmentCategoryKey,
  InvestmentExplorerStatus,
} from "@financial-companion/contracts";
import type { AppIconName } from "@/components/app-icon";
import { colors } from "@/theme/colors";

export const investmentExplorerEnabled =
  process.env.EXPO_PUBLIC_INVESTMENT_EXPLORER_ENABLED !== "false";

export const categoryUi: Record<
  InvestmentCategoryKey,
  { icon: AppIconName; accent: string; soft: string }
> = {
  fixed_deposits: {
    icon: "lock.fill",
    accent: colors.blue,
    soft: colors.blueSoft,
  },
  government_savings: {
    icon: "building.columns.fill",
    accent: colors.limeDeep,
    soft: colors.lime,
  },
  bonds: {
    icon: "doc.text.fill",
    accent: colors.amber,
    soft: colors.amberSoft,
  },
  diversified_mutual_funds: {
    icon: "square.stack.3d.up.fill",
    accent: colors.primaryDeep,
    soft: colors.primarySoft,
  },
  equity_stock_learning: {
    icon: "chart.line.uptrend.xyaxis",
    accent: colors.danger,
    soft: colors.pinkSoft,
  },
  gold: {
    icon: "circle.fill",
    accent: colors.amber,
    soft: colors.lime,
  },
  reits: {
    icon: "building.2.fill",
    accent: colors.primaryDeep,
    soft: colors.primarySoft,
  },
  direct_real_estate: {
    icon: "house.fill",
    accent: colors.blue,
    soft: colors.skySoft,
  },
};

export const explorerStatusUi: Record<
  InvestmentExplorerStatus,
  { label: string; accent: string; soft: string; order: number }
> = {
  ready_to_learn: {
    label: "Ready to learn",
    accent: colors.success,
    soft: colors.successSoft,
    order: 0,
  },
  explore_with_caution: {
    label: "Explore with caution",
    accent: colors.amber,
    soft: colors.amberSoft,
    order: 1,
  },
  foundation_first: {
    label: "Foundation first",
    accent: colors.primaryDeep,
    soft: colors.primarySoft,
    order: 2,
  },
};

export const formatHorizon = (years: number) => {
  if (years < 1) return "Under 1 year";
  if (years === 1) return "1 year";
  return `${years.toFixed(years % 1 === 0 ? 0 : 1)} years`;
};
