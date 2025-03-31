export const colorReg = /#[0-9A-Fa-f]{3,8}\b|rgb\s*\(\s*[0-9.,\s]+\)|rgba\s*\(\s*[0-9.,\s]+\)/g;

export const rgbReg = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*(\d+(\.\d+)?|\.\d+))?\s*\)$/;

export const hexReg = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
