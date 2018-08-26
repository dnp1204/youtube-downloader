const { Promise } = require('bluebird');
const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const youtubedl = require('youtube-dl');
const converter = require('../converter');

const helpers = require('../utils/helpers');
const ProgressBar = require('../utils/progress-bar');
const Spinner = require('../utils/spinner');
const youtube = require('../youtube');

const HOME = os.homedir();
const SAVED_LOCATION = `${HOME}/Downloads`;

class Downloader {
  constructor() {
    this.spinner = new Spinner();
    this.downloadAll = true;
    this.includedIndex = false;
    this.toAudio = true;
  }

  async download(link) {
    if (!youtube.isYoutubeSite(link)) {
      console.error(chalk.red('We only support youtube site!'));
      return;
    }

    this.spinner.start();

    if (youtube.isPlayList(link) && this.downloadAll) {
      await this.downloadPlaylist(link);
      process.stdout.write(chalk.green('\nFinished downloading playlist\n'));
    } else {
      try {
        const result = await this.downloadVideo(link);
        process.stdout.write(`\n${result}\n`);
      } catch (error) {
        console.log(chalk.red(error));
      }
    }
  }

  async downloadPlaylist(link) {
    const videos = await youtube.getUrlsFromPlaylist(link);
    let finished = 0;

    this.spinner.stop();

    const progressBar = new ProgressBar();
    progressBar.setTitle(`Current progress (0/${videos.length})`);
    progressBar.init(videos.length);

    return Promise.map(
      videos,
      video => {
        return new Promise(async resolve => {
          if (this.includedIndex) {
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
        const { title, ext, size, duration } = info;
        const fileName = `${index ? `${index} - ` : ''}${title}.${ext}`;

        this.spinner.stop();

        if (this.toAudio) {
          this.downloadVideoAndConvert(
            stream,
            title,
            duration,
            verbose,
            resolve
          );
        } else {
          this.downloadVideoOnly(stream, fileName, size, verbose, resolve);
        }
      });
    });
  }

  downloadVideoOnly(stream, fileName, size, showProgress, resolve) {
    if (showProgress) {
      this.initDownloadMessage();

      const progressBar = new ProgressBar();
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
  }

  downloadVideoAndConvert(stream, title, duration, showProgress, resolve) {
    const totalSeconds = helpers.toSeconds(duration);

    const observer = converter.convertToAudio(stream, title);
    if (showProgress) {
      this.initDownloadMessage(title);

      const progressBar = new ProgressBar();
      progressBar.init(totalSeconds);

      observer.on('progress', progress => {
        progressBar.update(progress);
      });
    }

    observer.on('finished', message => {
      resolve(message);
    });
  }

  initDownloadMessage(fileName) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(
      `Start downloading ${helpers.truncate(
        fileName
      )} and save to ${SAVED_LOCATION}`
    );
  }
}

module.exports = new Downloader();
