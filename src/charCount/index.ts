import {
  ExtensionWebpackModule,
  Patch,
  PatchReplaceType
} from "@moonlight-mod/types";

enum Style {
  Float = "Float",
  Lock = "Locked to bottom"
}
enum Side {
  Left = "Left",
  Right = "Right"
}

const style =
  moonlight.getConfigOption<Style>("charCount", "style") ?? Style.Float;

const side = moonlight.getConfigOption<Side>("charCount", "side") ?? Side.Right;

export const styles = [
  `[class*="characterCount_"] {
  ${style === Style.Float ? "top: -30px;" : "bottom: unset !important;"}
  ${side === Side.Left ? "right: unset !important;" : ""}
}`
];

export const webpackModules: Record<string, ExtensionWebpackModule> = {
  charCount: {
    dependencies: [
      { ext: "common", id: "react" },
      { ext: "common", id: "components" },
      { ext: "spacepack", id: "spacepack" }
    ]
  }
};

export const patches: Patch[] = [
  {
    find: "upsellLongMessages&&",
    replace: [
      {
        type: PatchReplaceType.Module,
        replacement: () => (module, exports, require) => {
          module.exports.default = require("charCount_charCount").default;
        }
      }
    ]
  }
];
