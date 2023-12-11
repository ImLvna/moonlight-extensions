import type { Patch } from "@moonlight-mod/types";

export const patches: Patch[] = [
  {
    find: "showCommunicationDisabledStyles",
    replace: {
      match:
        /&&\i\.\i\.canManageUser\(\i\.\i\.MODERATE_MEMBERS,\i\.author,\i\)/,
      replacement: ""
    }
  }
];
