import * as fs from "fs";
import { session, app } from "electron";
import { join } from "path";

app.on("ready", () => {
  const path = moonlightHost.getConfigOption<string>(
    "chromeExtensions",
    "path"
  );

  const logger = moonlightHost.getLogger("extensions");

  if (!path || !fs.existsSync(path)) {
    logger.error(`${path} doesn't exist`);
  } else {
    fs.readdirSync(path).forEach((dir) => {
      session.defaultSession.loadExtension(join(path, dir));
    });
  }
});
