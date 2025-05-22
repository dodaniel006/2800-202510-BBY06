// import dgram from "dgram";
// const server = dgram.createSocket('udp4');
import { WebSocketServer } from "ws";
const socket = new WebSocketServer({ port: 8080 });

import User from "../config/db_schemas/User.js";

var userList = [];
var wsList = [];
var allWS = [];
var currentIndex = 0;

socket.on('error', (err) => {
  console.error(`Server error:\n${err.stack}`);
  socket.close();
});

socket.on('connection', async (ws) => {
  ws.on('message', async (data) => {
    // console.log('received: %s', data);
    if (JSON.parse(data).hasOwnProperty("Score")) { // Score updating
      // console.log('updating roadScore')
      let wsIndex = 0;
      for (let i = 0; i < allWS.length; i++) {
        if (allWS[i] == ws) {
          wsIndex = i;
        }
      }

      const array = await User.find({
        ws: wsIndex
      })    
      // console.log("ws user", array)

      await User.updateOne(
          { ws: wsIndex },
          { $set: { roadScore: JSON.parse(data).Score } }
      );

      // console.log("updated roadScore in db to", JSON.parse(data).Score);
    }
  });

  wsList.push(ws);
  var wsIndex = currentIndex;
  currentIndex++;

  allWS.push(wsList[0]);
  send_data({ Connect: "Hello" }, userList[0]);
  // console.log("connected websocket", wsIndex);

  await User.updateOne(
      { email: userList[0] },
      { $set: { ws: wsIndex } }
  );

  const array = await User.find({
    email: userList[0]
  })
  send_data({"roadScore": array[0].roadScore}, userList[0]);
  wsList.pop();
  userList.pop();
  // console.log("added ws to user db", wsIndex);
  
});

socket.on('listening', () => {
  console.log('WebSocket server is running...', socket.address());
});

async function send_data(data, user) {
  // console.log('Server Send Data');
  const array = await User.find({
    email: user
  })
  try {
    var ws = allWS[array[0].ws];

    // Respond to the client
    ws.send(JSON.stringify(data));
  } catch (err) {
    console.log('something fucked up', err, ws, allWS, array);
    allWS = [];
    currentIndex = 0;
  }

}

function add_user(user) {
  userList.push(user);
  // console.log("added user", wsList, userList);
}

// Unused
function get_ws() {
    return socket.address();
}

export { get_ws, add_user, send_data };