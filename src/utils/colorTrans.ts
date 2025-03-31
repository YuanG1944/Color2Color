// #RGB        // 三值语法
// #RGBA       // 四值语法
// #RRGGBB     // 六值语法

import { hexReg, rgbReg } from './regex';

// #RRGGBBAA   // 八值语法
export function isHexColor(str: string): boolean {
  return hexReg.test(str);
}

export function isRgbColor(str: string): boolean {
  return rgbReg.test(str);
}

export function hexToRgb(hex: string): string {
  // 先去掉 #
  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    const r = hex.charAt(0);
    const g = hex.charAt(1);
    const b = hex.charAt(2);
    hex = r + r + g + g + b + b;
  } else if (hex.length === 4) {
    const r = hex.charAt(0);
    const g = hex.charAt(1);
    const b = hex.charAt(2);
    const a = hex.charAt(3);
    hex = r + r + g + g + b + b + a + a;
  }

  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseInt(hex.slice(6, 8), 16) / 255; // 转成 0~1
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  }

  return '';
}

export function rgbToHex(rgb: string): string {
  const regex = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*(\d+(\.\d+)?|\.\d+))?\s*\)/;
  const match = rgb.match(regex);
  if (!match) {
    return '';
  }

  const r = Math.min(255, parseInt(match[1], 10));
  const g = Math.min(255, parseInt(match[2], 10));
  const b = Math.min(255, parseInt(match[3], 10));

  // 判断是否有 alpha
  let hex = toHex(r) + toHex(g) + toHex(b);
  if (match[5]) {
    // match[5] 可能类似 "0.5"
    const alphaFloat = parseFloat(match[5]);
    const alpha = Math.round(alphaFloat * 255);
    hex += toHex(alpha);
  }

  return '#' + hex;
}
export function toHex(num: number) {
  const hex = num.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}
