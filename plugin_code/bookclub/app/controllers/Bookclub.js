var _ = require('underscore'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env],
    books = require('../../config/books.json');

var Bookclub = function Bookclub() {
  var self = this;
  self.config = config;
  self.books = books;
  self.fileName ='plugin_code/bookclub/config/books.json';

  self.thisMonth = function (client, message, cmdArgs) {
    client.say(message.args[0], 'This months book is ' + self.config.thisMonthBook);
  };

  self.suggest = function (client, message, cmdArgs) {
    if (!_.contains(cmdArgs[0], self.books)) {
      self.books.push(cmdArgs[0]);
      fs.writeFile(self.fileName, JSON.stringify(self.books, null, 2), function (err) {
        if (err) return console.log(err);
        console.log('writing to ' + self.fileName);
      });
      client.say(message.args[0], 'Book added!');
    } else client.say(message.args[0], 'That book has already been suggested');
  }
}

exports = module.exports = Bookclub;
