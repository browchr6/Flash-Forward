var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_browchr6',
  password        : 'Winter2020',
  database        : 'cs290_browchr6'
});

module.exports.pool = pool;
