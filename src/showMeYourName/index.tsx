import { ExtensionWebpackModule, Patch } from "@moonlight-mod/types";
import { Message, User } from "discord-types/general";
import style from "./style.css";
import React from "@moonlight-mod/wp/common_react";

// BLOCKING: Wait for kasi to impliment style loading
export const styles = [style];

enum Mode {
  USER_NICK = "Username, Nickname",
  NICK_USER = "Nickname, Username"
}

export const webpackModules: Record<string, ExtensionWebpackModule> = {
  render: {
    entrypoint: true,
    run: (module, exports, require) => {
      module.exports.default = ({
        author,
        message,
        isRepliedMessage,
        withMentionPrefix,
        userOverride
      }: {
        author: { nick: string };
        message: Message;
        withMentionPrefix?: boolean;
        isRepliedMessage: boolean;
        userOverride?: User;
      }) => {
        try {
          const user = userOverride ?? message.author;
          let { username } = user;
          if (
            moonlight.getConfigOption<boolean>(
              "showMeYourName",
              "displayNames"
            ) ??
            false
          )
            username = (user as any).globalName || username;

          const { nick } = author;
          const prefix = withMentionPrefix ? "@" : "";
          if (username === nick || isRepliedMessage) return prefix + nick;
          const mode =
            moonlight.getConfigOption<Mode>("showMeYourName", "mode") ??
            Mode.USER_NICK;
          if (mode === Mode.USER_NICK)
            return (
              <>
                {prefix}
                {username} <span className="smyn">{nick}</span>
              </>
            );
          if (mode === Mode.NICK_USER) {
            return (
              <>
                {prefix}
                {nick} <span className="smyn">{username}</span>
              </>
            );
          }
          return prefix + username;
        } catch {
          return author?.nick;
        }
      };
    }
  }
};

export const patches: Patch[] = [
  {
    find: ".useCanSeeRemixBadge)",
    replace: {
      match: /(?<=onContextMenu:\i,children:).*?\}/,
      replacement: 'require("showMeYourName_render").default(arguments[0])}'
    }
  }
];
