const fs = require("fs");
const rimraf = require("rimraf");
const { appDirectory } = require("./src/config");

console.log(`Moving app build to ../${appDirectory}`);
rimraf.sync(`../${appDirectory}`);
fs.renameSync(`./build/`, `../${appDirectory}`, err => {
  if (err) {
    throw err;
  }
});
