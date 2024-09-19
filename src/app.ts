import express from 'express';
import path from 'node:path';
import { dirname } from 'path';

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

app.listen(PORT, () => console.log(`App running on port ${PORT}`));
