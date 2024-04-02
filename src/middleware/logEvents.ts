import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import fs, { promises } from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const logEvents = async (message: string, logName: string) => {
  const dateTime = `${format(new Date(), 'dd.MM.yyyy\tHH:mm:ss')}`;
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
  console.log(logItem);
  try {
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
      await promises.mkdir(path.join(__dirname, '..', 'logs'));
    }
    await promises.appendFile(
      path.join(__dirname, '..', 'logs', logName),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};

const logger = (req: Request, res: Response, next: NextFunction) => {
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.log');
  console.log(`${req.method} ${req.path}`);
  next();
};

export { logEvents, logger };
