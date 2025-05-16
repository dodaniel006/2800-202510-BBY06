// Update Slider and Label
document.getElementById("slider").addEventListener("mousemove", getValue);
document.getElementById("slider").addEventListener("change", getValue);

function getValue() {
    let value = document.getElementById("slider").value;
    document.getElementById("sliderLabel").innerHTML = "Point Value: " + value;
}

// Check for URL parameters and prefill form
document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    const description = urlParams.get('description');
    
    // Prefill form if parameters exist
    if (name) {
        document.getElementById('name').value = name;
    }
    
    if (description) {
        document.getElementById('description').value = description;
    }
});

// Create Task

document.getElementById("create").addEventListener("click", createTask);

async function createTask() {

    let name = document.getElementById("name").value;
    let description = document.getElementById("description").value;
    let value = document.getElementById("slider").value;

    const response1 = await fetch(`/api/task/createTaskEntry`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskName: name, taskDescription: description, taskValue: value }),
    }).then(
        setTimeout(function(){
            window.location='/home'
        }, 500)
    );
}