var _ = require('underscore'),
    fs = require('fs'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env],
    toRead = require('../../config/booksToRead.json'),
    booksRead = require('../../config/booksRead.json');
    thisMonthBook = require('../../config/thisMonthBook.json');

var Bookclub = function Bookclub() {
  var self = this;
  self.config = config;
  self.toRead = toRead;
  self.thisMonthBook = thisMonthBook;
  self.booksRead = booksRead;
  self.toReadFileName = 'plugin_code/bookclub/config/booksToRead.json';
  self.thisMonthFileName = 'plugin_code/bookclub/config/thisMonthBook.json';
  self.booksReadFileName = 'plugin_code/bookclub/config/booksRead.json';

  self.thisMonth = function (client, message, cmdArgs) {
    var d = new Date();
    var month = d.getMonth();
    if (month === self.thisMonthBook.month) {
      client.say(message.args[0], 'This months book is ' + self.thisMonthBook.title + ' by ' + self.thisMonthBook.author);
    } else {
      self.changeBook(client, month, message.args[0]);
    }
  };

  self.suggest = function (client, message, cmdArgs) {
    var input = cmdArgs.split("; ");
    if (input.length !== 3) {
      if (input.length !== 2) {
        input.push("unknown"); input.push(null);
      }else if (input.length === 2) { input.push(null) }
    }

    var books = _.filter(self.toRead, function (book) { return book.title.toLowerCase() === input[0].toLowerCase(); });
    var titles = _.map(books, function (book) { return book.title.toLowerCase(); });
    var read = _.filter(self.booksRead, function (book) { return book.title.toLowerCase() === input[0].toLowerCase(); });
    var titlesRead = _.map(read, function (book) { return book.title.toLowerCase(); });
    console.log(books);
    console.log(titles);
    console.log(titlesRead);

    if (_.contains(titlesRead, input[0].toLowerCase())) {
      client.say(message.args[0], 'That book has already been read');
    } else if (!_.contains(titles, input[0].toLowerCase())) {
      self.toRead.push( { title: input[0], author: input[1], pages: input[2], suggested: message.nick, month: 0} );
      fs.writeFile(self.toReadFileName, JSON.stringify(self.toRead, null, 2), function (err) {
        if (err) return console.log(err);
        console.log('writing to ' + self.toReadFileName);
      });
      client.say(message.args[0], 'Book added!');
    } else client.say(message.args[0], 'That book has already been suggested');
  };

  self.changeBook = function (client, month, channel) {
    //add book to read list
    self.booksRead.push(thisMonthBook);
    fs.writeFile(self.booksReadFileName, JSON.stringify(self.booksRead, null, 2), function (err) {
      if (err) return console.log(err);
      console.log('writing to ' + self.booksReadFileName);
    });
    //choose random book from toRead
    newbook = Math.floor(Math.random()*self.toRead.length);
    self.thisMonthBook = self.toRead[newbook];
    self.toRead.splice(newbook, 1);
    self.thisMonthBook.month = month;
    // write out toRead and thisMonthBook
    fs.writeFile(self.toReadFileName, JSON.stringify(self.toRead, null, 2), function (err) {
      if (err) return console.log(err);
      console.log('writing to ' + self.toReadFileName);
    });
    fs.writeFile(self.thisMonthFileName, JSON.stringify(self.thisMonthBook, null, 2), function (err) {
      if (err) return console.log(err);
      console.log('writing to ' + self.thisMonthFileName);
    });
    //say book and cvhange TOPIC
    client.say(channel, 'This months book is ' + self.thisMonthBook.title + ' by ' + self.thisMonthBook.author + ' suggested by ' + self.thisMonthBook.suggested);
    self.setTopic(client, channel, 'This months book is ' + self.thisMonthBook.title + ' by ' + self.thisMonthBook.author)
  };

  self.setTopic = function (client, channel, topic) {
    // ignore if not configured to set topic
    if (typeof config.setTopic === 'undefined' || !config.setTopic) {
      return false;
    }
    // construct new topic
    var newTopic = topic;
    if (typeof config.topicBase !== 'undefined') {
      newTopic = topic + ' ' + config.topicBase;
    }
    // set it
    client.send('TOPIC', channel, newTopic);
  };
}

exports = module.exports = Bookclub;
