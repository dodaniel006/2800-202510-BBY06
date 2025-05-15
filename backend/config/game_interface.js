// import dgram from "dgram";
// const server = dgram.createSocket('udp4');
import { WebSocketServer } from "ws";
const socket = new WebSocketServer({ port: 8080 });

import User from "../config/db_schemas/User.js";

const channels = {};

var userList = [];
var portList = [];

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

  //   await User.updateOne(
  //       { email: userList[0] },
  //       { $set: { port: portList[0].toString() } }
  //   );

  //   const array = await User.find({
  //     email: userList[0]
  //   })  
  //   send_data({"roadScore": array[0].roadScore}, userList[0]);

  //   portList.pop();
  //   userList.pop();
  //   console.log("added port to user db", portList, userList);

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

socket.on('connection', (ws) => {
  ws.on('message', (data) => {
    console.log('received: %s', data);
  });

  ws.send('something');
  

});

socket.on('listening', () => {
  console.log('WebSocket server is running...');
});

// async function send_data(data, user) {
//   // console.log('Server Send Data');

//   // const userArray = await User.find({
//   //     email: user
//   // })    

//   // const destPort = userArray[0].port;

//   // console.log(Number(destPort), data)

//   // // Respond to the client
//   // server.send(JSON.stringify(data), Number(destPort), address, (err) => {
//   //   if (err) {
//   //     console.error('Error sending response:', err);
//   //   }
//   // });

// }

// function get_ports() {
//     return portList;
// }

// function add_user(user) {
//   userList.push(user);
//   console.log("added user", portList, userList);
// }

// // server.bind(8080)

// export { send_data, get_ports, add_user };