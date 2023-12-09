import type { Patch } from "@moonlight-mod/types";

export const patches: Patch[] = [
  {
    find: ".Messages.BOT_CALL_IDLE_DISCONNECT_2",
    replace: {
      match:
        /function \i\(\)\{(?=.{0,20}if.{0,40}getCurrentClientVoiceChannelId)/,
      replacement: "$&return;"
    }
  }
];
