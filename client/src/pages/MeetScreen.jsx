import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import h from "../lib/helpers";
import ReactPlayer from "react-player";
import { useSocket } from "../context/SocketProvider";
import SOCKET_EVENTS from "../lib/socket-events";
import MeetController from "../components/meet/MeetController";
import MeetChatScreen from "../components/meet/MeetChatScreen";
import MineVideoStream from "../components/meet/MineVideoStream";
import ParticipentItem from "../components/meet/ParticipentItem";
const MeetScreen = () => {
    const { roomName } = useParams();
    const socket = useSocket();
    return (
        <>
            <MeetPage roomName={roomName} socket={socket} />
        </>
    );
};

export default MeetScreen;

class MeetPage extends React.Component {
    pc = [];
    mediaRecorder = null;
    recordedStream = [];
    constructor() {
        super();
        this.state = {
            socketId: "",
            randomNumber: `__${h.generateRandomString()}__${h.generateRandomString()}__`,
            myStream: null,
            screen: null,
            videoStreams: {},
            isChatOpen: false,
            isSharingScreen: false,
            isVideoOpen: true,
            isOnMute: false,
            isRecording: false,
        };
    }

    async componentDidMount() {
        this.getAndSetUserStream();
        const { socket } = this.props;
        if (socket.connected) {
            this.setupSocketEvent();
        } else {
            socket.on("connect", () => {
                this.setupSocketEvent();
            });
        }
    }

    getAndSetUserStream() {
        return new Promise((resolve) => {
            h.getUserFullMedia()
                .then((stream) => {
                    this.setState({
                        myStream: stream,
                    });
                    resolve(stream);
                })
                .catch((e) => {
                    console.log("Stream error", e);
                });
        });
    }

    displayLocalStreamVideo(stream, mirrorMode = true) {
        // const { myStream } = this.state;
        // if (this.localVideoElementRef.current && myStream) {
        //     this.localVideoElementRef.current.srcObject = myStream;
        //     if (mirrorMode) {
        //         this.localVideoElementRef.current.classList.add("mirror-mode");
        //     } else {
        //         this.localVideoElementRef.current.classList.remove(
        //             "mirror-mode"
        //         );
        //     }
        //     // this.createVideoElement(myStream);
        // }
    }

    createVideoElement = (str, id = "234", cardId = "asdf") => {
        const newVideoElement = document.createElement("video");
        newVideoElement.id = id;
        newVideoElement.srcObject = str;
        newVideoElement.autoplay = true;
        newVideoElement.className = "remote-video";

        const controlDiv = document.createElement("div");

        controlDiv.className = "remote-video-controls";
        controlDiv.innerHTML = `<i class="fa fa-microphone text-white pr-3 mute-remote-mic" title="Mute"></i>
                        <i class="fa fa-expand text-white expand-remote-video" title="Expand"></i>`;

        const cardDiv = document.createElement("div");

        cardDiv.className = "card card-sm";
        cardDiv.id = cardId;
        cardDiv.appendChild(newVideoElement);
        cardDiv.appendChild(controlDiv);

        document.getElementById("videos").appendChild(cardDiv);

        h.adjustVideoElemSize();
    };
    init = (createOffer, partnerName) => {
        const { socket } = this.props;
        const { screen, myStream, socketId } = this.state;
        const pc = this.pc;

        pc[partnerName] = new RTCPeerConnection(h.getIceServer());

        if (screen && screen.getTracks().length) {
            screen.getTracks().forEach((track) => {
                pc[partnerName].addTrack(track, screen);
            });
        } else if (myStream) {
            myStream.getTracks().forEach((track) => {
                pc[partnerName].addTrack(track, myStream);
            });
        } else {
            h.getUserFullMedia()
                .then((stream) => {
                    stream.getTracks().forEach((track) => {
                        pc[partnerName].addTrack(track, stream);
                    });
                    this.setState(
                        {
                            myStream: stream,
                        },
                        () => {
                            // stream.getTracks().forEach((track) => {
                            //     pc[partnerName].addTrack(track, stream);
                            // });
                            this.displayLocalStreamVideo(stream);
                        }
                    );
                })
                .catch((err) => {
                    console.log("stream error", err);
                });
        }

        //create offer

        if (createOffer) {
            pc[partnerName].onnegotiationneeded = async () => {
                const offer = await pc[partnerName].createOffer();
                await pc[partnerName].setLocalDescription(offer);
                socket.emit(SOCKET_EVENTS.SDP, {
                    description: pc[partnerName].localDescription,
                    to: partnerName,
                    sender: socketId,
                });
            };
        }

        //send ice candidate to partner Names

        pc[partnerName].onicecandidate = ({ candidate }) => {
            socket.emit(SOCKET_EVENTS.ICE_CANDIDATES, {
                candidate: candidate,
                to: partnerName,
                sender: socketId,
            });
        };

        //add video into grid
        pc[partnerName].ontrack = (e) => {
            let stream = e.streams[0];
            const video_element_id = `${partnerName}-video`;
            this.setState((prev) => {
                const updatedStreams = { ...prev.videoStreams };
                updatedStreams[partnerName] = stream;
                return {
                    videoStreams: updatedStreams,
                };
            });
        };

        pc[partnerName].onconnectionstatechange = (d) => {
            switch (pc[partnerName].iceConnectionState) {
                case "disconnected":
                case "failed":
                    this.setState((prev) => {
                        const updatedStreams = { ...prev.videoStreams };
                        delete updatedStreams[partnerName];
                        return {
                            videoStreams: updatedStreams,
                        };
                    });
                    // h.closeVideo(partnerName);
                    break;

                case "closed":
                    // h.closeVideo(partnerName);
                    this.setState((prev) => {
                        const updatedStreams = { ...prev.videoStreams };
                        delete updatedStreams[partnerName];
                        return {
                            videoStreams: updatedStreams,
                        };
                    });
                    break;
            }
        };

        pc[partnerName].onsignalingstatechange = (d) => {
            switch (pc[partnerName].signalingState) {
                case "closed":
                    console.log("Signalling state is 'closed'");
                    h.closeVideo(partnerName);
                    break;
            }
        };
    };

