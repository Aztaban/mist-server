require('dotenv').config();
import express, {Express, Request, Response, Application} from 'express';

const app: Application = express();
const port = process.env.PORT || 3500;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & Typescript Server')
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
})