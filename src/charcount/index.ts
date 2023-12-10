import { Patch } from "@moonlight-mod/types";

enum Style {
  Float = "Float",
  Lock = "Locked to bottom"
}

const style =
  moonlight.getConfigOption<Style>("charCount", "style") ?? Style.Float;

export const styles = [
  `[class*="characterCount_"] {
  ${style === Style.Float ? "top: -30px;" : "bottom: unset !important;"}
}`
];

export const patches: Patch[] = [
  {
    find: "psellLongMessages&&",
    replace: [
      {
        match: /((\i)=null!=(\i)\?\3:\i.*?\i=)\2-/,
        replacement: "$1"
      },
      {
        match: /null!=\i.upsellLongMessages&&!/,
        replacement: "false && $&"
      },
      {
        match: /null!=\i.upsellLongMessages&&\(/,
        replacement: "false && $&"
      },
      {
        match: /((\i\.MAX_MESSAGE_LENGTH).*\.error\]:\i)<0/,
        replacement: "$1>$2"
      },
      {
        match: /(\i=)\i>\i/,
        replacement: "$1false"
      },
      {
        match: /\i&&\i>=0\?/,
        replacement: "false ?"
      },
      {
        match: /return \i\?\((.*):null}}/,
        replacement: "return ($1}}"
      }
    ]
  }
];
