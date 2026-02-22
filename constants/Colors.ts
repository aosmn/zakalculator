const tintColorLight = '#0E7A6E'; // darker teal for contrast on light backgrounds
const tintColorDark  = '#2BBFAD'; // bright teal for dark backgrounds

export default {
  light: {
    text: '#1A3A5C',         // deep navy
    background: '#F4F1EC',   // warm off-white (inner circle cream)
    tint: tintColorLight,
    tabIconDefault: '#5A7080',   // readable slate on cream background
    tabIconSelected: tintColorLight,
    success: '#0E7A6E',      // darker teal
    danger: '#EF4444',
    warning: '#C9922A',      // gold from coins & logo text
    muted: '#7A8EA0',
    card: '#EDE8DF',         // warm cream
    border: '#DDD7CB',
    chrome: '#7A5018',       // dark gold (gradient start)
    chromeText: '#F5EDD5',   // cream text on dark gold
  },
  dark: {
    text: '#F5EDD5',         // warm cream
    background: '#0F2535',   // deep navy (darker than logo bg)
    tint: tintColorDark,
    tabIconDefault: '#4A6878',
    tabIconSelected: tintColorDark,
    success: '#2BBFAD',      // bright teal
    danger: '#EF4444',
    warning: '#C9922A',      // gold
    muted: '#7A93A8',
    card: '#172F44',         // slightly lighter navy
    border: '#243D52',
    chrome: '#0F2535',       // same as background — seamless on dark
    chromeText: '#F5EDD5',
  },
};
