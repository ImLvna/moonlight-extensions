import type { ExtensionWebpackModule, Patch } from "@moonlight-mod/types";

export const webpackModules: Record<string, ExtensionWebpackModule> = {
  quote: {
    entrypoint: true,
    run: (module, exports, require) => {
      module.exports.default = () => {
        const quotes = moonlight.getConfigOption<string[]>(
          "loadingQuotes",
          "quotes"
        );
        if (quotes && quotes.length > 0) {
          return quotes[Math.floor(Math.random() * quotes.length)];
        } else return "Set some quotes in the settings!";
      };
    }
  }
};

export const patches: Patch[] = [
  {
    find: ".LOADING_DID_YOU_KNOW}",
    replace: [
      {
        match: "._loadingText=function(){",
        replacement: '$&return require("loadingQuotes_quote").default();'
      },
      {
        match: "._eventLoadingText=function(){",
        replacement: '$&return require("loadingQuotes_quote").default();'
      }
    ]
  }
];
