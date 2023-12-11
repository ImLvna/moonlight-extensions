import { ExtensionWebpackModule, Patch } from "@moonlight-mod/types";
import { Message, User } from "discord-types/general";

enum Mode {
  USER_NICK = "Username, Nickname",
  NICK_USER = "Nickname, Username"
}

export const styles = [
  `.smyn {
    color: var(--text-muted);
  }
  
  .smyn::before {
    content: "(";
  }
  
  .smyn::after {
    content: ")";
  }
  `
];

export const webpackModules: Record<string, ExtensionWebpackModule> = {
  render: {
    dependencies: [{ ext: "common", id: "react" }],
    entrypoint: true,
    run: (module, exports, require) => {
      const React = require("common_react");
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
