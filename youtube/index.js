const fs = require('fs');
const path = require('path');
const os = require('os');
const youtubedl = require('youtube-dl');
const timeFormat = require('hh-mm-ss');

const progressBar = require('../progress-bar');

const HOME = os.homedir();
const SAVED_LOCATION = `${HOME}/Downloads`;

class Youtube {
  download(link) {
    const stream = youtubedl(link);
    stream.on('info', info => {
      const { title, ext, size } = info;
      const fileName = `${title}.${ext}`;

      progressBar.init(size);

      let pos = 0;
      stream.on('data', chunk => {
        pos += chunk.length;
        progressBar.update(pos);
      });

      stream.pipe(fs.createWriteStream(`${SAVED_LOCATION}/${fileName}`));

      stream.on('end', () => {
        console.log(`Finished downloading ${fileName}`);
      });
    });
  }
}

module.exports = new Youtube();
