const path = require('path');

module.exports = {
  entry: './build/main.js',
  mode: 'development',
  watch: true,
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    library: ['jasdjs'],
    libraryTarget: 'umd',
  },
};