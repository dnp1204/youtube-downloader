const fs = require('fs');

class Helper {
  truncate(string, limit = 40) {
    if (string.length > limit) {
      const newString = string.substring(0, limit - 10);
      return `${newString}...`;
    }

    return string;
  }

  toSeconds(time) {
    let [hours, minutes, seconds] = time.split(':');
    if (seconds) {
      if (seconds.includes('.')) {
        // If it has miliseconds, add 1 to the seconds
        const [newSeconds] = seconds.split('.');
        seconds = parseInt(newSeconds, 10) + 1;
      }
    } else {
      seconds = minutes;
      minutes = hours;
      hours = 0;
    }

    return (
      parseInt(hours, 10) * 60 * 60 +
      parseInt(minutes, 10) * 60 +
      parseInt(seconds, 10)
    );
  }

  createPlaylistDirName(saveLocation, index) {
    const now = Date.now();
    const name = `playlist-${index}-${now}`;
    const dirName = `${saveLocation}/${name}`;

    return new Promise((resolve, reject) => {
      fs.exists(dirName, exists => {
        if (exists) {
          this.createPlaylistDirName(saveLocation, index + 1);
        } else {
          fs.mkdir(dirName, err => {
            if (err) {
              return reject(err);
            }
            return resolve(dirName);
          });
        }
      });
    });
  }
}

module.exports = new Helper();
