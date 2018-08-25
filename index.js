const youtube = require('./youtube');

const args = process.argv.slice(2);
const [link] = args;

youtube.download(link);
