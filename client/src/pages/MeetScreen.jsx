import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";
const MeetScreen = () => {
    const socket = useSocket();

    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const handleUserJoined = useCallback(({ email, id }) => {
        console.log("email joined the room --> ", email);
        setRemoteSocketId(id);
    }, []);

    const handleIncomingCall = useCallback(
        async ({ from, offer }) => {
            console.log("Incomming call from ", from, offer);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            setMyStream(stream);
            setRemoteSocketId(from);
            const ans = await peer.getAnswer(offer);
            socket.emit("call:accepted", {
                to: from,
                ans,
            });
        },
        [socket]
    );
    const sendStreams = useCallback(() => {
        console.log("Stream Sending", myStream);
        for (const track of myStream?.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream, peer]);
    const handleCallAccepted = useCallback(
        async ({ from, ans }) => {
            await peer.setLocalDescription(ans);
            console.log("Call Accepted");
            sendStreams();
        },
        [sendStreams]
    );

    const handleIncomingNegoNeeded = useCallback(
        async ({ from, offer }) => {
            const ans = await peer.getAnswer(offer);
            socket.emit("peer:nego:done", {
                to: from,
                ans,
            });
        },
        [socket]
    );
    const handleNegoFinal = useCallback(
        async ({ from, ans }) => {
            await peer.setLocalDescription(ans);
        },
        [socket]
    );
    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incomming:call", handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleIncomingNegoNeeded);
        socket.on("peer:nego:final", handleNegoFinal);

        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incomming:call", handleIncomingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleIncomingNegoNeeded);
            socket.off("peer:nego:final", handleNegoFinal);
        };
    }, [
        handleUserJoined,
        handleIncomingCall,
        handleCallAccepted,
        handleIncomingNegoNeeded,
        handleNegoFinal,
    ]);

    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            console.log("GOT DATA", ev);
            const remoteStream = ev.streams;
            console.log("Remote Strema", remoteStream);
            setRemoteStream(remoteStream[0]);
        });
    }, []);

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", {
            offer,
            to: remoteSocketId,
        });
    }, [socket]);
    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener(
                "negotiationneeded",
                handleNegoNeeded
            );
        };
    }, [handleNegoNeeded]);

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        const offer = await peer.getOffer();
        socket.emit("user:call", {
            to: remoteSocketId,
            offer,
        });
        setMyStream(stream);
    }, [remoteSocketId, socket]);

    console.log("My Stream", myStream);

    return (
        <div>
            <h1> Room Page</h1>
            <h4>{remoteSocketId ? "Connected" : "No one in the room"}</h4>
            {remoteSocketId && (
                <button
                    onClick={handleCallUser}
                    className="btn btn-outline btn-info"
                >
                    Call
                </button>
            )}
            {myStream && (
                <button
                    onClick={sendStreams}
                    className="btn btn-outline btn-info"
                >
                    Send Stream
                </button>
            )}
            {myStream && (
                <ReactPlayer
                    muted
                    playing={true}
                    height={"300px"}
                    width={"300px"}
                    url={myStream}
                />
            )}
            {remoteStream && (
                <>
                    Remote Stream
                    <ReactPlayer
                        muted
                        playing={true}
                        height={"300px"}
                        width={"300px"}
                        url={remoteStream}
                    />
                </>
            )}
        </div>
    );
};

export default MeetScreen;
