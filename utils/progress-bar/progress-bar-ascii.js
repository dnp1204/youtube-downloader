const ProgressBar = require('ascii-progress');

class ProgressBarAscii {
  constructor(message, size, color = 'blue') {
    this.progressBar = new ProgressBar({
      schema: `${message}.${color} [:bar.green] :percent.green`,
      total: size
    });
    this.size = size;
    this.clearLine();
  }

  update(progress, ticker) {
    this.progressBar.update(progress / this.size, ticker);
  }

  clearLine() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }
}

module.exports = ProgressBarAscii;
