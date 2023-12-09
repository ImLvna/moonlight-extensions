import type { Patch } from "@moonlight-mod/types";

export const patches: Patch[] = [
  {
    find: /"dot"===/g,
    replace: {
      match: /"(?:username|dot)"===\i(?!\.\i)/g,
      replacement: "true"
    }
  }
];
