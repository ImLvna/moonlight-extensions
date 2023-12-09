import { Patch, PatchReplace, PatchReplaceType } from "@moonlight-mod/types";
import { app } from "electron";

declare global {
  interface Window {
    System: {
      register: (
        name: string,
        deps: string[] | AnyFunc,
        fn: AnyFunc | undefined
      ) => void;
      instantiate: (name: string, fn: AnyFunc) => Promise<[string, AnyFunc]>;
    };
    __SENTRY_DEBUG__: boolean;
    CC_EDITOR: boolean;
  }
}

type AnyFunc = (...args: any[]) => any;

interface originalFunc {
  original: (...args: any[]) => any;
}

const entrypoint = async () => {
  console.log("PuttPartyMod started");
  while (!document.getElementById("iframe-container"))
    await new Promise((r) => setTimeout(r, 1));
  while (
    !(
      document.getElementById("iframe-container") as HTMLIFrameElement
    ).contentWindow!.window.location.href.includes("index.html")
  )
    await new Promise((r) => setTimeout(r, 1));
  const frame = (
    document.getElementById("iframe-container") as HTMLIFrameElement
  ).contentWindow!;

  function entry() {
    const loglevel = 1;

    let systemjs: typeof window.System;

    let hasPatched = false;

    const patches: Patch[] = [
      {
        find: "cc.game.onPostSubsystemInitDelegate.add",
        replace: [
          {
            match: /this\.showFPS = false/,
            replacement: "this.showFPS = true"
          },
          {
            match: /debugMode: false/,
            replacement: "debugMode: true"
          }
        ]
      },
      {
        find: "55f273vuANKAasShcLrE2gS",
        replace: {
          match: /this\.debug = !1/,
          replacement: "this.debug = !0"
        }
      }
    ];

    // The game checks for this and disables debug mode if it doesnt exist
    window.__SENTRY_DEBUG__ = true;
    // The game doesnt send logs if running in the cocos editor
    window.CC_EDITOR = true;

    function patchSystemjs() {
      let registerIndex = 0;
      const handleRegister: typeof window.System.register & originalFunc = (
        name,
        deps,
        fn
      ) => {
        registerIndex++;
        if (loglevel > 1) console.log("register", name, deps, fn);

        if (typeof deps === "function") {
          fn = deps;
        }

        let code = fn!.toString();

        for (const patch of patches) {
          let matched = false;
          if (typeof patch.find === "string") {
            matched = code.includes(patch.find);
          } else {
            matched = patch.find.test(code);
          }
          if (matched) {
            if (loglevel > 1) console.log("patching", patch.find);
            function patchCode(replacement: PatchReplace) {
              if (replacement.type === PatchReplaceType.Module) return;
              code = code.replace(
                replacement.match,
                replacement.replacement as string
              );
            }

            if (Array.isArray(patch.replace)) {
              for (const replacement of patch.replace) {
                patchCode(replacement);
              }
            } else {
              patchCode(patch.replace);
            }
          }
        }

        fn = (0, eval)(
          `//SystemJS Module ${name}\n(${code})\n//# sourceURL=SystemModule${
            name || registerIndex
          }`
        );

        if (typeof deps === "function") {
          deps = fn!;
          fn = undefined;
        }

        return handleRegister.original.call(window.System!, name, deps, fn);
      };

      const handleInstantiate: typeof window.System.instantiate &
        originalFunc = async (name: string, fn: (...args: any[]) => any) => {
        if (loglevel > 1) console.log("instantiate", name, fn);
        const res = await handleInstantiate.original.call(
          window.System!,
          name,
          fn
        );
        if (loglevel > 2) console.log(res);
        return res;
      };

      handleRegister.original = window.System!.register;
      handleInstantiate.original = window.System!.instantiate;

      Object.defineProperty(window.System, "register", {
        get: () => handleRegister,
        set: (value) => (handleRegister.original = value),
        configurable: true
      });

      Object.defineProperty(window.System, "instantiate", {
        get: () => handleInstantiate,
        set: (value) => (handleInstantiate.original = value),
        configurable: true
      });
    }

    Object.defineProperty(window, "System", {
      get: () => systemjs,
      set: async (value) => {
        systemjs = value;
        if (!hasPatched) {
          hasPatched = true;
          while (typeof window.System.instantiate === "undefined")
            await Promise.resolve();
          patchSystemjs();
        }
      },
      configurable: true
    });

    // Allow access to debug mode
    let puttenv = {
      enabled: true
    };

    Object.defineProperty(window, "_PuttEnv", {
      get: () => puttenv,
      set: (value) => {
        puttenv = value;
        puttenv.enabled = true;
      },
      configurable: true
    });
  }
  // Run the entry function in the iframe
  frame.window.eval(`(${entry.toString()})()`);
};
app.on("browser-window-created", (_, win) => {
  win.webContents.on("frame-created", (_, { frame }) => {
    frame.once("dom-ready", () => {
      if (frame.url.startsWith("https://945737671223947305.discordsays.com")) {
        frame.executeJavaScript(`(${entrypoint.toString()})();`);
      }
    });
  });
});
