//TODO: get a list of the ids for the deck & username

var idList = [];

function getIdList() {
    return new Promise(function(resolve,reject){
        var xhr = new XMLHttpRequest();
        var urlString = "/getId/?deck="+document.getElementById('deckName').textContent;
        xhr.open('GET',urlString,true);
        xhr.addEventListener('load',function(){
            if (xhr.status>=200 && xhr.status<400) {
                console.log('req done');
                var results = JSON.parse(xhr.responseText);
                for (let obj of results) {
                    idList.push(obj.id);
                }
                resolve(idList);
            }
            else {
                console.log('error with request')
            }
        })
        xhr.send(null);
    })
}

getIdList().then(getRandomId)
.then(getCard).then(prepCards).catch(function(){console.log('err')});

// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

//select an id from random from the list
function getRandomId(idList) {
    return new Promise(function(resolve,reject){
        var randomId = idList[getRandomInt(idList.length)];
        console.log('get random Id');
        resolve(randomId);
        reject('reject');
    })
}

//get question and answer for given id
function getCard(id){
    return new Promise(function(resolve,reject){
        console.log('getCard');
        var xhr = new XMLHttpRequest();
        var urlString = '/getCard/?id='+id;
        xhr.open('GET',urlString,true);
        xhr.addEventListener('load',function(){
            if (xhr.status>=200 && xhr.status<400) {
                var result = JSON.parse(xhr.responseText)[0];
                var card = {};
                card.question = result.question;
                card.answer = result.answer;
                console.log(card);
                resolve(card);
            }
            else {
                console.log('error with request')
            }
        })
        xhr.send(null);
    })
}

// fill the question with the first id & add event listener for reveal button
function prepCards(card) {
    return new Promise(function(resolve,reject){
        console.log('prep card');
        document.getElementById('question').textContent=card.question;
        document.getElementById('answerSpan').textContent=card.answer;
        document.getElementById('answerSpan').setAttribute('hidden',true);
        document.getElementById('answerButton').removeAttribute('hidden');
        document.getElementById('responseButtons').removeEventListener('click',feedbackClick);  // remove old event listener so can choose right/wrong until answer is revealed
        document.getElementById('answerButton').addEventListener('click',reveal)
        resolve()
    })
}

// when button clicked, reveal answer & hide button

function reveal(event){
    document.getElementById('answerSpan').removeAttribute('hidden');
    document.getElementById('answerButton').setAttribute('hidden',true);
    event.stopPropagation();
    // add event listener for the click on wrong/right buttons
    document.getElementById('responseButtons').addEventListener('click',feedbackClick)
}

// add 1 to review tally and 1 to correct tally if correct, load next card

function feedbackClick(event) {
    if (event.target.id==='rightButton') {
        document.getElementById('correctTally').textContent++;
    }
    document.getElementById('reviewTally').textContent++;
    nextCard();
}

// get next question and answer & start process over

function nextCard(){
    getRandomId(idList).then(getCard).then(prepCards).catch(function(){console.log('err')})
}