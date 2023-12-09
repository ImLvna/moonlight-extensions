import * as esbuild from "esbuild";
import copyStaticFiles from "esbuild-copy-static-files";
import fs from "fs";

const prod = process.env.NODE_ENV === "production";
const watch = process.argv.includes("--watch");

function makeConfig(ext, name) {
  const entryPoints = [];
  const fileExts = ["js", "jsx", "ts", "tsx"];
  for (const fileExt of fileExts) {
    const path = `./src/${ext}/${name}.${fileExt}`;
    if (fs.existsSync(path)) entryPoints.push(path);
  }

  const wpModulesDir = `./src/${ext}/webpackModules`;
  if (fs.existsSync(wpModulesDir) && name === "index") {
    const wpModules = fs.readdirSync(wpModulesDir);
    for (const wpModule of wpModules) {
      entryPoints.push(`./src/${ext}/webpackModules/${wpModule}`);
    }
  }

  if (entryPoints.length === 0) return null;

  /**
   * @type {import('esbuild').Plugin}
   */
  const wpImportPlugin = {
    name: "webpackImports",
    setup(build) {
      build.onResolve({ filter: /^@moonlight-mod\/wp\// }, (args) => {
        const wpModule = args.path.replace(/^@moonlight-mod\/wp\//, "");
        return {
          path: wpModule,
          external: true
        };
      });
    }
  };

  /**
   * @type {import('esbuild').Plugin}
   */
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false
  });
  /**
   * @type {import('esbuild').Plugin}
   */
  const buildLogPlugin = {
    name: "buildLog",
    setup(build) {
      build.onEnd(() => {
        console.log(
          `[${timeFormatter.format(
            new Date()
          )}] [${ext}/${name}] build finished`
        );
      });
    }
  };

  /**
   * @type {import('esbuild').Plugin}
   */
  const cssPlugin = {
    name: "cssPlugin",
    setup(build) {
      build.onLoad({ filter: /\.css$/ }, async (args) => {
        let contents = await fs.promises.readFile(args.path, "utf8");
        contents = contents.replace(
          /@import\s+["'](.+?)["'];/g,
          (match, path) => {
            return fs.readFileSync(
              require.resolve(path, {
                paths: [args.resolveDir]
              }),
              "utf8"
            );
          }
        );
        contents = `
          module.exports.default = ${JSON.stringify(contents)};`;
        return {
          contents: contents,
          loader: "js"
        };
      });
    }
  };

  return {
    entryPoints,
    outdir: `./dist/${ext}`,

    format: "cjs",
    platform: "node",

    treeShaking: true,
    bundle: true,
    minify: prod,
    sourcemap: "inline",

    external: ["electron", "fs", "path", "module", "events", "original-fs"],

    plugins: [
      copyStaticFiles({
        src: `./src/${ext}/manifest.json`,
        dest: `./dist/${ext}/manifest.json`
      }),
      wpImportPlugin,
      buildLogPlugin,
      cssPlugin
    ]
  };
}

const exts = fs.readdirSync("./src");

const config = exts
  .map((x) => [
    makeConfig(x, "index"),
    makeConfig(x, "node"),
    makeConfig(x, "host")
  ])
  .flat()
  .filter((c) => c !== null);

if (watch) {
  await Promise.all(
    config.map(async (c) => {
      const ctx = await esbuild.context(c);
      await ctx.watch();
    })
  );
} else {
  for (const c of config) {
    await esbuild.build(c);
  }
}
