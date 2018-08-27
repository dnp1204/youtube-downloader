const { EventEmitter } = require('events');
const Ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const os = require('os');

const helpers = require('../utils/helpers');

Ffmpeg.setFfmpegPath(ffmpegPath);

const HOME = os.homedir();
const SAVED_LOCATION = `${HOME}/Downloads`;

class Converter {
  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  convertToAudio(saveLocaiton, stream, title, toFormat = 'mp3') {
    const fileName = `${title}.${toFormat}`;
    const converter = new Ffmpeg({ source: stream });

    converter
      .toFormat(toFormat)
      .saveToFile(`${saveLocaiton || SAVED_LOCATION}/${fileName}`)
      .on('progress', progress => {
        const { timemark } = progress;
        const timeMarkSeconds = helpers.toSeconds(timemark);
        this.eventEmitter.emit('progress', timeMarkSeconds);
      })
      .on('end', () => {
        this.eventEmitter.emit(
          'finished',
          `Finished downloading and converting ${fileName}`
        );
      });

    return this.eventEmitter;
  }
}

module.exports = new Converter();
