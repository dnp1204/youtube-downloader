class DownloadItem {
  constructor(stream, fileName, size, showProgress = false) {
    this.stream = stream;
    this.fileName = fileName;
    this.size = size;
    this.showProgress = showProgress;
  }
}

module.exports = DownloadItem;
