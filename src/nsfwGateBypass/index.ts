import type { Patch } from "@moonlight-mod/types";

export const patches: Patch[] = [
  {
    find: ".nsfwAllowed=null",
    replace: {
      match: /(\w+)\.nsfwAllowed=/,
      replacement: "$1.nsfwAllowed=true;"
    }
  }
];
