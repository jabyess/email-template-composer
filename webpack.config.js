var path = require('path');


const PATHS = {
	app: path.join(__dirname, 'src'),
	build: path.join(__dirname, 'dist'),
	sass: path.join(__dirname, 'src/sass')
}

module.exports = {
	entry : {
		main: ['whatwg-fetch', path.join(__dirname, 'src/react-main.jsx')],
	},
	output: {
		path: PATHS.build,
		publicPath: '/',
		filename: 'react-[name].js'
	},
	module: {
		loaders: [
			{
				test : /\.sass/,
				loaders: ['style','css','sass'],
			},
			{
				test: /\.jsx?$/,
				include: PATHS.app,
				loader: 'babel',
				exclude: /node_modules/,
				query: {
					presets: [ 'es2015', 'react' ],
					cacheDirectory: true
				}
			},
			{
				test: /\.handlebars$/,
				loader: 'handlebars-loader'
			}
		]

	}
}
