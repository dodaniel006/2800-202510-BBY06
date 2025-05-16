
// Get points

// var TaskValue = 0;
// var TaskId = '';

// var setClick = function()
// {
//     TaskValue = document.querySelector(".button").taskValue;
//     TaskId = document.querySelector(".button").taskId;
//     console.log(TaskValue, TaskId);
// }

// document.querySelectorAll(".button").onclick = setClick;

// Game interface
const DATAPATH = "/game/html5game/data.hazel";

document.getElementById("complete").addEventListener("click", myFunction);

async function myFunction() {
    
    const response = await fetch(`/api/game/write`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            datapath: "./frontend/game/html5game/data.hazel"
            // points: 50
        })
    }).then(
        readTextFile(DATAPATH, function(text){
            var data = JSON.parse(text);
            console.log(data);
        })
    );

    
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}


// Read all tasks
const response = await fetch(`/api/task/readUserTasks`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
});

// Credit to Jacob for this code here, I love stealing things
const result = await response.json();

// Populate cards
if (response.ok) {
    console.log(result.message);
    for (let i = 0; i < result.message.length; i++) {
        let task = result.message[i];

        let cardTemplate = document.getElementById("taskTemplate");
        let newcard = cardTemplate.content.cloneNode(true)

        newcard.getElementById("taskName").textContent = task.taskName + " | Points: " + task.taskValue;
        newcard.getElementById("taskDescription").innerHTML = task.taskDescription;
        // document.querySelector(".button").taskValue = task.taskValue;
        // document.querySelector(".button").taskId = task._id;
        // newcard.getElementById("taskValue").innerHTML = task.taskValue;
        document.getElementById("cardHolder").append(newcard);
    }
}

