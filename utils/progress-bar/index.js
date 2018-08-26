const chalk = require('chalk');
// const ansi = require('ansi');
// const helpers = require('../helpers');

// const cursor = ansi(process.stdout);

class ProgressBar {
  constructor() {
    this.barLength = process.stdout.columns - 50;
    this.current = 0;
    this.title = 'Current progress';
    this.total = 0;
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
    const filledBarLength = (currentProgress * this.barLength).toFixed(0);
    const emptyBarLength = this.barLength - filledBarLength;

    const filledBar = this.getBar(filledBarLength, ' ', chalk.bgGreen);
    const emptyBar = this.getBar(emptyBarLength, '-', chalk);
    const percentageProgress = (currentProgress * 100).toFixed(2);

    // const pos = helpers.getCurrentPosition();
    // cursor.goto(0, pos.row + 1);

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(
      `${this.title}: [${filledBar}${emptyBar}] | ${chalk.green(
        `${percentageProgress}%`
      )}`
    );
  }

  getBar(length, char, color = a => a) {
    let str = '';
    for (let i = 0; i < length; i += 1) {
      str += char;
    }
    return color(str);
  }

  setTitle(newTitle) {
    this.title = newTitle;
  }
}

module.exports = ProgressBar;
