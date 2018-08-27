const chalk = require('chalk');
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

  createPlaylistDirName(saveLocation) {
    const now = Date.now();
    const name = `playlist-${now}`;
    const dirName = `${saveLocation}/${name}`;

    return new Promise((resolve, reject) => {
      fs.exists(dirName, exists => {
        if (exists) {
          this.createPlaylistDirName(saveLocation);
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

  displaySuccessMessage(message) {
    process.stdout.write(chalk.green(`${message}\n`));
  }

  displayErrorMessage(error) {
    console.log(chalk.red(error));
  }

  isLink(element) {
    return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/.test(
      element
    );
  }
}

module.exports = new Helper();
