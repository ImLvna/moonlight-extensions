import { ExtensionWebpackModule } from "@moonlight-mod/types";

export const webpackModules: Record<string, ExtensionWebpackModule> = {
  patchHelper: {
    entrypoint: true,
    dependencies: [
      { ext: "settings", id: "settings" },
      { ext: "common", id: "react" },
      { ext: "common", id: "components" },
      { ext: "spacepack", id: "spacepack" },
      { ext: "patchHelper", id: "errorBoundary" }
    ],
    run: (module, exports, require) => {
      const settings = require("settings_settings").Settings;
      const React = require("common_react");
      const spacepack = require("spacepack_spacepack").spacepack;
      const {
        Text,
        TextInput,
        FormDivider,
        Button
      } = require("common_components");
      settings.addSection("Moonbase", "Patch Helper", () => {
        const [find, setFind] = React.useState("");
        const [match, setMatch] = React.useState("");
        const [replace, setReplace] = React.useState("");

        const [moduleIds, setModuleIds] = React.useState<string[]>([]);

        const [unpatchedCode, setUnpatchedCode] = React.useState("");

        const [renderedCode, setRenderedCode] = React.useState("");

        const [patchedCode, setPatchedCode] = React.useState<string>("");

        // -1 failed, 0 not attempted, 1 compiled
        const [compileResult, setCompileResult] = React.useState<number>(0);

        function isRegex(str: string) {
          try {
            const matches = str.match(
              /\/((?![*+?])(?:[^\r\n\[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+)\/((?:g(?:im?|mi?)?|i(?:gm?|mg?)?|m(?:gi?|ig?)?)?)/
            );
            if (!matches) return str;
            return new RegExp(matches[1], matches[2]);
          } catch (_) {
            return str;
          }
        }

        React.useEffect(() => {
          if (!find) return setModuleIds([]);
          try {
            const findRegex = isRegex(find);
            const matches = spacepack.findByCode(findRegex);

            setModuleIds(matches.map((m) => m.id));
          } catch (e) {
            console.error(e);
            setModuleIds([]);
          }
        }, [find]);

        function renderModuleId(ids: string[]) {
          switch (ids.length) {
            case 0:
              return "No modules found";
            case 1:
              return ids[0];
            default:
              return `${ids.length} modules found`;
          }
        }

        React.useEffect(() => {
          if (moduleIds.length !== 1) return setUnpatchedCode("");
          setUnpatchedCode(spacepack.modules[moduleIds[0]].toString());
        }, [moduleIds]);

        React.useEffect(() => {
          if (!match) {
            setPatchedCode(unpatchedCode);
            setRenderedCode(unpatchedCode);
            return;
          }
          try {
            let regexMatch = isRegex(match);
            let matchedPatches: RegExpMatchArray | null = null;
            if (typeof regexMatch === "object") {
              regexMatch = new RegExp(
                regexMatch.source.replace(/\\i/g, "[A-Za-z_$][\\w$]*"),
                regexMatch.flags
              );
              matchedPatches = unpatchedCode.match(regexMatch);
            } else matchedPatches = unpatchedCode.match(regexMatch);
            let rendered = unpatchedCode;
            let patchedCode = unpatchedCode;
            if (!matchedPatches) return;
            for (const matched of matchedPatches) {
              console.log("matched", matched);
              rendered = patchedCode.replace(
                matched,
                `\n- ${matched}\n+ ${replace}\n`
              );
              patchedCode = patchedCode.replace(regexMatch, replace);
            }
            setRenderedCode(rendered);
            setPatchedCode(patchedCode);
          } catch (e) {
            console.error(e);
          }
        }, [match, replace, unpatchedCode]);

        function renderCode(codeStr: string) {
          return (
            <code className="hljs">
              {codeStr.split("\n").map((line) => (
                <>
                  {line.startsWith("-") ? (
                    <span style={{ color: "red" }}>{line.substring(2)}</span>
                  ) : line.startsWith("+") ? (
                    <span style={{ color: "green" }}>{line.substring(2)}</span>
                  ) : (
                    line
                  )}
                  <br />
                </>
              ))}
            </code>
          );
        }

        function formatPatchExport(
          find: string,
          match: string,
          replace: string
        ) {
          const _find = isRegex(find);
          const _match = isRegex(match);
          return JSON.stringify(
            {
              _find,
              replace: {
                _match,
                replace
              }
            },
            null,
            2
          );
        }
        return (
          <>
            <Text>Find</Text>
            <TextInput value={find} onChange={setFind}></TextInput>
            <Text>Match</Text>
            <TextInput value={match} onChange={setMatch}></TextInput>
            <Text>Replace</Text>
            <TextInput value={replace} onChange={setReplace}></TextInput>
            <FormDivider />
            <Text>Module</Text>
            <Text>{renderModuleId(moduleIds)}</Text>
            {moduleIds.length === 1 && (
              <>
                <Text>Code</Text>
                {renderCode(renderedCode)}
              </>
            )}
            <Button
              onClick={() => {
                try {
                  Function(patchedCode);
                  setCompileResult(1);
                } catch (e) {
                  setCompileResult(-1);
                }
              }}
            >
              Compile
            </Button>
            {(compileResult === -1 && <Text>Failed to compile</Text>) ||
              (compileResult === 1 && <Text>Compiled successfully</Text>)}
            <code className="hljs">
              {formatPatchExport(find, match, replace)}
            </code>
          </>
        );
      });
    }
  }
};
