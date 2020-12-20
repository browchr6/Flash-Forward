var express = require('express');
var mysql = require('./dbcon.js');
var app = express();
app.set('port',3000);

var CORS = require('cors');
app.use(CORS());

var handlebars = require('express-handlebars').create({defaultLayout:'main'})
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

var session = require('express-session');
app.use(session({secret:'SuperSecretPassword'}));

app.use(express.json());
app.use(express.urlencoded({extended:false}));

var request = require('request');

app.use(express.static('public'));

const getAllQuery = "SELECT `id`,`username`,`deck`,`question`,`answer`,`review_count`,`correct_count` FROM flashcards";
const getDeckNames = "SELECT deck, COUNT(id) FROM flashcards WHERE username=? GROUP BY deck";
const getCards = "SELECT `id`,`username`,`deck`,`question`,`answer`,`review_count`,`correct_count` FROM flashcards WHERE deck=? AND username=?";
const insertCard = "INSERT INTO flashcards (`username`,`deck`,`question`,`answer`,`review_count`,`correct_count`) VALUES (?,?,?,?,0,0)";
const updateQuery = "UPDATE flashcards SET username=?, name=?, deck=?,question=?,answer=?, review_count=?, correct_count=? WHERE id=? ";
const deleteQuery = "DELETE FROM flashcards WHERE id=?";
const dropTableQuery = "DROP TABLE IF EXISTS flashcards";
const makeTableQuery =  `CREATE TABLE flashcards(
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        username VARCHAR(255) NOT NULL,
                        deck VARCHAR(255) NOT NULL,
                        question VARCHAR(255) NOT NULL,
                        answer TEXT(10000) NOT NULL,
                        review_count INT,
                        correct_count INT
                        );`;

function getDecks (username,res) {
    mysql.pool.query(getDeckNames,[username],function(err, results){
        var context = {};
        context.name = username;
        var decks = [];
        for (let row of results||false) {
            decks.push({"deck":row.deck,"cardCount":row['COUNT(id)']});
        }
        context.decks = decks;
        res.render('home',context);
    })
}

app.get('/',function(req,res){
    // check if new session (username)
    if (req.query.username) {
        session.username = req.query.username;
    }
    if (!session.username) {
        res.render('login');
        return
    }
    // if 'open' then render deck
    if (req.query.openDeck) {
        console.log("open deck request");
        var context = {};
        context.deck = req.query.deck;
        context.cardCount = req.query.cardCount;
        // get cards and render deck view
        mysql.pool.query(getCards,[req.query.deck,session.username],function(err,results){
            var cards = [];
            for (let row of results) {
                cards.push({"id":row.id,"username":row.username,"deck":row.deck,"question":row.question,"answer":row.answer,"review_count":row.review_count,"correct_count":row.correct_count})
            };
            context.cards = cards;
            res.render('deck',context);
        })
    }
    // get decknames
    else {
        getDecks(session.username, res);
    }
})

app.post('/', function(req,res,next){
    if (req.body.newDeck) {
        mysql.pool.query(insertCard,[session.username,req.body.deck,req.body.question,req.body.answer], function(err,results){
            getDecks(session.username,res);
        })
    }
    if (req.body.addCard) {
        console.log("add card request");
        var context = {};
        context.deck = req.body.deck;
        context.cardCount = req.body.cardCount;
        mysql.pool.query(insertCard,[session.username,req.body.deck,req.body.question,req.body.answer], function(err,results){
            //TODO: optional: use JS to update the card, for now just re-rendering the page
            context.cardCount++;
            // get cards and render deck view
            mysql.pool.query(getCards,[context.deck,session.username],function(err,results){
                var cards = [];
                for (let row of results) {
                    cards.push({"id":row.id,"username":row.username,"deck":row.deck,"question":row.question,"answer":row.answer,"review_count":row.review_count,"correct_count":row.correct_count})
                }
                context.cards = cards;
                res.render('deck',context);
            })
        })
    }
})

app.delete('/',function(req,res,next){
    console.log(req.body)
})

app.get('/reset-table',function(req,res,next){
    mysql.pool.query(dropTableQuery, function(err){
      mysql.pool.query(makeTableQuery, function(err){
          if (err) {
              console.log(err);
              next(err);
          }
          else {
            console.log("Table reset");
            res.render('home');
          }
      })
    });
  });

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});