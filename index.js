const DownloaderBuilder = require('./downloader/builder');
const Parser = require('./utils/parser');

const args = process.argv.slice(2);
const parser = new Parser(args);
let downloaderBuilder = new DownloaderBuilder();

if (parser.params.all || parser.params.a) {
  downloaderBuilder = downloaderBuilder.isDownloadAll();
}

if (parser.params.i || parser.params.index) {
  downloaderBuilder = downloaderBuilder.isIncludedIndex();
}

if (parser.params.au || parser.params.audio) {
  downloaderBuilder = downloaderBuilder.isToAudio();
}

const downloader = downloaderBuilder.build();

const { links } = parser.params;
downloader.download(links);
