const { EventEmitter } = require("nodemailer/lib/xoauth2");
const { RTCPeerConnection } = require("wrtc");
const uuidv4 = require("uuid");

const TIME_TO_CONNECTED = 10000;
const TIME_TO_HOST_CANDIDATES = 3000; // NOTE(mroberts): Too long.
const TIME_TO_RECONNECTED = 10000;

async function waitUntilIceGatheringStateComplete(peerConnection) {
    if (peerConnection.iceGatheringState === "complete") {
        return;
    }

    const timeToHostCandidates = TIME_TO_HOST_CANDIDATES;

    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });

    const timeout = setTimeout(() => {
        peerConnection.removeEventListener("icecandidate", onIceCandidate);
        deferred.reject(new Error("Timed out waiting for host candidates"));
    }, timeToHostCandidates);

    function onIceCandidate({ candidate }) {
        if (!candidate) {
            clearTimeout(timeout);
            peerConnection.removeEventListener("icecandidate", onIceCandidate);
            deferred.resolve();
        }
    }

    peerConnection.addEventListener("icecandidate", onIceCandidate);

    await deferred.promise;
}
class WebRTC extends EventEmitter {
    connections = new Map();
    closedListeners = new Map();
    constructor(id) {
        super();

        console.log("Created WEB RTC");
    }
    createId() {
        return uuidv4();
    }
    #beforeOffer = () => {
        const audioTransceiver = peerConnection.addTransceiver("audio");
        const videoTransceiver = peerConnection.addTransceiver("video");
        return Promise.all([
            audioTransceiver.sender.replaceTrack(
                audioTransceiver.receiver.track
            ),
            videoTransceiver.sender.replaceTrack(
                videoTransceiver.receiver.track
            ),
        ]);
    };

    #close = () => {
        this.peerConnection.removeEventListener(
            "iceconnectionstatechange",
            this.#onIceConnectionStateChange
        );
        if (this.connectionTimer) {
            clearTimeout(this.connectionTimer);
            this.connectionTimer = null;
        }
        if (this.reconnectionTimer) {
            clearTimeout(this.reconnectionTimer);
            this.reconnectionTimer = null;
        }
        this.peerConnection.close();
        this.state = "closed";
        this.emit("closed");
    };
    #doCreateConnectionSetup = () => {
        this.peerConnection = new RTCPeerConnection({
            sdpSemantics: "unified-plan",
        });
        this.#beforeOffer(peerConnection);
        this.reconnectionTimer = null;
        this.connectionTimer = setTimeout(() => {
            if (
                peerConnection.iceConnectionState !== "connected" &&
                peerConnection.iceConnectionState !== "completed"
            ) {
                this.#close();
            }
        }, TIME_TO_CONNECTED);

        peerConnection.addEventListener("iceconnectionstatechange", () =>
            this.#onIceConnectionStateChange(
                peerConnection,
                connectionTimer,
                this.reconnectionTimer
            )
        );
        return this.peerConnection;
    };
    #onIceConnectionStateChange = () => {
        if (
            this.peerConnection.iceConnectionState === "connected" ||
            this.peerConnection.iceConnectionState === "completed"
        ) {
            if (this.connectionTimer) {
                clearTimeout(connectionTimer);
                this.connectionTimer = null;
            }
        } else if (
            this.peerConnection.iceConnectionState === "disconnected" ||
            this.peerConnection.iceConnectionState === "failed"
        ) {
            if (!this.connectionTimer && !this.reconnectionTimer) {
                const self = this;
                this.reconnectionTimer = setTimeout(() => {
                    self.#close();
                }, TIME_TO_RECONNECTED);
            }
        }
    };
    #deleteConnection(connection) {
        const closedListener = this.closedListeners.get(connection);
        closedListener.delete();
        connection.removeEventListener("closed", closedListener);
        this.connections.delete(connection.id);
    }
    createConnection = async () => {
        const id = this.createId();
        const connection = this.#doCreateConnectionSetup();

        const closedListner = () => {
            this.#deleteConnection(connection);
        };

        this.closedListeners.set(connection.id, connection);
        connection.once("closed", closedListner);

        connection.set(connection.id, connection);
        await this.#doOffer();
        return connection;
    };

    #doOffer = async () => {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        try {
            await waitUntilIceGatheringStateComplete(this.peerConnection);
        } catch (err) {
            this.#close();
        }
    };
}

const instance = new WebRTC();
Object.freeze(instance);

module.exports = instance;
