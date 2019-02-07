const path = require('path');

module.exports = {
    context: path.resolve(__dirname, 'src'),

    mode: 'development',
    devtool: 'source-map',

    entry: './index.js',

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader', 
                options: { presets: ['env'] }
            },
            // {
            //     test: /\.(html)$/,
            //     use: {
            //         loader: 'html-loader',
            //         options: {
            //             attrs: [':data-src']
            //         }
            //     }
            // },
            {
                test: /\.html$/,
                use: 'raw-loader'
              }
              
        ] 
    },

    watch: true
};