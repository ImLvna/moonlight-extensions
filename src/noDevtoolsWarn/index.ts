import {
  Patch,
  PatchReplaceType,
  WebpackRequireType
} from "@moonlight-mod/types";

export const patches: Patch[] = [
  {
    find: "devtools-opened",
    replace: {
      type: PatchReplaceType.Module,
      replacement: () => (_: any, exports: any) => {
        exports.default = () => {};
      }
    }
  }
];
