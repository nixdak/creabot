const _ = require('lodash');
const fs = require('fs');
const schedule = require('node-schedule');
const amazon = require('amazon-product-api');
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.json')[env];
const booksToRead = require('../../config/booksToRead.json');
const booksRead = require('../../config/booksRead.json');
const thisMonthBook = require('../../config/thisMonthBook.json');
const nextMonthBook = require('../../config/nextMonthBook.json');

const Bookclub = function Bookclub () {
  const self = this;
  self.config = config;
  self.booksToRead = booksToRead;
  self.thisMonthBook = thisMonthBook;
  self.nextMonthBook = nextMonthBook;
  self.booksRead = booksRead;
  self.date = new Date();
  self.client = null;
  self.new = 0;
  self.keep = 0;
  self.voted = [];

  self.amazon = amazon.createClient({
    awsId    : process.env.AWSID || self.config.awsId,
    awsSecret: process.env.AWSSECRET || self.config.awsSecret,
    awsTag   : 'BookClub',
  });

  self.update = schedule.scheduleJob('0 0 1 * *', () => {
    if (self.client !== null) {
      console.log('Scheduled update');
      const month = self.date.getMonth();
      self.changeBook(self.client, month, self.config.channels[0]);
    } else {
      console.log('update failed');
    }
  });

  self.thisMonth = (client, { args }, cmdArgs) => {
    console.log('in thisMonth');
    const month = self.date.getMonth();
    self.client = client;
    if (month === self.thisMonthBook.month) {
      client.say(
        args[0],
        `This months book is ${self.thisMonthBook.title} by ${self.thisMonthBook.author}, ${self.thisMonthBook.link}`
      );
    } else {
      self.changeBook(client, month, args[0]);
    }
  };

  self.nextMonth = (client, { args }, cmdArgs) => {
    console.log('in nextMonth');
    const month = self.date.getMonth();
    self.client = client;
    if (month === self.thisMonthBook.month) {
      client.say(
        args[0],
        `Next months book is ${self.nextMonthBook.title} by ${self.nextMonthBook.author}, ${self.nextMonthBook.link}`
      );
    } else {
      self.changeBook(client, month, args[0]);
    }
  };

  self.suggest = (client, { args, nick }, cmdArgs) => {
    console.log('in suggest');
    self.client = client;
    const input = cmdArgs.split('; ');

    if (input[0] === '') {
      client.say(args[0], 'You must provide a title');
      return false;
    }
    if (input.length !== 3) {
      if (input.length !== 2) {
        input.push('unknown');
        input.push(null);
      } else if (input.length === 2) {
        input.push(null);
      }
    }

    const books = _.filter(
      self.booksToRead,
      book => book.title.toLowerCase() === input[0].toLowerCase()
    );
    const titles = _.map(books, book => book.title.toLowerCase());
    const read = _.filter(
      self.booksRead,
      book => book.title.toLowerCase() === input[0].toLowerCase()
    );
    const titlesRead = _.map(read, book => book.title.toLowerCase());

    const title = input[0].toString();
    const author = input[1].toString();
    let pages = input[2];

    if (!_.isNumber(pages)) {
      pages = null;
    }
    if (
      _.includes(titlesRead, title.toLowerCase()) ||
      title.toLowerCase() === self.thisMonthBook.title.toLowerCase() ||
      title.toLowerCase() === self.nextMonthBook.title.toLowerCase()
    ) {
      client.say(args[0], 'That book has already been read');
    } else if (_.includes(titles, title.toLowerCase())) {
      client.say(args[0], 'That book has already been suggested');
    } else {
      self.amazon.itemSearch(
        {
          title,
          author,
          searchIndex: 'Books',
        },
        (err, results) => {
          let link;
          if (err) {
            console.log(err);
            link = 'No link found';
          } else {
            const result = results[0].DetailPageURL[0].split('%');
            link = result[0];
          }
          self.booksToRead.push({ title, author, pages, suggested: nick, month: 0, link });
          self.write('booksToRead', self.booksToRead);
          client.say(args[0], 'Book added!');
        }
      );
    }
  };

  self.changeBook = (client, month, channel) => {
    console.log('changing book');
    // add book to read list
    self.setTopic(
      client,
      channel,
      `This months book is ${self.nextMonthBook.title} by ${self.nextMonthBook.author} || This months discussion: ${self.thisMonthBook.title}`
    );
    self.booksRead.push(thisMonthBook);
    self.write('booksRead', self.booksRead);
    // choose random book from booksToRead
    self.thisMonthBook = self.nextMonthBook;
    const newbook = Math.floor(Math.random() * self.booksToRead.length);
    self.nextMonthBook = self.booksToRead[newbook];
    self.booksToRead.splice(newbook, 1);
    self.nextMonthBook.month = month + 1 % 12;
    // write out booksToRead and thisMonthBook
    self.write('booksToRead', self.booksToRead);
    self.write('thisMonthBook', self.thisMonthBook);
    self.write('nextMonthBook', self.nextMonthBook);
    // say book and cvhange TOPIC
    client.say(
      channel,
      `This months book is ${self.thisMonthBook.title} by ${self.thisMonthBook.author} suggested by ${self.thisMonthBook.suggested}, ${self.thisMonthBook.link}`
    );
    client.say(
      channel,
      `Next months book is ${self.nextMonthBook.title} by ${self.nextMonthBook.author} suggested by ${self.nextMonthBook.suggested}, ${self.nextMonthBook.link}`
    );
  };

  self.setTopic = (client, channel, topic) => {
    // ignore if not configured to set topic
    if (_.isUndefined(config.setTopic) || !config.setTopic) {
      return false;
    }
    // construct new topic
    let newTopic = topic;
    if (!_.isUndefined(config.topicBase)) {
      newTopic = `${topic} ${config.topicBase}`;
    }
    // set it
    client.send('TOPIC', channel, newTopic);
  };

  self.write = (fileName, file) => {
    fileName = `plugin_code/bookclub/config/${fileName}.json`;
    fs.writeFile(fileName, JSON.stringify(file, null, 2), err => {
      if (err) return console.log(err);
      console.log(`writing to ${fileName}`);
    });
  };

  self.showBooks = (client, { nick }, cmdArgs) => {
    self.client = client;
    for (let i = 0; i < self.booksToRead.length; i++) {
      client.say(
        nick,
        ` [${i}] ${self.booksToRead[i].title} by ${self.booksToRead[i].author} suggested by ${self.booksToRead[i].suggested}, ${self.booksToRead[i].link}`
      );
    }
  };

  self.showRead = (client, { nick }, cmdArgs) => {
    self.client = client;
    for (let i = 0; i < self.booksRead.length; i++) {
      let month = 'No Month';
      switch (self.booksRead[i].month) {
        case 0:
          month = 'January';
          break;
        case 1:
          month = 'Febuary';
          break;
        case 2:
          month = 'March';
          break;
        case 3:
          month = 'April';
          break;
        case 4:
          month = 'May';
          break;
        case 5:
          month = 'June';
          break;
        case 6:
          month = 'July';
          break;
        case 7:
          month = 'August';
          break;
        case 8:
          month = 'September';
          break;
        case 9:
          month = 'October';
          break;
        case 10:
          month = 'November';
          break;
        case 11:
          month = 'December';
          break;
      }
      client.say(
        nick,
        `${month}: ${self.booksRead[i].title} by ${self.booksRead[i].author} suggested by ${self.booksRead[i].suggested}, ${self.booksRead[i].link}`
      );
    }
  };

  self.vote = (client, message, cmdArgs) => {
    const args = cmdArgs.split(' ', 1);
    self.client = client;
    if (args[0] === '') {
      client.say(message.args[0], `Keep: ${self.keep} Against: ${self.new}`);
    } else {
      if (_.includes(self.voted, message.nick.toLowerCase())) {
        client.say(message.args[0], `${message.nick} you've arlready voted`);
        return false;
      } else {
        if (args[0].toLowerCase() === 'keep') {
          self.keep++;
          self.voted.push(message.nick.toLowerCase());
          client.say(message.args[0], `Keep: ${self.keep} Against: ${self.new}`);
        } else {
          if (args[0].toLowerCase() === 'new') {
            if (self.new === 2) {
              self.startTimeout = setTimeout(self.startTimeoutFunction, 10 * 60 * 1000);
            }
            self.new++;
            self.voted.push(message.nick.toLowerCase());
            if (self.new === 6 && self.keep === 0) {
              const month = self.date.getMonth();
              self.changeBook(self.client, month, message.args[0]); // NOTE: need to fix change book
              self.keep = 0;
              self.new = 0;
              self.voted = [];
              clearTimeout(self.startTimeout);
              return true;
            }
            client.say(message.args[0], `Keep: ${self.keep} Against: ${self.new}`);
          } else {
            client.say(message.args[0], `${args[0]} is not a valid input`);
          }
        }
      }
    }
  };

  self.startTimeoutFunction = () => {
    clearTimeout(self.startTimeout);
    if (self.client !== null) {
      if (self.new > self.keep) {
        const month = self.date.getMonth() - 1;
        self.changeBook(self.client, month, self.config.channels[0]);
      } else {
        self.client.say(self.config.channels[0], "You've voted to keep this months book");
      }
      self.keep = 0;
      self.new = 0;
      self.voted = [];
    }
  };
};

exports = module.exports = Bookclub;
