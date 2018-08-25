const fs = require('fs');
const os = require('os');
const youtubedl = require('youtube-dl');
const { Promise } = require('bluebird');

const progressBar = require('../utils/progress-bar');
const youtube = require('../youtube');
const Spinner = require('../utils/spinner');
const helpers = require('../utils/helpers');

const HOME = os.homedir();
const SAVED_LOCATION = `${HOME}/Downloads`;

class Downloader {
  constructor() {
    this.spinner = new Spinner();
  }

  async download(link, downloadAll = true) {
    this.spinner.start();

    if (link.includes('&list=') && downloadAll) {
      this.downloadPlaylist(link);
    } else {
      try {
        const result = await this.downloadVideo(link);
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    }
  }

  async downloadPlaylist(link) {
    const videos = await youtube.getUrlsFromPlaylist(link);
    let finished = 0;

    progressBar.init(videos.length);

    return Promise.map(
      videos,
      video => {
        return new Promise(async resolve => {
          await this.downloadVideo(video.link, false, video.index);
          resolve();
          finished += 1;
          progressBar.update(finished);
        });
      },
      { concurrency: 4 }
    );
  }

  downloadVideo(link, verbose = true, index = null) {
    return new Promise((resolve, reject) => {
      const stream = youtubedl(link);

      stream.on('error', error => {
        reject(error);
      });

      stream.on('info', info => {
        const { title, ext, size } = info;
        const fileName = `${index ? `${index} - ` : ''}${title}.${ext}`;

        this.spinner.stop();

        if (verbose) {
          process.stdout.write('\n');
          console.log(
            `Start downloading ${helpers.truncate(
              fileName
            )} and save to ${SAVED_LOCATION}`
          );

          progressBar.init(size);

          let pos = 0;
          stream.on('data', chunk => {
            pos += chunk.length;
            progressBar.update(pos);
          });
        }

        stream.pipe(fs.createWriteStream(`${SAVED_LOCATION}/${fileName}`));

        stream.on('end', () => {
          resolve(`Finished downloading ${fileName}`);
        });
      });
    });
  }
}

module.exports = new Downloader();
