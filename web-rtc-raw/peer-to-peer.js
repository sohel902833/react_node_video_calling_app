//select elements

const user1VideoElement = document.getElementById("user_one_video");
const createOfferButtonElement = document.getElementById("create_offer_btn");
const displayOfferAreaElement = document.getElementById("display_offer_area");
const answerInputAreaElement = document.getElementById("answer_input_area");
const addAnswerButtonElement = document.getElementById("add_answer_button");
const user2VideoElement = document.getElementById("user_two_video");
const offerInputAreaElement = document.getElementById("offer_input_area");
const createAnswerButtonElement = document.getElementById(
    "create_answer_button"
);
const answerDisplayAreaElement = document.getElementById("answer_display_area");

//select elements ends

//app states

let peerConnection = new RTCPeerConnection();

let localStream;

let remoteStream;

const init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
    });
    remoteStream = new MediaStream();
    user1VideoElement.srcObject = localStream;
    user2VideoElement.srcObject = remoteStream;

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    };
};

const createOffer = async () => {
    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            displayOfferAreaElement.value = JSON.stringify(
                peerConnection.localDescription
            );
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
};

const createAnswer = async () => {
    const offer = JSON.parse(offerInputAreaElement.value);

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            console.log("Creating Answer", event);
            answerDisplayAreaElement.value = JSON.stringify(
                peerConnection.localDescription
            );
        }
    };

    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
};

const addAnswer = () => {
    const answer = JSON.parse(answerInputAreaElement.value);
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
