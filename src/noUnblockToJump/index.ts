import type { Patch } from "@moonlight-mod/types";

export const patches: Patch[] = [
  {
    find: '.id,"Search Results"',
    replace: {
      match: /if\(.{1,10}\)(.{1,10}\.show\({.{1,50}UNBLOCK_TO_JUMP_TITLE)/,
      replacement: "if(false)$1"
    }
  },
  {
    find: "renderJumpButton()",
    replace: {
      match: /if\(.{1,10}\)(.{1,10}\.show\({.{1,50}UNBLOCK_TO_JUMP_TITLE)/,
      replacement: "if(false)$1"
    }
  },
  {
    find: "flash:!0,returnMessageId",
    replace: {
      match: /.\?(.{1,10}\.show\({.{1,50}UNBLOCK_TO_JUMP_TITLE)/,
      replacement: "false?$1"
    }
  }
];
