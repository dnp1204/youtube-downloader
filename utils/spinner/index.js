const { Spinner: Spinnercli } = require('cli-spinner');

class Spinner {
  // spinnerIndex is from 1 to 20
  constructor(spinnerIndex = 3) {
    this.spinner = new Spinnercli('Loading... %s');
    this.spinner.setSpinnerString(spinnerIndex);
  }

  start() {
    this.spinner.start();
  }

  stop() {
    this.spinner.stop();
    process.stdout.write('\n');
  }
}

module.exports = Spinner;
