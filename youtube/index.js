const youtubedl = require('youtube-dl');

class Youtube {
  download(link) {
    const stream = youtubedl(link);
    stream.on('info', info => {
      console.log(info);
    });
  }
}

module.exports = new Youtube();
