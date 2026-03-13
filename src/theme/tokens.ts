import { TextStyle } from "react-native";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999
};

export const typography: Record<string, TextStyle> = {
  h1: { fontSize: 28, fontWeight: "700", lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: "700", lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: "600", lineHeight: 24 },
  body: { fontSize: 15, fontWeight: "400", lineHeight: 22 },
  label: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: "500", lineHeight: 18 }
};
