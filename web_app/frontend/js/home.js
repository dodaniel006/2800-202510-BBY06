// Send this user to the mail room to be added to the end of a list
const response1 = fetch(`/api/game/send`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        data: {"test": "Hello!"}
    })
});

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
    var taskNumber = 0;
    for (let i = 0; i < result.message.length; i++) {
        let task = result.message[i];

        let cardTemplate = document.getElementById("taskTemplate");
        let newcard = cardTemplate.content.cloneNode(true)

        newcard.getElementById("parent").id = "task" + taskNumber
        newcard.getElementById("taskName").textContent = task.taskName + " | Points: " + task.taskValue;
        newcard.getElementById("taskDescription").innerHTML = task.taskDescription;
        newcard.querySelector(".button").setAttribute("taskValue", task.taskValue);
        newcard.querySelector(".button").setAttribute("taskId", task._id);
        newcard.querySelector(".button").setAttribute("taskNumber", "task" + taskNumber);
        // document.querySelector(".button").taskId = task._id;
        // newcard.getElementById("taskValue").innerHTML = task.taskValue;
        document.getElementById("cardHolder").append(newcard);
        taskNumber++;
    }
}

// Send Points on complete task
var points;
var task;
var taskNumber;
var taskButtons = document.getElementsByClassName("taskButton");

function setPoints() {
    points = this.getAttribute("taskValue");
    task = this.getAttribute("taskId");
    taskNumber = this.getAttribute("taskNumber");
}

for (let i = 0; i < taskButtons.length; i++) {
    taskButtons[i].addEventListener("click", setPoints);
}

document.getElementById("complete").addEventListener("click", sendPoints);

function sendPoints() {
    // Get points to add

    const response2 = fetch(`/api/game/points`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: {"scoreAdd": points}
        })
    })
    console.log(task);
    const response3 = fetch(`/api/task/removeTaskEntry`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            taskId: task
        })
    })
    document.getElementById(taskNumber).remove();
}