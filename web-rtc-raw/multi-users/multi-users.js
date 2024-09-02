//select elements

const user1VideoElement = document.getElementById("user1VideoElement");
const createOfferButtonElement = document.getElementById("create_offer_btn");
const displayOfferAreaElement = document.getElementById("display_offer_area");
const answerInputAreaElement = document.getElementById("answer_input_area");
const addAnswerButtonElement = document.getElementById("add_answer_button");
const userNameInputElement = document.getElementById("user_name_field");
const offerInputAreaElement = document.getElementById("offer_input_area");
const remoteUserName = document.getElementById("remote_user_name");
const createAnswerButtonElement = document.getElementById(
    "create_answer_button"
);
const answerDisplayAreaElement = document.getElementById("answer_display_area");

//select elements ends

//app states

let peerConnections = {};

let localStream;

let remoteStreams = {};

const init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
    });
    user1VideoElement.srcObject = localStream;

    const savedUserName = sessionStorage.getItem("user_name");
    if (savedUserName) {
        userNameInputElement.value = savedUserName;
    }
};

const renderVideoElement = () => {
    const video_container = document.getElementById("video_container");
    Object.keys(remoteStreams).forEach((userName) => {
        const stream = remoteStreams[userName];
        const videoElement = document.createElement("video");
        videoElement.muted = true;
        videoElement.autoplay = true;
        videoElement.srcObject = stream;
        videoElement.className = "h-full w-full";
        video_container.appendChild(videoElement);
    });
};

const listenTrack = (userName) => {
    const peerConnection = peerConnections[userName];
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        if (!remoteStreams[userName]) {
            remoteStreams[userName] = new MediaStream();
        }
        const remoteStream = remoteStreams[userName];

        event.streams[0].getTracks().forEach((track) => {
            console.log("Received Stream Tracks", track);
            remoteStream.addTrack(track);
        });
        renderVideoElement();
    };
};

const createOffer = async () => {
    const user_name = userNameInputElement.value;
    sessionStorage.setItem("user_name", user_name);

    //create peer connection for the user

    if (!peerConnections[user_name]) {
        peerConnections[user_name] = new RTCPeerConnection();
    }
    listenTrack(user_name);
    const peerConnection = peerConnections[user_name];

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            displayOfferAreaElement.value = JSON.stringify({
                user_name: user_name,
                offer: peerConnection.localDescription,
            });
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
};

const createAnswer = async () => {
    const current_user_name = userNameInputElement.value;
    const { offer, user_name } = JSON.parse(offerInputAreaElement.value);

    if (!peerConnections[user_name]) {
        peerConnections[user_name] = new RTCPeerConnection();
    }
    listenTrack(user_name);
    const peerConnection = peerConnections[user_name];

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            console.log("Creating Answer", event);
            answerDisplayAreaElement.value = JSON.stringify({
                answer: peerConnection.localDescription,
                user_name: user_name,
                remote_user_name: current_user_name,
            });
        }
    };

    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
};

const addAnswer = () => {
    const { answer, user_name, remote_user_name } = JSON.parse(
        answerInputAreaElement.value
    );
    const peerConnection = peerConnections[user_name];
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
    }
    console.log("Answer Added");
};

createOfferButtonElement.addEventListener("click", createOffer);
createAnswerButtonElement.addEventListener("click", createAnswer);
addAnswerButtonElement.addEventListener("click", addAnswer);

document.addEventListener("DOMContentLoaded", () => {
    init();
});
