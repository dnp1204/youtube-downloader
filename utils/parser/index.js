class Parser {
  constructor(args) {
    this.params = {
      links: []
    };
    this.process(args);
  }

  process(args) {
    args.forEach(arg => {
      if (this.isLink(arg)) {
        this.params.links.push(arg);
      } else if (this.isArgument(arg)) {
        this.params[arg.substring(1)] = true;
      }
    });
  }

  isLink(element) {
    return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(
      element
    );
  }

  isArgument(element) {
    return element.includes('-');
  }
}

module.exports = Parser;
