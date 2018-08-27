#!/usr/bin/env node
const program = require('commander');

const DownloaderBuilder = require('./downloader/builder');

let downloaderBuilder = new DownloaderBuilder();

program
  .version('0.1.0')
  .usage('<your-links> [options]')
  .description(
    'A command line client to download videos from youtube links. We support download multiple links'
  )
  .option('-s, --audio', 'Convert video to audio (mp3 is default type)')
  .option('-a, --all', 'Download all videos if the link is playlist')
  .option('-i, --index', "Includes index number of video to the video's title")
  .parse(process.argv);

if (program.all) {
  downloaderBuilder = downloaderBuilder.isDownloadAll();
}

if (program.index) {
  downloaderBuilder = downloaderBuilder.isIncludedIndex();
}

if (program.audio) {
  downloaderBuilder = downloaderBuilder.isToAudio();
}

const downloader = downloaderBuilder.build();
const links = program.args;
downloader.download(links);
