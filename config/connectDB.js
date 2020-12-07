const mongoose = require('mongoose');
require("dotenv").config();
//mongodb://heroku_qdnj3gz6:fma2rkmtfpj405j9qh1oa7nk2s@ds015878.mlab.com:15878/heroku_qdnj3gz6
//${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}
let url = "mongodb+srv://kingeagles:sliverdz2604@clusterp2h.ijpit.mongodb.net/app_chat?retryWrites=true&authSource=admin&w=majority";
let connectDB = async () => {
        try {
            await mongoose.connect(process.env.URI,{useNewUrlParser : true,useUnifiedTopology:true,useFindAndModify: false})
        } catch (error) {
            console.log(error)
        }
}

module.exports = connectDB;
