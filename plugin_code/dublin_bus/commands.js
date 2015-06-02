var DublinBusInfo = require('./controllers/dublin_bus_info.js');

module.exports = function(app) {
    var dublinBusInfo= new DublinBusInfo();

    app.cmd('dbus', '', dublinBusInfo.showStopInfo);
}
