const fs = require('fs');
const os = require('os');
const youtubedl = require('youtube-dl');

const progressBar = require('../utils/progress-bar');
const Spinner = require('../utils/spinner');

const HOME = os.homedir();
const SAVED_LOCATION = `${HOME}/Downloads`;

class Youtube {
  constructor() {
    this.spinner = new Spinner();
  }

  download(link) {
    const stream = youtubedl(link);

    this.spinner.start();

    stream.on('info', info => {
      const { title, ext, size } = info;
      const fileName = `${title}.${ext}`;

      this.spinner.stop();
      console.log(`Start downloading ${fileName}`);

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
