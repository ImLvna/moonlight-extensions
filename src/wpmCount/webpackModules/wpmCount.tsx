import React from "@moonlight-mod/wp/common_react";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";
import components from "@moonlight-mod/wp/common_components";
import { WebpackModule } from "@moonlight-mod/types";

const { Tooltip } = components;

enum Type {
  WPM = "WPM",
  CPM = "CPM",
  CPS = "CPS"
}

const type = moonlight.getConfigOption<Type>("wpmCount", "type") ?? Type.WPM;
const refreshInterval =
  moonlight.getConfigOption<number>("wpmCount", "refreshInterval") ?? 250;

interface Props {
  type: string;
  textValue: string;
  maxCharacterCount: number;
  showRemainingCharsAfterCount: boolean;
  className: string;
}

let times: number[] = [];

let cps = 0;

let lastLength = 0;

setInterval(() => {
  times = times.filter((t) => Date.now() - t < 3000);
  if (times.length === 0) return (cps = 0);
  const newTimes: number[] = [];
  // Turn timestamps into periods between them
  for (let i = 1; i < times.length; i++) {
    newTimes.push(times[i] - times[i - 1]);
  }
  newTimes.push(Date.now() - times[times.length - 1]);
  // average the periods
  const averageBetweenChar =
    newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
  // characters per second
  cps = 1000 / averageBetweenChar;
}, 25);

module.exports.default = (props: Props) => {
  const classes = spacepack
    .findByCode("characterCount", "flairContainer")
    .find((i: WebpackModule) => i.id.toString().match(/\d/)).exports;

  if (props.textValue.length > 0 && props.textValue.length > lastLength)
    times.push(Date.now());
  lastLength = props.textValue.length;
  function getData(cps: number) {
    let data = 0;
    switch (type) {
      case Type.WPM:
        data = (cps * 60) / 5;
        break;
      case Type.CPM:
        data = cps * 60;
        break;
      case Type.CPS:
        data = cps;
    }
    return Math.round(data * 10) / 10;
  }

  const [data, setData] = React.useState(getData(cps));
  React.useEffect(() => {
    const interval = setInterval(() => {
      setData(getData(cps));
    }, refreshInterval);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      {!Number.isNaN(data) && data > 0 && (
        <div className={classes.characterCount}>
          <div className={classes.flairContainer}>
            <Tooltip text={`${data} ${type}`} position="top">
              {(tooltipProps: any) => <span {...tooltipProps}>{data}</span>}
            </Tooltip>
          </div>
        </div>
      )}
    </>
  );
};