    onNewUserJoined = (data, socket) => {
        const { socketId } = data;
        const { socketId: senderSocketId } = this.state;
        socket.emit(SOCKET_EVENTS.NEW_USER_START, {
            to: socketId,
            sender: senderSocketId,
        });

        if (!this.pc.includes(socketId)) {
            this.pc.push(socketId);
        }
        this.init(true, socketId);
    };
    onSDPReceived = async (data) => {
        const { socketId } = this.state;
        const pc = this.pc;
        const { socket } = this.props;
        if (data.description.type === "offer") {
            if (data.description) {
                await pc[data.sender].setRemoteDescription(
                    new RTCSessionDescription(data.description)
                );
            }

            h.getUserFullMedia()
                .then(async (stream) => {
                    console.log("OFFER SDP", stream);
                    this.setState({
                        myStream: stream,
                    });
                    stream.getTracks().forEach((track) => {
                        pc[data.sender].addTrack(track, stream);
                    });

                    const answer = await pc[data.sender].createAnswer();
                    await pc[data.sender].setLocalDescription(answer);
                    console.log("Answer Created And Seted", answer);
                    socket.emit(SOCKET_EVENTS.SDP, {
                        description: pc[data.sender].localDescription,
                        to: data.sender,
                        sender: socketId,
                    });
                })
                .catch((err) => {
                    console.log("Stream error", err);
                });
        } else if (data.description.type === "answer") {
            await pc[data.sender].setRemoteDescription(
                new RTCSessionDescription(data.description)
            );
        }
    };
    onIceCandidateReceived = async (data) => {
        const pc = this.pc;
        if (data.candidate) {
            await pc[data.sender].addIceCandidate(
                new RTCIceCandidate(data.candidate)
            );
        }
    };
    setupSocketEvent = () => {
        const { socket } = this.props;
        const { roomName } = this.props;
        if (socket) {
            // socket.on("connect", () => {
            const socketId = socket.io.engine.id;
            this.setState({ socketId: socketId });

            console.log("Connected On Room", roomName);
            //emit subscribe event

            socket.emit(SOCKET_EVENTS.SUBSCRIBE_EVENT, {
                room: roomName,
                socketId: socketId,
            });

            socket.on(SOCKET_EVENTS.NEW_USER_JOINED, (data) => {
                this.onNewUserJoined(data, socket);
            });

            socket.on(SOCKET_EVENTS.NEW_USER_START, (data) => {
                if (!this.pc.includes(data.sender)) {
                    this.pc.push(data.sender);
                }
                this.init(false, data.sender);
            });

            socket.on(SOCKET_EVENTS.SDP, this.onSDPReceived);
            socket.on(
                SOCKET_EVENTS.ICE_CANDIDATES,
                this.onIceCandidateReceived
            );
            // });
        }
    };

    handleChatToggle = (open) => {
        this.setState((prev) => {
            let updatedChatState = !prev.isChatOpen;
            if (open) {
                updatedChatState = open;
            }
            return {
                isChatOpen: updatedChatState,
            };
        });
    };

    handleToggleShareScreen = () => {
        const { screen, isSharingScreen } = this.state;
        if (
            isSharingScreen &&
            screen &&
            screen.getVideoTracks().length &&
            screen.getVideoTracks()[0].readyState != "ended"
        ) {
            this.stopSharingScreen();
        } else {
            this.startShareScreen();
        }
    };

    stopSharingScreen = async () => {
        const { screen } = this.state;
        return new Promise((res, rej) => {
            if (screen.getTracks().length) {
                screen.getTracks().forEach((track) => track.stop());
            }
            res();
        })
            .then(() => {
                this.setState({
                    isSharingScreen: false,
                    screen: null,
                });

                this.getAndSetUserStream().then((stream) => {
                    this.broadcastNewTracks(stream, "video");
                });
            })
            .catch((err) => {
                console.log("Stop sharing failed", err);
            });
    };
    startShareScreen = () => {
        h.shareScreen()
            .then((stream) => {
                this.setState(
                    {
                        isSharingScreen: true,
                        screen: stream,
                        myStream: stream,
                    },
                    () => {
                        this.broadcastNewTracks(stream, "video", false);
                        //When the stop sharing button shown by the browser is clicked
                        stream
                            .getVideoTracks()[0]
                            .addEventListener("ended", () => {
                                this.stopSharingScreen();
                            });
                    }
                );
            })
            .catch((err) => {
                console.log("Error Getting Screen Sharing.");
            });
    };

