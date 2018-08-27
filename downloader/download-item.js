class DownloadItem {
  constructor(stream, fileName, size) {
    this.stream = stream;
    this.fileName = fileName;
    this.size = size;
  }
}

module.exports = DownloadItem;
