const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

let mode =
 (process.env.NODE_ENV && process.env.NODE_ENV == "production")
    ? "production"
    : "development";

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    //libraryTarget: 'commonjs2', // when enabled, UXP Developer Tool always gives an error "module is not defined"
  },
  devtool: (mode == "production") ? false : 'cheap-source-map', 
  externals: {
    uxp: 'commonjs2 uxp',
    photoshop: 'commonjs2 photoshop',
    os: 'commonjs2 os',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          plugins: [
            ["transform-react-jsx", {
              "pragma": "h", // default pragma is React.createElement
              "pragmaFrag": "Fragment", // default is React.Fragment
            }],
          ],
        },
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        exclude: /node_modules/,
        loader: 'file-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: ['plugin'],
    }),
  ],
};
