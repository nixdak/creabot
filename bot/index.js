import glob from 'glob';
import { promisify } from 'util';
import Bot from './Bot';
import pkg from '../package.json';
import Logger from './logger';

const globP = promisify(glob);
const logger = Logger(`${pkg.name}: ${pkg.version}`);

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
logger.info(process.env.NODE_ENV);
const bot = new Bot(logger);
bot.connect();
globP(`${__dirname}/../plugins/*.js`)
  .then(files => {
    files.forEach(pluginName => {
      import(pluginName)
        .then(plugin => {
          plugin.default(bot);
          logger.info(`Loaded ${pluginName} plugin.`);
        })
        .catch(exit(1));
    });
  })
  .catch(exit(1));

function exit(code) {
  return err => {
    logger.error(err);
    process.exitCode = code;
  };
}
