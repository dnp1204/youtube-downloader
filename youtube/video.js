const { URL } = require('url');

const YOUTUBE_URL = 'https://www.youtube.com/';

class Video {
  constructor(link, thumbnail = '') {
    this.link = `${YOUTUBE_URL}${link}`;
    this.thumbnail = thumbnail;
    this.index = this.getIndex();
  }

  getIndex() {
    if (this.link.includes('list=') && this.link.includes('index=')) {
      const url = new URL(this.link);
      const index = url.searchParams.get('index');

      return index;
    }

    return null;
  }

  toString() {
    return `
      Video info:\n
      \t\tIndex: ${this.index}\n
      \t\tLink: ${this.link}\n
      \t\tThumbnail: ${this.thumbnail}
    `;
  }
}

module.exports = Video;
