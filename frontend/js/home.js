const DATAPATH = "/game/html5game/data.hazel";

document.getElementById("complete").addEventListener("click", myFunction);

// console.log('a');
// const response = await fetch(`/api/game/write`, {
// method: 'POST',
// headers: {
//     'Content-Type': 'application/json'
// },
// body: JSON.stringify({
//     datapath: "./frontend/game/html5game/data.hazel"
// })
// });

async function myFunction() {
    console.log('a');
    const response = await fetch(`/api/game/write`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            datapath: "./frontend/game/html5game/data.hazel"
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

//usage:
