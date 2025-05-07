import { fs } from 'fs';

const DATAPATH = "/game/html5game/data.hazel";

document.getElementById("complete").addEventListener("click", myFunction);

function myFunction() {
    fs.writeFileSync(DATAPATH, JSON.stringify([{"roadAdd":50.0, "roadScore":0}]));
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
readTextFile(DATAPATH, function(text){
    var data = JSON.parse(text);
    console.log(data);
});