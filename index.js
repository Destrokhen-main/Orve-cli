#!/usr/bin/env node

const { program } = require('commander');
const package = require("./package.json");
const exec = require("node-async-exec");
const pNameRegex = require('package-name-regex');
const fs = require("fs");
const path = require("path");
const http = require("https");
const chalk = require("chalk");

function writeFileByURLs(filesPath, appName, url) {
  const file = fs.createWriteStream(`${filesPath}/${appName}/${url}`);
  const request = http.get("https://raw.githubusercontent.com/Destrokhen-main/Orve-npm-project/master/" + url, function(response) {
    response.pipe(file);
  });
}

function centerLogger(text) {
  console.log(`
  \n
  \t ${text}
  \n
  `)
} 

function logger(text) {
  console.log(`\t ${text}`)
}

function loader(text = "loading") {
  let str = ".";

  const interval = setInterval(() => {
    console.clear();
    if (str === "....") str = ".";
    centerLogger(`${chalk.bold(text)}${chalk.green(str)}`)
    str += ".";
  }, 1000);

  return () => {
    clearInterval(interval);
    console.clear()
  }
}

program
  .name("Orve-cli")
  .description('CLI to create template orve')
  .version(package.version)

program.command("create")
  .argument("<string>", "Name folder")
  .action(async (str, options) =>  {
    const appName = str.toLowerCase();
    const filesPath = path.resolve("./");
    if (!pNameRegex.test(appName)) {
      logger(`${chalk.white.bgRed.bold(`ERROR`)} - project name "${appName}" is not supported`);
      return;
    }

    console.clear();
    logger(`--- ${chalk.bgWhite.bold(` Create folder "${appName}" `)} ---`);
    
    // create folder
    await exec({ cmd: `mkdir ${appName}`}).catch((e) => {if (e) throw e;});
    
    console.clear();
    logger(`--- ${chalk.bgWhite.bold(` Create ${chalk.bgYellow.bold('package.json')} File `)} ---`);

    await exec({
      path: `${filesPath}/${appName}`,
      cmd: [
        `npm init -y`,
        `npm pkg set 'description'='Template Orve', 'main'='scr/index.js' 'scripts.dev'='webpack serve --mode development' 'scripts.build'='webpack --mode production'`,
        `npm pkg delete 'scripts.test'`
      ]
    }).catch((e) => {if (e) throw e;})
    
    const disabled = loader(" Installing Dependencies ");

    await exec(
      {
        path: `${filesPath}/${appName}`,
        cmd: [
          "npm i -D @babel/core @babel/preset-env @babel/preset-react babel-loader copy-webpack-plugin css-loader file-loader html-webpack-plugin node-sass sass-loader source-map-loader style-loader webpack webpack-cli webpack-dev-server",
          "npm i log-beautify orve root-require"
        ]
      }
    ).catch((e) => { if (e) throw e;});

    await disabled();
    
    await exec({
      path: `${filesPath}/${appName}`,
      cmd: [
        "mkdir public",
        "mkdir src",
        "mkdir src/assets",
        "mkdir src/assets/font",
        "mkdir src/component",
        "mkdir src/component/button"
      ]
    }).catch((e) => { if (e) throw e;});
    
    console.clear();
    logger(`--- ${chalk.bgWhite.bold(` Copy file from repository `)} ---`);

    const pathArray = [
      "webpack.config.js",
      ".babelrc",
      ".gitignore",

      "public/index.html",
      "public/favicon.ico",
      "public/robots.txt",

      "src/app.js",
      "src/index.js",
      "src/style.scss",
      "src/assets/logo.png",
      "src/assets/font/font.scss",
      "src/assets/font/Montserrat-Italic-VariableFont_wght.ttf",
      "src/assets/font/Montserrat-VariableFont_wght.ttf",
      "src/component/button/button.js",
      "src/component/button/button.sc.scss",
      "src/component/helloword.js",
      "src/component/img.js",
    ];

    for(let i = 0 ; i !== pathArray.length; i++) {
      logger(`--- ${chalk.bgWhite.bold(` Downloading the file : ${chalk.bgYellow.bold(` ${pathArray[i]} `)}`)} ---`);
      writeFileByURLs(filesPath, appName, pathArray[i]);
    }
    console.log(`
    \n
    --------------- ${chalk.bgGreen.bold(` Done `)}  ---------------
    `)

    logger(`--- ${chalk.bgGreen.bold(` Go to folder `)} ---`);
    console.log(`\n${chalk.bgWhite.bold(` * `)} cd ${appName}\n`);
    logger(`--- ${chalk.bgWhite.bold(` run local server `)} ---`);
    console.log(`\n${chalk.bgGreen.bold(` * `)} npm run dev\n\n`);
    logger(`--- ${chalk.bgYellow.bold(` build app `)} ---`);
    console.log(`\n${chalk.bgYellow.bold(` * `)} npm run build\n`);
    return true;
  })
program.parse();