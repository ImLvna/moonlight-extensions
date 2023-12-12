import { ExtensionWebpackModule, Patch } from "@moonlight-mod/types";

export const webpackModules: Record<string, ExtensionWebpackModule> = {
  typingIndicator: {
    dependencies: [
      { ext: "common", id: "react" },
      { ext: "common", id: "components" },
      { ext: "common", id: "stores" },
      { ext: "common", id: "flux" },
      { ext: "spacepack", id: "spacepack" }
    ]
  }
};

export const patches: Patch[] = [
  {
    find: "UNREAD_IMPORTANT:",
    replace: [
      {
        // im so sorry for this regex
        match:
          /channel:(\i),guild:\i,hasActiveThreads.{0,100}\i.channelEmoji.{0,200}aria-hidden.{0,100}className:\i.children,children:\i\}\):null/,
        replacement:
          '$&,require("typingIndicator_typingIndicator").default($1.id)'
      }
    ]
  }
];
