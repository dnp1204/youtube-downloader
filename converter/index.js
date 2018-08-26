const { Promise } = require('bluebird');
const Ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs');
const os = require('os');

Ffmpeg.setFfmpegPath(ffmpegPath);

const HOME = os.homedir();
const SAVED_LOCATION = `${HOME}/Downloads`;

class Converter {
  convertToAudio(stream, title, toFormat = 'mp3') {
    const fileName = `${title}.${toFormat}`;
    const converter = new Ffmpeg({ source: stream });

    return new Promise(resolve => {
      converter
        .toFormat(toFormat)
        .pipe(fs.createWriteStream(`${SAVED_LOCATION}/${fileName}`))
        .on('data', chunk => {
          console.log(chunk);
        })
        .on('progress', chunk => {
          console.log(chunk);
        })
        .on('finish', () => {
          resolve(`Finished downloading and converting ${fileName}`);
        });
    });
  }
}

module.exports = new Converter();
