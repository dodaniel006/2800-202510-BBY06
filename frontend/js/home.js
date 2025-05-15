
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

// Send Points on complete task
document.getElementById("complete").addEventListener("click", sendPoints);

function sendPoints() {
    const response2 = fetch(`/api/game/points`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: {"scoreAdd": 50}
        })
    })
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