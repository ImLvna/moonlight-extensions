import React from "@moonlight-mod/wp/common_react";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import components from "@moonlight-mod/wp/common_components";
import { WebpackModule } from "@moonlight-mod/types";

const { Tooltip } = components;

interface Props {
  type: string;
  textValue: string;
  maxCharacterCount: number;
  showRemainingCharsAfterCount: boolean;
  className: string;
}

function getRealModule(modules: WebpackModule[]) {
  return modules.find((i) => i.id.toString().match(/\d/))?.exports;
}

module.exports.default = (props: Props) => {
  const classes = getRealModule(
    spacepack.findByCode("characterCount", "flairContainer")
  )!;

  const MAX_MESSAGE_LENGTH = getRealModule(
    spacepack.findByExports("canUseIncreasedMessageLength")
  )!.default.canUseIncreasedMessageLength(
    getRealModule(
      spacepack.findByExports("getCurrentUser")
    )!.default.getCurrentUser()
  )
    ? 4000
    : 2000;

  const showMaxChars =
    moonlight.getConfigOption<boolean>("charCount", "maxChars") ?? false;

  console.log(props.maxCharacterCount);
  return (
    <div
      className={[classes.characterCount]
        .concat(
          props.textValue.length >= MAX_MESSAGE_LENGTH - 200
            ? [classes.error]
            : []
        )
        .join(" ")}
    >
      <div className={classes.flairContainer}>
        <Tooltip
          text={`${props.textValue.length}/${MAX_MESSAGE_LENGTH} Characters`}
          position="top"
        >
          {(tooltipProps: any) => (
            <span {...tooltipProps}>
              {props.textValue.length}
              {showMaxChars && "/" + props.maxCharacterCount}
            </span>
          )}
        </Tooltip>
      </div>
    </div>
  );
};
