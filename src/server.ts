var cookieParser = require('cookie-parser');
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import connectDB from './config/dbConn';
import corsOptions from './config/corsOptions';
import cors from 'cors';
import mongoose from 'mongoose';

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3500');

// Connect to mongo DB
// connectDB();

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

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & Typescript Server');
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () =>
    console.log(`Server is running at http://localhost:${PORT}`)
  );
});
