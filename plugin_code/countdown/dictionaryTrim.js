var dictionary = require('./config/dictionary.json')['words'];
var fs = require('fs');

for(var i = 0; i < dictionary.length; i++){
    if(dictionary[i].length <= 2){
        console.log('small: ', i, ' ', dictionary[i]);
        dictionary.splice(i,1);
        i=i-4;
    }
    if(dictionary[i].length > 9){
        console.log('big: ', i, ' ', dictionary[i]);
        dictionary.splice(i,1);
        i=i-4;
    }
}

var old = JSON.stringify({ words: dictionary});
var output = './config/Dictionary.json';
var old = old.replace(/",/g, '",\r\n    ');
var old = old.replace(/"words":\[/g, '\r\n  "words": \[\r\n    ');
var old = old.replace(/\]/g, '\r\n  \]\r\n');

fs.writeFile(output, old, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + output);
    }
});
