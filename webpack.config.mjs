import path from 'node:path';

export default {
  mode: 'development',
  entry: './src/client/index.js',
  output: {
    path: path.resolve(import.meta.dirname, 'public/javascript'),
    filename: 'bundle.js',
  },
};
