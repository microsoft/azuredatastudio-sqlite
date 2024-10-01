/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

'use strict';

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { NLSBundlePlugin } = require('vscode-nls-dev/lib/webpack-bundler');

const id = `microsoft.azuredatastudio-sqlite`;

/** @type WebpackConfig */
module.exports = {
	mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
	target: 'node', // extensions run in a node context
	node: {
		__dirname: false // leave the __dirname-behaviour intact
	},
	resolve: {
		mainFields: ['module', 'main'],
		extensions: ['.ts', '.js'] // support ts-files and js-files
	},
	module: {
		rules: [{
			test: /\.ts$/,
			exclude: /node_modules/,
			use: [{
				// vscode-nls-dev loader:
				// * rewrite nls-calls
				loader: 'vscode-nls-dev/lib/webpack-loader',
				options: {
					base: path.join(__dirname, 'src')
				}
			}, {
				// configure TypeScript loader:
				// * enable sources maps for end-to-end source maps
				loader: 'ts-loader',
				options: {
					compilerOptions: {
						'sourceMap': true,
					}
				}
			}]
		}]
	},
	externals: {
		'vscode': 'commonjs vscode', // ignored because it doesn't exist
		'azdata': 'commonjs azdata',
		'sqlite3': 'commonjs sqlite3'
	},
	output: {
		// all output goes into `dist`.
		// packaging depends on that and this must always be like it
		filename: '[name].js',
		path: path.join(__dirname, 'out'),
		libraryTarget: 'commonjs',
	},
	// yes, really source maps
	devtool: 'source-map',
	plugins: [
		// @ts-ignore
		new CopyWebpackPlugin([
			{ from: 'src', to: '.', ignore: ['**/test/**', '*.ts'] }
		]),
		new NLSBundlePlugin(id)
	],
	context: __dirname,
	entry: {
		index: './src/index.ts'
	}
};
