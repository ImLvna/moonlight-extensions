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

let chars = 0;

let lastLength = 0;

module.exports.default = (props: Props) => {
  const classes = spacepack
    .findByCode("characterCount", "flairContainer")
    .find((i: WebpackModule) => i.id.toString().match(/\d/)).exports;

  const length = props.textValue.length;
  if (length > 0) {
    if (length > lastLength) {
      const diff = length - lastLength;
      chars += diff;
      setTimeout(() => {
        chars = chars - diff < 0 ? 0 : chars - diff;
      }, 1000);
    }
  } else {
    chars = 0;
  }
  lastLength = length;

  const [wpm, setWpm] = React.useState((chars / 5) * 60);
  console.log(chars);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setWpm((chars / 5) * 60);
      console.log(chars);
    }, 100);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className={classes.characterCount}>
      <div className={classes.flairContainer}>
        <Tooltip text={`${wpm} WPM`} position="top">
          {(tooltipProps: any) => <span {...tooltipProps}>{wpm}</span>}
        </Tooltip>
      </div>
    </div>
  );
};
