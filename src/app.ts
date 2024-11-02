import express from 'express';
import path from 'node:path';
import { dirname } from 'path';
import passport from 'passport';

import session from './config/session.js';
import './config/passport.js';

import indexRouter from './routes/index.js';
import homeRouter from './routes/home.js';
import signupRouter from './routes/signup.js';
import usersRouter from './routes/users.js';
import foldersRouter from './routes/folders.js';
import filesRouter from './routes/files.js';
import favoritesRouter from './routes/favorites.js';

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

// routes
app.use('/', indexRouter);
app.use('/home', homeRouter);
app.use('/sign_up', signupRouter);
app.use('/users', usersRouter);
app.use('/folders', foldersRouter);
app.use('/files', filesRouter);
app.use('/favorites', favoritesRouter);

app.listen(PORT, () => console.log(`App running on port ${PORT}`));
