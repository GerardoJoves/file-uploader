import path from 'node:path';

export default {
  mode: 'development',
  entry: './src/client/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(import.meta.dirname, 'public/javascript'),
    filename: 'bundle.js',
  },
};
