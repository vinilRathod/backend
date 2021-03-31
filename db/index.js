const mysql = require("mysql");
const config = require("../config");
var connection = mysql.createConnection(config.mysql);
connection.connect( err =>{
    if(err) console.log(err);
});

module.exports=connection;