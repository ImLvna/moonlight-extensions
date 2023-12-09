import type { Patch } from "@moonlight-mod/types";

export const patches: Patch[] = [
  {
    find: "/\\.gif($|\\?|#)/i",
    replace: {
      match: "/\\.gif($|\\?|#)/i",
      replacement: "/\\.(gif|png|jpe?g|webp|mp4|mov)($|\\?|#)/i"
    }
  }
];
