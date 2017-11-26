import Bot from './Bot';
import pkg from '../package.json';
import glob from 'glob';
import { promisify } from 'util';

const globP = promisify(glob);
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log(pkg.name, pkg.version, process.env.NODE_ENV);
const bot = new Bot();
bot.init();
globP(`${__dirname}/../plugins/*.js`)
  .then(files => {
    files.forEach(pluginName => {
      import(pluginName)
        .then(plugin => {
          plugin.default(bot);
          console.log(`Loaded ${pluginName} plugin.`);
        })
        .catch(err => {
          console.error(err);
          process.exit(1);
        });
    });
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
