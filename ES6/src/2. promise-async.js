const fs = require('fs');
const util = require('util');
const asyncReadFile = util.promisify(fs.readFile);

async function init(params) {
  try {
    let data = await asyncReadFile('./package.json');

    data = JSON.parse(data)

    console.log(data.name)

  } catch (err) {
    console.log('err')
  }
}

init();