import {
    build,
} from "esbuild";

import {
    mkdir,
    copyFile,
} from "node:fs/promises";

const source =
    "src/serverGuard/index.tsx";

const output =
    "dist/serverGuard/index.js";

await mkdir(
    "dist/serverGuard",
    {
        recursive: true,
    }
);

await build({
    entryPoints: [source],

    outfile: output,

    bundle: true,

    format: "iife",

    platform: "neutral",

    target: "es2020",

    minify: false,

    jsx: "automatic",

    external: [
        "@metro/*",
        "@metro/common",
        "@metro/filters",
        "@lib",
        "react",
        "react-native",
    ],
});

await copyFile(
    "src/serverGuard/manifest.json",
    "dist/serverGuard/manifest.json"
);

console.log(
    "ServerGuard built successfully."
);