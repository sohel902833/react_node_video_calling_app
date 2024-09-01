const express = require("express");
const http = require("http");
const app = express();
const VideoStreamListeners = require("./src/VideoStreamListeners");
const server = http.Server(app);
const { Server: SocketServer } = require("socket.io");

const io = new SocketServer(server, {
    cors: true,
});
global.io = io;

//call video stream listeners

const streamListener = new VideoStreamListeners();
streamListener.listen();

server.listen(3001, () => {
    console.log(`Application is running on port ${3001}`);
});
