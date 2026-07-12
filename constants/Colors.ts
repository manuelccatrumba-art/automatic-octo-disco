// Paleta Love Alarm — fundo escuro tipo "app de namoro à noite", coração vivo em vermelho/rosa.
export const Colors = {
  bg: '#0A0510',
  bgElevated: '#150C22',
  card: '#1D1230',
  cardBorder: '#2E1F45',
  heart: '#FF3B6F',
  heartGlow: '#FF6B9A',
  heartDim: '#5C2A45',
  accent: '#FF3B6F',
  accentSoft: '#FF3B6F22',
  text: '#F5EFFA',
  textMuted: '#9C8DB5',
  textFaint: '#6A5C82',
  success: '#4ADE80',
  danger: '#FF5C5C',
  gold: '#FFD166',
} as const;

export type ColorName = keyof typeof Colors;
