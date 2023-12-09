import { app } from "electron";

app.on("browser-window-created", (_, win) => {
  win.webContents.on("frame-created", (_, { frame }) => {
    frame.once("dom-ready", () => {
      if (frame.url.startsWith("https://open.spotify.com/embed/")) {
        frame.executeJavaScript(`
                    const original = Audio.prototype.play;
                    Audio.prototype.play = function() {
                        this.volume = ${
                          (moonlightHost.getConfigOption<number>(
                            "fixSpotifyEmbeds",
                            "volume"
                          ) ?? 10) / 100
                        };
                        console.log(this.volume);
                        return original.apply(this, arguments);
                    }
                `);
      }
    });
  });
});
