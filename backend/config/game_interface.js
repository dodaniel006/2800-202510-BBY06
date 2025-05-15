// import dgram from "dgram";
// const server = dgram.createSocket('udp4');
import { WebSocketServer } from "ws";
const socket = new WebSocketServer({ port: 8080 });

import User from "../config/db_schemas/User.js";

const channels = {};

var userList = [];
var wsList = [];
var allWS = [];

var data;

socket.on('error', (err) => {
  console.error(`Server error:\n${err.stack}`);
  socket.close();
});

// socket.on("message", async (msg) => { 
  //data = JSON.parse(msg)
  // onsole.log('Server Get Data', msg);

  // // Connection
  // if (data.hasOwnProperty("Connect")) {
  //   portList.push(rinfo.port);
  //   console.log("added port", portList, userList);



  // } else if (data.hasOwnProperty("Score")) { // Score updating

  //   const array = await User.find({
  //     port: rinfo.port
  //   })    

  //   await User.updateOne(
  //       { port: rinfo.port },
  //       { $set: { roadScore: data.Score } }
  //   );
  
  //   console.log("updated roadScore in db to", data.Score);
  // }
// })

socket.on('connection', async (ws) => {
  ws.on('message', (data) => {
    console.log('received: %s', data);
  });

  wsList.push(ws);
  var wsIndex = wsList.length - 1;

  allWS.push(wsList[0]);
  send_data({ Connect: "Hello" }, userList[0]);
  console.log("connected websocket", wsIndex);

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
  console.log("added ws to user db", wsIndex);
  
});

socket.on('listening', () => {
  console.log('WebSocket server is running...', socket.address());
});

async function send_data(data, user) {
  console.log('Server Send Data');
  const array = await User.find({
    email: user
  })
  var ws = allWS[array[0].ws];

  // Respond to the client
  ws.send(JSON.stringify(data));

}

function add_user(user) {
  userList.push(user);
  console.log("added user", wsList, userList);
}

// Unused
function get_ws() {
    return allWS;
}

export { get_ws, add_user, send_data };