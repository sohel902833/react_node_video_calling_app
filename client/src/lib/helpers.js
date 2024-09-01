export default {
    generateRandomString() {
        const crypto = window.crypto || window.msCrypto;
        let array = new Uint32Array(1);

        return crypto.getRandomValues(array);
    },

    userMediaAvailable() {
        return !!(
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia
        );
    },
    getUserFullMedia() {
        if (this.userMediaAvailable()) {
            return navigator.mediaDevices.getUserMedia({
                video: true,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });
        } else {
            throw new Error("User media not available");
        }
    },
    getIceServer() {
        return {
            iceServers: [
                {
                    urls: ["stun:eu-turn4.xirsys.com"],
                },
                {
                    username:
                        "ml0jh0qMKZKd9P_9C0UIBY2G0nSQMCFBUXGlk6IXDJf8G2uiCymg9WwbEJTMwVeiAAAAAF2__hNSaW5vbGVl",
                    credential: "4dd454a6-feee-11e9-b185-6adcafebbb45",
                    urls: [
                        "turn:eu-turn4.xirsys.com:80?transport=udp",
                        "turn:eu-turn4.xirsys.com:3478?transport=tcp",
                    ],
                },
            ],
        };
    },
    adjustVideoElemSize() {
        let elem = document.getElementsByClassName("card");
        let totalRemoteVideosDesktop = elem.length;
        let newWidth =
            totalRemoteVideosDesktop <= 2
                ? "50%"
                : totalRemoteVideosDesktop == 3
                ? "33.33%"
                : totalRemoteVideosDesktop <= 8
                ? "25%"
                : totalRemoteVideosDesktop <= 15
                ? "20%"
                : totalRemoteVideosDesktop <= 18
                ? "16%"
                : totalRemoteVideosDesktop <= 23
                ? "15%"
                : totalRemoteVideosDesktop <= 32
                ? "12%"
                : "10%";

        for (let i = 0; i < totalRemoteVideosDesktop; i++) {
            elem[i].style.width = newWidth;
        }
    },
    closeVideo(elemId) {
        if (document.getElementById(elemId)) {
            document.getElementById(elemId).remove();
            this.adjustVideoElemSize();
        }
    },
    shareScreen() {
        if (this.userMediaAvailable()) {
            return navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always",
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            });
        } else {
            throw new Error("User media not available");
        }
    },
    replaceTrack(stream, recipientPeer) {
        let sender = recipientPeer.getSenders
            ? recipientPeer
                  .getSenders()
                  .find((s) => s.track && s.track.kind === stream.kind)
            : false;

        sender ? sender.replaceTrack(stream) : "";
    },
    saveAs(file) {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    saveRecordedStream(stream, user) {
        const timeStamp = new Date().getTime().toString();
        let blob = new Blob(stream, { type: "video/webm" });

        let file = new File([blob], `${user}-${timeStamp}-record.webm`);
        this.saveAs(file);
    },
};
