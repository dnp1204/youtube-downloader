const Downloader = require('./index');

class DownloaderBuilder {
  constructor() {
    this.downloadAll = false;
    this.includedIndex = false;
    this.toAudio = false;
  }

  isDownloadAll() {
    this.downloadAll = true;
    return this;
  }

  isIncludedIndex() {
    this.includedIndex = true;
    return this;
  }

  isToAudio() {
    this.toAudio = true;
    return this;
  }

  build() {
    const downloader = new Downloader(this);
    return downloader;
  }
}

module.exports = DownloaderBuilder;
