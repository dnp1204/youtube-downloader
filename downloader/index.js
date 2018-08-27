const { Promise } = require('bluebird');
const fs = require('fs');
const os = require('os');
const youtubedl = require('youtube-dl');

const DownloadItem = require('./download-item');
const ProgressBarAscii = require('../utils/progress-bar/progress-bar-ascii');
const Spinner = require('../utils/spinner');

const converter = require('../converter');
const helpers = require('../utils/helpers');
const youtube = require('../youtube');

const HOME = os.homedir();
const SAVED_LOCATION = `${HOME}/Downloads`;

class Downloader {
  constructor(builder) {
    this.concurrency = 4;
    this.downloadAll = builder.downloadAll;
    this.includedIndex = builder.includedIndex;
    this.spinner = new Spinner();
    this.toAudio = builder.toAudio;
    this.displaySuccessMessage = false;
    this.displayProgress = true;
  }

  download(links) {
    const totalLinks = links.length;

    this.spinner.start();

    if (totalLinks === 0) {
      helpers.displayErrorMessage('You must provide a link!');
      return null;
    }

    if (totalLinks > 1) {
      return this.downloadMultipleLinks(links);
    }

    return this.downloadHelper(links[0]);
  }

  downloadMultipleLinks(links) {
    const totalLinks = links.length;

    let numberOfPlayLists = 0;
    let finishedLinks = 0;

    this.spinner.stop();
    const message = `Downloading videos from ${totalLinks} links :progress`;
    const progressBar = new ProgressBarAscii(message, totalLinks, 'red');
    progressBar.update(finishedLinks, {
      progress: `(${finishedLinks}/${totalLinks})`
    });

    return Promise.map(
      links,
      async link => {
        if (youtube.isPlayList(link) && this.downloadAll) {
          numberOfPlayLists += 1;
          const playListNumber = numberOfPlayLists;
          this.adjustConcurrency(numberOfPlayLists);

          const saveLocation = await helpers.createPlaylistDirName(
            SAVED_LOCATION
          );
          await this.downloadHelper(link, saveLocation, playListNumber);

          numberOfPlayLists -= 1;
          finishedLinks += 1;
          this.adjustConcurrency(numberOfPlayLists);
        } else {
          await this.downloadHelper(link);
          finishedLinks += 1;
        }

        progressBar.update(finishedLinks, {
          progress: `(${finishedLinks}/${totalLinks})`
        });
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

  async downloadHelper(link, saveLocation, playListNumber) {
    if (!youtube.isYoutubeSite(link)) {
      helpers.displayErrorMessage('We only support youtube site!');
      return;
    }

    if (youtube.isPlayList(link) && this.downloadAll) {
      await this.downloadPlaylist(link, saveLocation, playListNumber);
      if (this.displaySuccessMessage) {
        const message = `Finished downloading playlist${
          playListNumber ? ` ${playListNumber}` : ''
        }`;
        helpers.displaySuccessMessage(message);
      }
    } else {
      try {
        const result = await this.downloadVideo(link);
        if (this.displaySuccessMessage) {
          helpers.displaySuccessMessage(result);
        }
      } catch (error) {
        helpers.displayErrorMessage(error);
      }
    }
  }

  async downloadPlaylist(link, saveLocation, playListNumber) {
    const videos = await youtube.getUrlsFromPlaylist(link);
    const { length } = videos;
    let finished = 0;

    this.spinner.stop();

    const message = `Downloading ${length} videos${
      playListNumber ? ` from playlist ${playListNumber}` : ''
    } :progress`;
    const progressBar = new ProgressBarAscii(message, length, 'yellow');

    progressBar.update(finished, {
      progress: `(${finished}/${length})`
    });

    return Promise.map(
      videos,
      async video => {
        await this.downloadVideo(video, saveLocation);
        finished += 1;
        progressBar.update(finished, {
          progress: `(${finished}/${videos.length})`
        });
      },
      { concurrency: this.concurrency }
    );
  }

  downloadVideo(video, saveLocation = null) {
    const { link, index } = video;
    return new Promise((resolve, reject) => {
      const stream = youtubedl(link);

      stream.on('error', error => {
        reject(error);
      });

      stream.on('info', info => {
        const { title, ext, size, duration } = info;
        const fileName = `${
          this.includedIndex ? `${index} - ` : ''
        }${title}.${ext}`;
        const downloadItem = new DownloadItem(stream, fileName, size);

        if (this.toAudio) {
          downloadItem.size = duration;
          downloadItem.fileName = title;
          this.downloadVideoAndConvert(saveLocation, downloadItem, resolve);
        } else {
          this.downloadVideoOnly(saveLocation, downloadItem, resolve);
        }
      });
    });
  }

  downloadVideoOnly(saveLocation, downloadItem, resolve) {
    const { stream, fileName, size } = downloadItem;

    this.spinner.stop();

    if (this.displayProgress) {
      const message = `Downloading ${helpers.truncate(fileName, 50)}`;
      const progressBar = new ProgressBarAscii(message, size);

      let pos = 0;
      stream.on('data', chunk => {
        pos += chunk.length;
        progressBar.update(pos);
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
    const { stream, fileName, size } = downloadItem;
    const totalSeconds = helpers.toSeconds(size);
    const observer = converter.convertToAudio(saveLocation, stream, fileName);

    this.spinner.stop();

    if (this.displayProgress) {
      const message = `Downloading and converting to mp3 ${helpers.truncate(
        fileName
      )}`;
      const progressBar = new ProgressBarAscii(message, totalSeconds);

      observer.on('progress', progress => {
        progressBar.update(progress);
      });
    }

    observer.on('finished', message => {
      resolve(message);
    });
  }
}

module.exports = Downloader;
