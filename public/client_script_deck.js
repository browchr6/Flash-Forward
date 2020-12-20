//TODO: create event listener for cardList

//TODO: create event listener for add card button and prevent default. add card to list

//TODO: add event listener for delete button and send JSON obj with id through delete request

document.addEventListener('DOMContentLoaded',function(){
    var table = document.getElementById('deckTable');
    table.addEventListener('click',function(event){tableClick(event)})
})

function tableClick(event) {
    console.log('click registered');
    if (event.target.name === 'delete') {
        var xhr = new XMLHttpRequest();
        xhr.open('delete','localhost:3000/',true);
        xhr.setRequestHeader('Content-Type','application/json');
        var payload = {};
        // go to parent node of event target, getElementsByTagName(input)
        var current = event.target;
        current = current.parentNode;
        current = current.parentNode; // this will be the row element
        var inputs = current.getElementsByTagName('input');
        // select id node and get value, store in payload.id
        console.log(idNode);
        var idNode = inputs[0];
        payload.id = idNode.id;
        console.log(payload)
        xhr.addEventListener('load',function(){
            if (xhr.status>=200 && xhr.status<400) {
                var result = JSON.parse(xhr.responseText);
                // check result
                var tbody = current.parentNode;
                tbody.removeChild(current);
            }
            else {
                console.log('network error');
            }
        })
        xhr.send(JSON.stringify(payload));
        event.preventDefault();
    }
    if (event.target.name ==='edit') {
        var xhr = new XMLHttpRequest();
        xhr.open('put','localhost:3000/',true);
        xhr.setRequestHeader('Content-Type','application/json');
        var payload = {};
        var current = event.target;
        current = current.parentNode;
        current = current.parentNode;
        current = current.parentNode;
        var inputs = current.querySelectorAll('input');
        for (let input of inputs) {
            payload[input.name] = input.value;
        }
        console.log(payload)
        xhr.addEventListener('load',function(){
            if (xhr.status>=200 && xhr.status<400) {
                var result = JSON.parse(xhr.responseText);
                var appendNode = document.getElementById('deckTable');
                appendNode = appendNode.lastElementChild; // tbody
                appendNode.appendChild(createRow);
            }
            else {
                console.log('network error');
            }
        })
        xhr.send(JSON.stringify(payload));
        event.preventDefault();
    }
}

function createRow(row) {
    var tr = document.createElement('tr');
    var td;
    for (var prop in row) {
        td = document.createElement('td');
        td.name = row.name;
        td.value = row.value;
        td.disabled = disabled;
        if (row.name === 'id' || row.name === 'review_count' || row.name === 'correct_count') {
            td.hidden = true;
            td.setAttribute('type','submit');
        }
        if (row.name === 'username') {
            td.hidden = true;
        }
        if (row.name === 'edit' || row.name === 'delete') {
            td.setAttribute('type','submit');
        }
        tr.appendChild(td);
    }
    return tr;
}