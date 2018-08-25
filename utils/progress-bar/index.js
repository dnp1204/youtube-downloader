const { bgWhite } = require('chalk');

class ProgressBar {
  constructor() {
    this.total = 0;
    this.current = 0;
    this.bar_length = process.stdout.columns - 30;
  }

  init(total) {
    this.total = total;
    this.current = 0;
    this.update(this.current);
  }

  update(current) {
    this.current = current;
    const currentProgress = this.current / this.total;
    this.draw(currentProgress);
  }

  draw(currentProgress) {
    const filledBarLength = (currentProgress * this.bar_length).toFixed(0);
    const emptyBarLength = this.bar_length - filledBarLength;

    const filledBar = this.getBar(filledBarLength, ' ', bgWhite);
    const emptyBar = this.getBar(emptyBarLength, '-');
    const percentageProgress = (currentProgress * 100).toFixed(2);

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(
      `Current progress: [${filledBar}${emptyBar}] | ${percentageProgress}%`
    );
  }

  getBar(length, char, color = a => a) {
    let str = '';
    for (let i = 0; i < length; i += 1) {
      str += char;
    }
    return color(str);
  }
}

module.exports = new ProgressBar();
