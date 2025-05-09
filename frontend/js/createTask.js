// Update Slider and Label
document.getElementById("slider").addEventListener("mousemove", getValue);
document.getElementById("slider").addEventListener("change", getValue);

function getValue() {
    let value = document.getElementById("slider").value;
    document.getElementById("sliderLabel").innerHTML = "Point Value: " + value;
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

if (response.ok) {
    console.log(result.message);
}



// //Create task
// const response1 = await fetch(`/api/task/createTaskEntry`, {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ taskName: "Task1", taskDescription: "Task1Description", taskValue: 30 }),
// });

// console.log(response1)