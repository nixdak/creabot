var _ = require('underscore'),
    fs = require('fs'),
    schedule = require('node-schedule');
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env],
    booksToRead = require('../../config/booksToRead.json'),
    booksRead = require('../../config/booksRead.json'),
    thisMonthBook = require('../../config/thisMonthBook.json'),
    nextMonthBook = require('../../config/nextMonthBook.json');


var Bookclub = function Bookclub() {
  var self = this;
  self.config = config;
  self.booksToRead = booksToRead;
  self.thisMonthBook = thisMonthBook;
  self.nextMonthBook = nextMonthBook;
  self.booksRead = booksRead;
  self.date = new Date();

  self.update = schedule.scheduleJob('0 0 1 * *', function(){
    console.log('Scheduled update');
    self.changeBook();
  });

  self.thisMonth = function (client, message, cmdArgs) {
    console.log('in thisMonth');
    var month = self.date.getMonth();
    if (month === self.thisMonthBook.month) {
      client.say(message.args[0], 'This months book is ' + self.thisMonthBook.title + ' by ' + self.thisMonthBook.author);
    } else {
      self.changeBook(client, month, message.args[0]);
    }
  };

  self.nextMonth = function (client, message, cmdArgs) {
    console.log('in nextMonth');
    var month = self.date.getMonth();
    if (month === self.thisMonthBook.month) {
      client.say(message.args[0], 'Next months book is ' + self.nextMonthBook.title + ' by ' + self.nextMonthBook.author);
    } else {
      self.changeBook(client, month, message.args[0]);
    }
  };

  self.suggest = function (client, message, cmdArgs) {
    console.log('in suggest');
    var input = cmdArgs.split("; ");
    if (input[0] === "") {
      client.say(message.args[0], 'You must provide a title');
      return false;
    }
    if (input.length !== 3) {
      if (input.length !== 2) {
        input.push("unknown"); input.push(null);
      } else if (input.length === 2) { input.push(null) }
    }

    var books = _.filter(self.booksToRead, function (book) { return book.title.toLowerCase() === input[0].toLowerCase(); });
    var titles = _.map(books, function (book) { return book.title.toLowerCase(); });
    var read = _.filter(self.booksRead, function (book) { return book.title.toLowerCase() === input[0].toLowerCase(); });
    var titlesRead = _.map(read, function (book) { return book.title.toLowerCase(); });

    var title = input[0].toString(), author = input[1].toString(), pages = input[2];
    if (typeof pages !== "number") { pages = null }
    if (_.contains(titlesRead, title.toLowerCase()) || title.toLowerCase() === self.thisMonthBook.toLowerCase() || title.toLowerCase() === self.nextMonthBook.toLowerCase()) {
      client.say(message.args[0], 'That book has already been read');
    } else if (!_.contains(titles, title.toLowerCase())) {
      self.booksToRead.push( { title: title, author: author, pages: pages, suggested: message.nick, month: 0} );
      self.write('booksToRead', self.booksToRead);
      client.say(message.args[0], 'Book added!');
    } else client.say(message.args[0], 'That book has already been suggested');
  };

  self.changeBook = function (client, month, channel) {
    console.log('changing book');
    //add book to read list
    self.setTopic(client, channel, 'This months book is ' + self.nextMonthBook.title + ' by ' + self.nextMonthBook.author + ' || This months discussion: ' + self.thisMonthBook.title)
    self.booksRead.push(thisMonthBook);
    self.write('booksRead', self.booksRead);
    //choose random book from booksToRead
    self.thisMonthBook = self.nextMonthBook;
    newbook = Math.floor(Math.random()*self.booksToRead.length);
    self.nextMonthBook = self.booksToRead[newbook];
    self.booksToRead.splice(newbook, 1);
    self.nextMonthBook.month = month+1%12;
    // write out booksToRead and thisMonthBook
    self.write('booksToRead', self.booksToRead);
    self.write('thisMonthBook', self.thisMonthBook);
    self.write('nextMonthBook', self.nextMonthBook);
    //say book and cvhange TOPIC
    client.say(channel, 'This months book is ' + self.thisMonthBook.title + ' by ' + self.thisMonthBook.author + ' suggested by ' + self.thisMonthBook.suggested);
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

  self.write = function (fileName, file) {
    fileName = 'plugin_code/bookclub/config/' + fileName + '.json';
    fs.writeFile(fileName, JSON.stringify(file, null, 2), function (err) {
      if (err) return console.log(err);
      console.log('writing to ' + fileName);
    });
  };

  self.showBooks = function (client, message, cmdArgs) {
    var list = "";
    for (var i = 0; i < self.booksToRead.length; i++) {
      var message =+ '[' + i + '] ' + self.booksToRead[i].title + ' by ' + self.booksToRead[i].author + ' suggested by ' + self.booksToRead[i].suggested + ' ';
    }
    client.say(message.nick, list);
  };
}

exports = module.exports = Bookclub;
