const { Promise } = require('bluebird');
const axios = require('axios');
const cheerio = require('cheerio');

const Video = require('./video');

class Youtube {
  getUrlsFromPlaylist(link) {
    return new Promise((resolve, reject) => {
      if (!this.isYoutubeSite(link)) {
        reject(new Error('This is not youtube video'));
      }

      if (!this.isPlayList(link)) {
        reject(new Error('This is not playlist'));
      }

      if (this.isWatchedPlayList(link)) {
        this.getUrlsFromWatchedPlayList(link, resolve);
      } else if (this.isDetailedPlaylist(link)) {
        this.getUrlsFromDetailedPlaylist(link, resolve);
      } else {
        reject(new Error('Unexpected link!'));
      }
    });
  }

  getUrlsFromWatchedPlayList(link, resolve) {
    const videos = [];
    axios.get(link).then(response => {
      const $ = cheerio.load(response.data);
      $('.playlist-videos-container > ol')
        .find('li')
        .each((index, element) => {
          const thumbnail = element.attribs['data-thumbnail-url'];
          const href = $(element)
            .find('a')
            .attr('href');
          const title = $(element)
            .find('.playlist-video-description > h4')
            .text()
            .trim();
          const video = new Video(href, thumbnail, title);
          videos.push(video);
        });
      resolve(videos);
    });
  }

  getUrlsFromDetailedPlaylist(link, resolve) {
    const videos = [];
    axios.get(link).then(response => {
      const $ = cheerio.load(response.data);
      $('#pl-video-table tbody')
        .find('tr')
        .each((index, element) => {
          const title = element.attribs['data-title'].trim();
          const thumbnail = $(element)
            .find('.pl-video-thumbnail img')
            .attr('data-thumb');
          const href = $(element)
            .find('a')
            .attr('href');
          const video = new Video(href, thumbnail, title);
          videos.push(video);
        });
      resolve(videos);
    });
  }

  isYoutubeSite(link) {
    return link.includes('https://www.youtube.com');
  }

  isPlayList(link) {
    return (
      (link.includes('playlist?') || link.includes('watch?')) &&
      link.includes('list=')
    );
  }

  isDetailedPlaylist(link) {
    return this.isPlayList(link) && link.includes('playlist?');
  }

  isWatchedPlayList(link) {
    return this.isPlayList(link) && link.includes('watch?');
  }
}

module.exports = new Youtube();