    broadcastNewTracks = (stream, type, mirrorMode = true) => {
        let track =
            type == "audio"
                ? stream.getAudioTracks()[0]
                : stream.getVideoTracks()[0];
        for (let p in this.pc) {
            let pName = this.pc[p];

            if (typeof this.pc[pName] == "object") {
                h.replaceTrack(track, this.pc[pName]);
            }
        }
    };
    handleToggleVideo = () => {
        const { myStream } = this.state;
        if (myStream.getVideoTracks()[0].enabled) {
            myStream.getVideoTracks()[0].enabled = false;
            this.setState({
                isVideoOpen: false,
            });
        } else {
            myStream.getVideoTracks()[0].enabled = true;
            this.setState({
                isVideoOpen: true,
            });
        }
        this.broadcastNewTracks(myStream, "video");
    };

    handleToggleMic = () => {
        const { myStream } = this.state;
        if (myStream.getAudioTracks()[0].enabled) {
            myStream.getAudioTracks()[0].enabled = false;
            this.setState({
                isOnMute: true,
            });
        } else {
            myStream.getAudioTracks()[0].enabled = true;
            this.setState({
                isOnMute: false,
            });
        }
        this.broadcastNewTracks(myStream, "audio");
    };

    handleToggleRecording = (recordType) => {
        const { screen } = this.state;
        if (!this.mediaRecorder || this.mediaRecorder.state == "inactive") {
            if (recordType === "screen") {
                if (screen && screen.getVideoTracks().length) {
                    this.startRecording(screen);
                } else {
                    h.shareScreen()
                        .then((screenStream) => {
                            this.startRecording(screenStream);
                        })
                        .catch((er) => {
                            console.log("Error recording screen");
                        });
                }
            } else if (recordType === "video") {
                const { myStream } = this.state;
                if (myStream && myStream.getTracks().length) {
                    this.startRecording(myStream);
                } else {
                    h.getUserFullMedia()
                        .then((videoStream) => {
                            this.startRecording(videoStream);
                        })
                        .catch((err) => {
                            console.log("Error Recording Video");
                        });
                }
            }
        } else if (this.mediaRecorder.state == "paused") {
            this.mediaRecorder.resume();
        } else if (this.mediaRecorder.state == "recording") {
            this.mediaRecorder.stop();
        }
    };

    startRecording = (stream) => {
        const { roomName } = this.props;
        this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm;codecs=vp9",
        });

        this.mediaRecorder.start(1000);
        this.setState({ isRecording: true });

        this.mediaRecorder.ondataavailable = (e) => {
            this.recordedStream.push(e.data);
        };

        this.mediaRecorder.onstop = () => {
            this.setState({ isRecording: false });
            h.saveRecordedStream(this.recordedStream, roomName);

            setTimeout(() => {
                this.recordedStream = [];
            }, 3000);
        };
        this.mediaRecorder.onerror = function (e) {
            console.error(e);
        };
    };

    render() {
        const { roomName } = this.props;
        const {
            myStream,
            isChatOpen,
            videoStreams,
            isSharingScreen,
            isVideoOpen,
            isOnMute,
            isRecording,
        } = this.state;
        const streamKeys = Object.keys(videoStreams);
        const isParticipentGreaterThenTwo = streamKeys.length > 2;
        return (
            <>
                <MineVideoStream
                    isParticipentsExists={streamKeys.length > 0}
                    // isParticipentsExists={true}
                    videoStream={myStream}
                />
                <div
                    className={`flex flex-wrap gap-4 h-[calc(100vh-120px)] m-4 overflow-y-auto ${
                        isChatOpen ? " w-[calc(100vw-500px)]" : " "
                    }`}
                >
                    {streamKeys.map((key) => {
                        const stream = videoStreams[key];
                        return (
                            <ParticipentItem
                                key={key}
                                id={key}
                                isGreaterThenTwo={isParticipentGreaterThenTwo}
                                stream={stream}
                                participentLength={streamKeys.length}
                            />
                        );
                    })}
                </div>
                <MeetController
                    handleChatToggle={this.handleChatToggle}
                    roomName={roomName}
                    screenShareOn={isSharingScreen}
                    handleToggleShareScreen={this.handleToggleShareScreen}
                    isVideoOpen={isVideoOpen}
                    handleToggleVideo={this.handleToggleVideo}
                    isOnMute={isOnMute}
                    handleToggleMic={this.handleToggleMic}
                    isRecording={isRecording}
                    handleToggleRecording={this.handleToggleRecording}
                />
                {/* <MeetChatScreen open={isChatOpen} /> */}
            </>
        );
    }
}
