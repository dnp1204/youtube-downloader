class Helper {
  truncate(string, limit = 40) {
    if (string.length > limit) {
      const newString = string.substring(0, 31);
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
}

module.exports = new Helper();
