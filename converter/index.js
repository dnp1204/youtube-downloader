const { Promise } = require('bluebird');
const Ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const os = require('os');

const helpers = require('../utils/helpers');
const ProgressBar = require('../utils/progress-bar');

Ffmpeg.setFfmpegPath(ffmpegPath);

const HOME = os.homedir();
const SAVED_LOCATION = `${HOME}/Downloads`;

class Converter {
  convertToAudio(stream, title, duration, toFormat = 'mp3') {
    const fileName = `${title}.${toFormat}`;
    const converter = new Ffmpeg({ source: stream });

    const totalSeconds = helpers.toSeconds(duration);
    const progressBar = new ProgressBar();
    progressBar.init(totalSeconds);

    return new Promise(resolve => {
      converter
        .toFormat(toFormat)
        .saveToFile(`${SAVED_LOCATION}/${fileName}`)
        .on('progress', progress => {
          const { timemark } = progress;
          const timeMarkSeconds = helpers.toSeconds(timemark);
          progressBar.update(timeMarkSeconds);
        })
        .on('finish', () => {
          console.log(`Finished downloading and converting ${fileName}`);
          resolve(`Finished downloading and converting ${fileName}`);
        });
    });
  }
}

module.exports = new Converter();
