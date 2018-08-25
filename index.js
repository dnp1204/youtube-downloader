const downloader = require('./downloader');

const args = process.argv.slice(2);
const [link] = args;

downloader.download(link);
