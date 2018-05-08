// @flow
"use strict";

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

// Ensure environment variables are read.
require("../config/env");

const os = require("os");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const clearConsole = require("react-dev-utils/clearConsole");
const checkRequiredFiles = require("react-dev-utils/checkRequiredFiles");
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require("react-dev-utils/WebpackDevServerUtils");
const openBrowser = require("react-dev-utils/openBrowser");
const paths = require("../config/paths");
const config = require("../config/webpack.config.dev");
const createDevServerConfig = require("../config/webpackDevServer.config");

const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive =
  typeof process.stdout.isTTY !== "undefined" && process.stdout.isTTY;

// The following module is generated by running `yarn backend`. We want
// to be able to run Flow without having generated the module, and its
// types aren't very rich, anyway, so we stub out the type of `require`
// itself.
const apiApp = /*:: ((require: any) => */ require("../bin/apiApp")
  .default /*:: )() */;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

const DEFAULT_WEBPACK_PORT = parseInt(process.env.PORT, 10) || 3000;
const DEFAULT_API_PORT = parseInt(process.env.PORT + 1000, 10) || 4000;
const HOST = process.env.HOST || "0.0.0.0";

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(`Learn more here: ${chalk.yellow("http://bit.ly/2mwWSwH")}`);
  console.log();
}

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `choosePort()` Promise resolves to the next free port.
async function main() {
  const webpackPort = await choosePort(HOST, DEFAULT_WEBPACK_PORT);
  const apiPort = await choosePort(HOST, DEFAULT_API_PORT);

  if (webpackPort == null) {
    console.error("Could not find a port for the Webpack server.");
  }
  if (apiPort == null) {
    console.error("Could not find a port for the API server.");
  }

  const sourcecredDirectory =
    process.env.SOURCECRED_DIRECTORY || path.join(os.tmpdir(), "sourcecred");
  const apiServer = await new Promise(async (resolve, _unused_reject) => {
    let server = apiApp(sourcecredDirectory).listen(apiPort, () => {
      resolve(server);
    });
  });
  console.log(
    chalk.green(`Server listening on port ${apiServer.address().port}.`)
  );
  console.log();

  const protocol = process.env.HTTPS === "true" ? "https" : "http";
  const appName = "sourcecred";
  const urls = prepareUrls(protocol, HOST, webpackPort);
  // Create a webpack compiler that is configured with custom messages.
  const compiler = createCompiler(webpack, config, appName, urls, useYarn);
  // Load proxy config
  const proxySetting = {
    "/api": {
      target: `${protocol}://localhost:${apiServer.address().port}`,
    },
  };
  const proxyConfig = prepareProxy(proxySetting, paths.appPublic);
  // Serve webpack assets generated by the compiler over a web sever.
  const serverConfig = createDevServerConfig(proxyConfig, urls.lanUrlForConfig);
  const devServer = new WebpackDevServer(compiler, serverConfig);
  // Launch WebpackDevServer.
  devServer.listen(webpackPort, HOST, (err) => {
    if (err) {
      return console.log(err);
    }
    if (isInteractive) {
      clearConsole();
    }
    console.log(chalk.cyan("Starting the development server...\n"));
    openBrowser(urls.localUrlForBrowser);
  });

  ["SIGINT", "SIGTERM"].forEach(function(sig) {
    process.on(sig, function() {
      devServer.close();
      apiServer.close();
      process.exit();
    });
  });
}

main().catch((err) => {
  if (err && err.message) {
    console.log(err.message);
  }
  process.exit(1);
});
