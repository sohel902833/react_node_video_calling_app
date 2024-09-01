const SOCKET_EVENTS = require("./socket-events");

class VideoStreamListeners {
    constructor() {}

    listen() {
        global.io.of("/stream").on("connection", this.onUserConnected);
    }

    onNewUserSubscribed(data, socket) {
        //this event will be fired once user will jump into the meet page first time
        //data will be {room}-> roomName and {socketId}--->user socket id

        const { room, socketId } = data;
        socket.join(room);
        socket.join(data.socketId);

        //Inform other members in the room that a brand new users joined into the room
        console.log("NEW_USER_SUBSCRIBED", socket.adapter.rooms);
        if (socket.adapter.rooms.has(room) === true) {
            console.log("NEW_USER_JOINED", room);
            socket.to(room).emit(SOCKET_EVENTS.NEW_USER_JOINED, {
                socketId: socketId,
            });
        }
    }
    onUserConnected = (socket) => {
        //particular user socket
        console.log("New User Connected Into Stream Socket");

        socket.on(SOCKET_EVENTS.SUBSCRIBE_EVENT, (data) => {
            this.onNewUserSubscribed(data, socket);
        });

        socket.on(SOCKET_EVENTS.NEW_USER_START, (data) => {
            socket.to(data.to).emit(SOCKET_EVENTS.NEW_USER_START, {
                sender: data.sender,
            });
        });

        socket.on(SOCKET_EVENTS.SDP, (data) => {
            socket.to(data.to).emit(SOCKET_EVENTS.SDP, {
                description: data.description,
                sender: data.sender,
            });
        });

        socket.on(SOCKET_EVENTS.ICE_CANDIDATES, (data) => {
            socket.to(data.to).emit(SOCKET_EVENTS.ICE_CANDIDATES, {
                candidate: data.candidate,
                sender: data.sender,
            });
        });
    };
}

module.exports = VideoStreamListeners;
