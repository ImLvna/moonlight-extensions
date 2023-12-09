import type { Patch } from "@moonlight-mod/types";

export const patches: Patch[] = [
  {
    find: ',"f1"],comboKeysBindGlobal:',
    replace: {
      match: ',"f1"],comboKeysBindGlobal:',
      replacement: "],comboKeysBindGlobal:"
    }
  }
];
