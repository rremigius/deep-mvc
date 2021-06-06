const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
	entry: './src/index.tsx',
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			}
		],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@examples": path.resolve(__dirname, "examples")
		},
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					keep_classnames: true
				}
			})
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env.NODE_ENV": JSON.stringify("development")
		})
	]
};
