const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(__dirname, "..", "package.json");
const publicOutputPath = path.join(__dirname, "..", "public", "version.json");
const sourceOutputPath = path.join(__dirname, "..", "src", "generated", "version.js");

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const versionPayload = {
  version: packageJson.version,
  buildTime: new Date().toISOString(),
};

fs.mkdirSync(path.dirname(sourceOutputPath), { recursive: true });
fs.writeFileSync(publicOutputPath, `${JSON.stringify(versionPayload, null, 2)}\n`);
fs.writeFileSync(
  sourceOutputPath,
  `export const APP_VERSION = ${JSON.stringify(versionPayload.version)};\n`
    + `export const APP_BUILD_TIME = ${JSON.stringify(versionPayload.buildTime)};\n`
);
