// create policy and protect third party
var config = {};
config.express = {};
config.express.port = 3000;

config.mysql = {}
config.mysql.host='localhost';
config.mysql.port= 3306;
config.mysql.database='first_hospital';
config.mysql.user='root';
config.mysql.password='#135791113';

module.exports=config;