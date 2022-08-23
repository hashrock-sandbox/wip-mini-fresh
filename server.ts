import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Component, h, render } from "preact";
import { renderToString } from "preact-render-to-string";
import * as esbuild from "https://deno.land/x/esbuild@v0.14.51/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts";

await esbuild.build({
  plugins: [denoPlugin()],
  entryPoints: ["components/Hello.tsx"],
  bundle: true,
  format: "esm",
  platform: "neutral",
  outdir: "dist",
  target: ["chrome99", "firefox99", "safari15"],
});
esbuild.stop();

const router = new Router();
router.get("/", (ctx) => {
  const app = h("h1", null, "Hello World!");
  ctx.response.headers.set("Content-Type", "text/html");
  ctx.response.body = renderToString(app, null);
});

router.get("main.js", async (ctx) => {
  ctx.response.headers.set("Content-Type", "text/html");
  ctx.response.body = await Deno.readTextFile("./dist/main.js");
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8080 });
