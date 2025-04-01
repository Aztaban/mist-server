import express, { Request, Response, Router } from "express";
import path from 'path';

const router: Router = express.Router();

/**
 * Route handler for the homepage.
 * This route matches either:
 *  - the root path `/`
 *  - `/index`
 *  - `/index.html`
 * When one of these paths is accessed via a GET request,
 * it responds by sending the `index.html` file located in the `views` directory.
 */
router.get('^/$|/index(.html)?', (req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

export = router;