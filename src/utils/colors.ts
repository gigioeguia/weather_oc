const COLOR_ENABLED = !process.env.NO_COLOR;

export const ANSI = {
  cyan: (text: string) => (COLOR_ENABLED ? `\x1b[36m${text}\x1b[0m` : text),
  yellow: (text: string) => (COLOR_ENABLED ? `\x1b[33m${text}\x1b[0m` : text),
  green: (text: string) => (COLOR_ENABLED ? `\x1b[32m${text}\x1b[0m` : text),
  red: (text: string) => (COLOR_ENABLED ? `\x1b[31m${text}\x1b[0m` : text),
};
