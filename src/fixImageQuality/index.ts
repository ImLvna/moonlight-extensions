import { Patch } from "@moonlight-mod/types";

export const patches: Patch[] = [
  {
    find: "handleImageLoad=",
    replace: {
      match: /(?<=getSrc\(\i\){.+?format:)\i/,
      replacement: "null"
    }
  }
];
