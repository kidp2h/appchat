const path = require("path")
module.exports = {
    entry:{
         bundleMain : "./src/main.js",
         bundleAuth : "./src/authentication.js"
    },
    output: {
        path: path.resolve(__dirname, "public/javascripts"),
        filename: '[name].js'
    }
}
