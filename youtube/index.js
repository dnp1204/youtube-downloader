const axios = require('axios');
const cheerio = require('cheerio');
const { Promise } = require('bluebird');

const Video = require('./video');

class Youtube {
  getUrlsFromPlaylist(link) {
    return new Promise((resolve, reject) => {
      const videos = [];

      if (!link.includes('https://www.youtube.com')) {
        reject(new Error('This is not youtube video'));
      }

      axios.get(link).then(response => {
        const $ = cheerio.load(response.data);
        $('.playlist-videos-container > ol')
          .find('li')
          .each((index, element) => {
            const thumbnail = element.attribs['data-thumbnail-url'];
            const href = $(element)
              .find('a')
              .attr('href');
            const video = new Video(href, thumbnail);
            videos.push(video);
          });
        resolve(videos);
      });
    });
  }
}

module.exports = new Youtube();
