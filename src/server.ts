import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import connectDB from './config/dbConn';
import corsOptions from './config/corsOptions';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import errorHandler from './middleware/errorHandler';
import credentials from './middleware/credentials';
import verifyJWT from './middleware/verifyJWT';
import { logEvents, logger } from './middleware/logEvents';
import verifyRoles from './middleware/verifyRoles';

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3500', 10);

// Connect to mongo DB
connectDB();

app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cokies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded data
// in other words, form data:
// 'content-type: application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

// serve static files
app.use('/', express.static(path.join(__dirname, '../public')));

// routes
app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/api/products'));
app.use('/posts', require('./routes/api/posts'));

// Middleware to verify JWT for the routes below
app.use(verifyJWT);

// verified routes
app.use('/orders', require('./routes/api/orders'));
app.use('/users', require('./routes/api/users'));

// default route
app.all('/*', (req: Request, res: Response) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () =>
    console.log(`Server is running at http://localhost:${PORT}`)
  );
});

mongoose.connection.on('error', (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t{err.hostname}`,
    'mongoErrLog.log'
  );
});
