const { RTCPeerConnection } = require("wrtc");

const uuidv4 = require("uuid");
class WebRTCManager {
    connections = new Map();
    constructor() {}

    createId() {
        return uuidv4();
    }
    createConnection = async (offer, user_name, room_name) => {
        // if (this.peerConnection) {
        //     this.peerConnection = null;
        // }
        try {
            const answer = await new Promise(async (resolve, reject) => {
                let roomConnections = this.connections.get(room_name);
                if (!roomConnections) {
                    roomConnections = new Map();
                    this.connections.set(room_name, roomConnections);
                }

                let peerConnection = roomConnections.get(user_name);

                if (!peerConnection) {
                    peerConnection = new RTCPeerConnection({
                        sdpSemantics: "unified-plan",
                    });
                    roomConnections.set(user_name, peerConnection);
                } else {
                    reject("Connection already exists.");
                    return;
                }
                peerConnection.onicecandidate = async (event) => {
                    if (event.candidate) {
                        const answer = peerConnection.localDescription;
                        resolve(answer);
                    }
                };
                peerConnection.ontrack = (event) => {
                    const senders = peerConnection.getSenders();
                    event.streams[0].getTracks().forEach((track) => {
                        console.log("Track For", user_name);
                        // const senderExists = senders.some(
                        //     (sender) => sender.track === track
                        // );
                        // if (!senderExists) {
                        //     peerConnection.addTrack(track, event.streams[0]);
                        // }
                    });
                };

                await peerConnection.setRemoteDescription(offer);
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
            });
            return answer;
        } catch (err) {
            return false;
        }
    };
}
const instance = new WebRTCManager();

module.exports = instance;
