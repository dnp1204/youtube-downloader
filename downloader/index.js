const { Promise } = require('bluebird');
const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const youtubedl = require('youtube-dl');

const helpers = require('../utils/helpers');
const progressBar = require('../utils/progress-bar');
const Spinner = require('../utils/spinner');
const youtube = require('../youtube');

const HOME = os.homedir();
const SAVED_LOCATION = `${HOME}/Downloads`;

class Downloader {
  constructor() {
    this.spinner = new Spinner();
  }

  async download(link, downloadAll = true, includedIndex = false) {
    if (!youtube.isYoutubeSite(link)) {
      console.error(chalk.red('We only support youtube site!'));
      return;
    }

    this.spinner.start();

    if (youtube.isPlayList(link) && downloadAll) {
      await this.downloadPlaylist(link, includedIndex);
      process.stdout.write('\nFinished downloading playlist\n');
    } else {
      try {
        const result = await this.downloadVideo(link);
        process.stdout.write(`\n${result}\n`);
      } catch (error) {
        console.log(chalk.red(error));
      }
    }
  }

  async downloadPlaylist(link, includedIndex) {
    const videos = await youtube.getUrlsFromPlaylist(link);
    let finished = 0;

    this.spinner.stop();
    progressBar.setTitle(`Current progress (0/${videos.length})`);
    progressBar.init(videos.length);

    return Promise.map(
      videos,
      video => {
        return new Promise(async resolve => {
          if (includedIndex) {
            await this.downloadVideo(video.link, false, video.index);
          } else {
            await this.downloadVideo(video.link, false);
          }
          resolve();
          finished += 1;
          progressBar.setTitle(
            `Current progress ${chalk.blue(`(${finished}/${videos.length})`)}`
          );
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
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
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
