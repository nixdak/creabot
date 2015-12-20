var _ = require('underscore'),
    tabletojson = require('tabletojson'),
    config = require('../../config/config.json');

var Popping = function Popping() {
  var self = this;
  self.config = config;
}

exports = module.exports = Popping;
