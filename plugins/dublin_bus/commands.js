var DublinBusInfo = require('./controllers/dublin_bus_info.js');

module.exports = function(app) {
    var dublinBusInfo= new dublinBusInfo();

    app.cmd('dbus', '', dublinBusInfo.showStopInfo);
}
