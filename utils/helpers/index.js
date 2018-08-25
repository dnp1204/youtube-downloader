class Helper {
  truncate(string, limit = 40) {
    if (string.length > limit) {
      const newString = string.substring(0, 31);
      return `${newString}...`;
    }

    return string;
  }
}

module.exports = new Helper();
