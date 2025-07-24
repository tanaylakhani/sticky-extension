// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.ASSET_PATH = '/';

var webpack = require('webpack'),
  path = require('path'),
  fs = require('fs'),
  config = require('../webpack.config'),
  ZipPlugin = require('zip-webpack-plugin');

delete config.chromeExtensionBoilerplate;

config.mode = 'production';

var packageInfo = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

config.plugins = (config.plugins || []).concat(
  new ZipPlugin({
    filename: `${packageInfo.name}-${packageInfo.version}.zip`,
    path: path.join(__dirname, '../', 'zip'),
  })
);

console.log('🚀 Starting production build...');

webpack(config, function (err, stats) {
  if (err) {
    console.error('❌ Build failed with error:', err);
    process.exit(1);
  }

  if (stats.hasErrors()) {
    console.error('❌ Build completed with errors:');
    console.error(stats.toString({
      colors: true,
      chunks: false,
      children: false
    }));
    process.exit(1);
  }

  if (stats.hasWarnings()) {
    console.warn('⚠️  Build completed with warnings:');
    console.warn(stats.toString({
      colors: true,
      chunks: false,
      children: false,
      warnings: true,
      errors: false
    }));
  }

  console.log('✅ Build completed successfully!');
  console.log(stats.toString({
    colors: true,
    chunks: false,
    children: false,
    modules: false,
    warnings: false,
    errors: false
  }));

  console.log(`📁 Build output directory: ${path.resolve(__dirname, '../build')}`);
  console.log(`📦 Extension package: ${path.resolve(__dirname, '../zip', `${packageInfo.name}-${packageInfo.version}.zip`)}`);
});
