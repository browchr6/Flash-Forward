var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_username',
  password        : '',
  database        : 'cs290_username'
});

module.exports.pool = pool;
