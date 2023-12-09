import type { ExtensionWebpackModule, Patch } from "@moonlight-mod/types";

let ERROR_CODES: Record<number, string> | undefined;
fetch(
  "https://raw.githubusercontent.com/facebook/react/17.0.2/scripts/error-codes/codes.json"
)
  .then((res) => res.json())
  .then((res) => (ERROR_CODES = res));

export const webpackModules: Record<string, ExtensionWebpackModule> = {
  decode: {
    entrypoint: true,
    run: (module, exports, require) => {
      module.exports.default = (code: number, ...args: any) => {
        let index = 0;
        return ERROR_CODES?.[code]?.replace(/%s/g, () => {
          const arg = args[index];
          index++;
          return arg;
        });
      };
    }
  }
};

export const patches: Patch[] = [
  {
    find: '"https://reactjs.org/docs/error-decoder.html?invariant="',
    replace: {
      match:
        /(function .\(.\)){(for\(var .="https:\/\/reactjs\.org\/docs\/error-decoder\.html\?invariant="\+.,.=1;.<arguments\.length;.\+\+\).\+="&args\[\]="\+encodeURIComponent\(arguments\[.\]\);return"Minified React error #"\+.\+"; visit "\+.\+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings.")}/,
      replacement: (_, func, original) =>
        `${func}{var decoded=require("reactErrorDecoder_decode").default(null, args);if(decoded)return decoded;${original}}`
    }
  }
];
