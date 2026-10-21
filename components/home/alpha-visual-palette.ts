/** Shared surface-treatment colours for the homepage line and the Alpha plant scene. */
export type AlphaVisualColors = {
  metal: number;
  polished: number;
  steelDark: number;
  railEdge: number;
  foundation: number;
  bay: number;
  glass: number;
  glassOpacity: number;
  tankBack: number;
  liquid: number;
  liquidCoat: number;
  liquidDark: number;
  hemisphere: number;
  key: number;
  rim: number;
  environment: number;
  shadowOpacity: number;
  shadowColor: number;
  contactOpacity: number;
};

const light: AlphaVisualColors = {
  metal: 0x9eb6c6,
  polished: 0xccdce7,
  steelDark: 0x5c788c,
  railEdge: 0x3e627b,
  foundation: 0xc5d9e6,
  bay: 0xa9c8db,
  glass: 0xa8dcf1,
  glassOpacity: 0.2,
  tankBack: 0xbdd5e4,
  liquid: 0x128bbd,
  liquidCoat: 0x17556b,
  liquidDark: 0,
  hemisphere: 1.65,
  key: 2.6,
  rim: 2,
  environment: 0.75,
  shadowOpacity: 0.14,
  shadowColor: 0x254962,
  contactOpacity: 0.8,
};

const dark: AlphaVisualColors = {
  metal: 0x8daec5,
  polished: 0xc2d8e9,
  steelDark: 0x496e87,
  railEdge: 0x6a9cba,
  foundation: 0x294254,
  bay: 0x4a6b80,
  glass: 0x428cb7,
  glassOpacity: 0.23,
  tankBack: 0x294e67,
  liquid: 0x207da6,
  liquidCoat: 0x194d63,
  liquidDark: 1,
  hemisphere: 1.35,
  key: 2.3,
  rim: 2.6,
  environment: 0.7,
  shadowOpacity: 0.24,
  shadowColor: 0x000914,
  contactOpacity: 0.55,
};

export function alphaVisualColors(isDark: boolean): AlphaVisualColors {
  return isDark ? dark : light;
}
