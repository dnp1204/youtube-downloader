const { Spinner: Spinnercli } = require('cli-spinner');
const chalk = require('chalk');

class Spinner {
  // spinnerIndex is from 1 to 20
  constructor(
    spinnerIndex = 3,
    title = 'Get infos and prepare to download... %s'
  ) {
    this.title = title;
    this.spinner = new Spinnercli(chalk.yellow(this.title));
    this.spinner.setSpinnerString(spinnerIndex);
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    this.spinner.start();
  }

  stop() {
    this.isRunning = false;
    this.spinner.stop();
  }

  setSpinnerTitle(newTitle) {
    this.title = newTitle;
    this.spinner.setSpinnerTitle(chalk.yellow(`${newTitle}... %s`));
  }
}

module.exports = Spinner;
