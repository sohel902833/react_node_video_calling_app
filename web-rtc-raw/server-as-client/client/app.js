//select elements
const BASE_URL = "http://localhost:5001";
const user1VideoElement = document.getElementById("user_one_video");
const createOfferButtonElement = document.getElementById("create_offer_btn");
const user2VideoElement = document.getElementById("user_two_video");
const userNameElement = document.getElementById("user_name");
const roomNameElement = document.getElementById("room_name");

//select elements ends

//app states

let peerConnection = new RTCPeerConnection();

let localStream;

let remoteStream;

const init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
    remoteStream = new MediaStream();
    user1VideoElement.srcObject = localStream;
    user2VideoElement.srcObject = remoteStream;

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
        console.log("Track", track);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            console.log("Track", track);
            remoteStream.addTrack(track);
        });
    };
};

const postOffer = async (offer, user_name, room_name) => {
    const stringifiedOffer = JSON.stringify(offer);
    try {
        const res = await fetch(`${BASE_URL}/connect`, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                offer: stringifiedOffer,
                user_name,
                room_name,
            }),
        });
        const data = await res.json();
        if (data.answer) {
            if (!peerConnection.currentRemoteDescription) {
                peerConnection.setRemoteDescription(data.answer);
            }
        }
    } catch (err) {
        console.log("ER", err);
    }
};

const createOffer = async () => {
    const user_name = userNameElement.value;
    const room_name = roomNameElement.value;
    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            postOffer(peerConnection.localDescription, user_name, room_name);
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
};
createOfferButtonElement.addEventListener("click", createOffer);
document.addEventListener("DOMContentLoaded", () => {
    init();
});
