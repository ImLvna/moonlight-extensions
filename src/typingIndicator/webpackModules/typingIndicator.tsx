import { Store } from "@moonlight-mod/types/src/discord/common/Flux";
import React from "@moonlight-mod/wp/common_react";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import components from "@moonlight-mod/wp/common_components";
import { User } from "discord-types/general";
const {
  Dots,
  Tooltip
}: {
  Dots: React.ComponentType<{
    dotRadius: number;
    themed: boolean;
  }>;
  Tooltip: React.ComponentClass<any, any>;
} = components as any;

// Importing and requiring common_flux give different results, only requiring has useStateFromStores
const { useStateFromStores } = spacepack.require("common_flux");

interface TypingStore extends Store<any> {
  getTypingUsers(channelId: string): Record<string, number>;
}
interface UserStore extends Store<any> {
  getCurrentUser(): User;
}

const {
  TypingStore: typingStore,
  UserStore: userStore
}: { TypingStore: TypingStore; UserStore: UserStore } =
  spacepack.require("common_stores");

module.exports.default = (channelId: string) => {
  const typingUsers = useStateFromStores([typingStore], () => ({
    ...typingStore.getTypingUsers(channelId)
  }));

  const realUsers = Object.keys(typingUsers).filter(
    (id) => id !== userStore.getCurrentUser().id
  ).length;
  if (realUsers === 0) return null;

  return (
    <Tooltip text={realUsers + " Users Typing"}>
      {(props: any) => (
        <div
          {...props}
          style={{
            marginLeft: 6,
            height: 16,
            display: "flex",
            alignItems: "center"
          }}
        >
          <Dots dotRadius={3} themed={true}></Dots>
        </div>
      )}
    </Tooltip>
  );
};
