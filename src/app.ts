import express, { Request, Response } from 'express';
import path from 'node:path';
import { dirname } from 'path';
import passport from 'passport';

import usersRouter from './routes/users.js';
import session from './config/session.js';
import './config/passport.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Settings
app.set('views', path.join(import.meta.dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
const projectDir = dirname(import.meta.dirname);
app.use(express.static(path.join(projectDir, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session);
app.use(passport.session());

// index route
app.get('/', (req: Request, res: Response) => {
  res.locals.user = req.user;
  res.render('pages/home');
});

// routes
app.use('/users', usersRouter);

app.listen(PORT, () => console.log(`App running on port ${PORT}`));
