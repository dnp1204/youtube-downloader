const { Promise } = require('bluebird');
const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const youtubedl = require('youtube-dl');
const ProgressBar = require('ascii-progress');

const DownloadItem = require('./download-item');
const Spinner = require('../utils/spinner');

const converter = require('../converter');
const helpers = require('../utils/helpers');
const youtube = require('../youtube');

const HOME = os.homedir();
const SAVED_LOCATION = `${HOME}/Downloads`;

class Downloader {
  constructor(builder) {
    this.spinner = new Spinner();
    this.downloadAll = builder.downloadAll;
    this.includedIndex = builder.includedIndex;
    this.toAudio = builder.toAudio;
    this.concurrency = 4;
  }

  download(links) {
    let numberOfPlayLists = 0;

    this.spinner.start();

    return Promise.map(
      links,
      async (link, index) => {
        if (!youtube.isYoutubeSite(link)) {
          console.error(chalk.red('We only support youtube site!'));
        } else if (youtube.isPlayList(link) && this.downloadAll) {
          numberOfPlayLists += 1;
          const orderNumber = numberOfPlayLists;
          this.adjustConcurrency(numberOfPlayLists);
          const saveLocation = await helpers.createPlaylistDirName(
            SAVED_LOCATION,
            index
          );
          await this.downloadHelper(link, saveLocation, orderNumber);
          this.numberOfPlayLists -= 1;
          this.adjustConcurrency(numberOfPlayLists);
        } else {
          await this.downloadHelper(link);
        }
      },
      { concurrency: 4 }
    );
  }

  adjustConcurrency(numberOfPlayLists) {
    if (numberOfPlayLists > 2) {
      this.concurrency = 1;
    } else if (numberOfPlayLists === 2) {
      this.concurrency = 2;
    } else {
      this.concurrency = 4;
    }
  }

  async downloadHelper(link, saveLocation = null, index = null) {
    if (!youtube.isYoutubeSite(link)) {
      console.error(chalk.red('We only support youtube site!'));
      return;
    }

    if (youtube.isPlayList(link) && this.downloadAll) {
      await this.downloadPlaylist(link, saveLocation, index);
      process.stdout.write(
        chalk.green(
          `Finished downloading playlist${index ? ` ${index}` : ''}\n`
        )
      );
    } else {
      try {
        const result = await this.downloadVideo(link);
        process.stdout.write(chalk.green(`${result}\n`));
      } catch (error) {
        console.log(chalk.red(error));
      }
    }
  }

  async downloadPlaylist(link, saveLocation, index) {
    const videos = await youtube.getUrlsFromPlaylist(link);
    let finished = 0;

    this.spinner.stop();

    const message = `Downloading ${videos.length} videos${
      index ? ` from playlist ${index}` : ''
    } :token1`;
    const progressBar = this.makeProgressBar(message, videos.length);

    this.initDownloadMessage();
    progressBar.update(finished / videos.length, {
      token1: `(${finished}/${videos.length})`
    });

    return Promise.map(
      videos,
      async video => {
        if (this.includedIndex) {
          await this.downloadVideo(video.link, saveLocation, true, video.index);
        } else {
          await this.downloadVideo(video.link, saveLocation, true);
        }
        finished += 1;
        progressBar.update(finished / videos.length, {
          token1: `(${finished}/${videos.length})`
        });
      },
      { concurrency: this.concurrency }
    );
  }

  downloadVideo(link, saveLocation = null, verbose = true, index = null) {
    return new Promise((resolve, reject) => {
      const stream = youtubedl(link);

      stream.on('error', error => {
        reject(error);
      });

      stream.on('info', info => {
        const { title, ext, size, duration } = info;
        const fileName = `${index ? `${index} - ` : ''}${title}.${ext}`;

        if (this.toAudio) {
          const downloadItem = new DownloadItem(
            stream,
            title,
            duration,
            verbose
          );
          this.downloadVideoAndConvert(saveLocation, downloadItem, resolve);
        } else {
          const downloadItem = new DownloadItem(
            stream,
            fileName,
            size,
            verbose
          );
          this.downloadVideoOnly(saveLocation, downloadItem, resolve);
        }
      });
    });
  }

  downloadVideoOnly(saveLocation, downloadItem, resolve) {
    const { stream, fileName, showProgress, size } = downloadItem;

    this.spinner.stop();

    if (showProgress) {
      const message = `Downloading ${helpers.truncate(fileName, 50)}`;
      const progressBar = this.makeProgressBar(message, size);
      this.initDownloadMessage();

      let pos = 0;
      stream.on('data', chunk => {
        pos += chunk.length;
        progressBar.update(pos / size);
      });
    }

    stream.pipe(
      fs.createWriteStream(`${saveLocation || SAVED_LOCATION}/${fileName}`)
    );

    stream.on('end', () => {
      resolve(`Finished downloading ${fileName}`);
    });
  }

  downloadVideoAndConvert(saveLocation, downloadItem, resolve) {
    const { stream, fileName, size, showProgress } = downloadItem;
    const totalSeconds = helpers.toSeconds(size);
    const observer = converter.convertToAudio(saveLocation, stream, fileName);

    this.spinner.stop();

    if (showProgress) {
      const message = `Downloading and converting to mp3 ${helpers.truncate(
        fileName
      )}`;
      const progressBar = this.makeProgressBar(message, totalSeconds);
      this.initDownloadMessage();

      observer.on('progress', progress => {
        progressBar.update(progress / totalSeconds);
      });
    }

    observer.on('finished', message => {
      resolve(message);
    });
  }

  initDownloadMessage() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }

  makeProgressBar(message, size) {
    const progressBar = new ProgressBar({
      schema: `${message}.blue [:bar.green] :percent.green`,
      total: size
    });

    return progressBar;
  }
}

module.exports = Downloader;
