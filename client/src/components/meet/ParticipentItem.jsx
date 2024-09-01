import { useEffect, useRef, useState } from "react";
import { IoMdMic, IoMdMicOff } from "react-icons/io";
import { FaVideo, FaVideoSlash } from "react-icons/fa";
import { TbScreenShare, TbScreenShareOff } from "react-icons/tb";
import { FaRocketchat } from "react-icons/fa";

const ParticipentItem = ({
    isGreaterThenTwo = false,
    stream,
    id,
    participentLength,
}) => {
    const [isMicOn, setIsMicOn] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [screenShareOn, setScreenShareOn] = useState(false);

    const videoRef = useRef();

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;

            const videoTrack = stream?.getVideoTracks()[0];
            const audioTrack = stream?.getAudioTracks()[0];

            const isVideoEnabled = videoTrack ? videoTrack.enabled : false;
            const isAudioEnabled = audioTrack ? audioTrack.enabled : false;
            // console.log({
            //     isVideoEnabled,
            //     isAudioEnabled,
            //     videoTrack,
            //     audioTrack,
            // });
            setIsVideoOn(isVideoEnabled);
            setIsMicOn(isAudioEnabled);
        }
    }, [stream]);

    const handleMicToggle = () => {
        setIsMicOn((prev) => !prev);
    };

    const handleVideoToggle = () => {
        setIsVideoOn((prev) => !prev);
    };
    const handleScreenShareToggle = () => {
        setScreenShareOn((prev) => !prev);
    };
    // console.log("Stream", stream);
    return (
        <div
            className={`grow basis-[450px] max-w-[500px] bg-base-300 rounded-md p-4 relative
                            ${!isGreaterThenTwo ? " h-full" : " h-[40vh]"}
                            ${participentLength === 1 ? " !w-full" : ""}
                        `}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full"
                id={id}
            ></video>
            <div className="absolute bottom-4 left-4 right-4 ">
                <div className="bg-base-100 rounded-md p-2 flex items-center justify-center gap-4">
                    <button
                        onClick={handleMicToggle}
                        className="btn btn-circle btn-sm"
                    >
                        {isMicOn ? (
                            <IoMdMic size={15} />
                        ) : (
                            <IoMdMicOff size={15} />
                        )}
                    </button>
                    <button
                        onClick={handleVideoToggle}
                        className="btn btn-circle btn-sm"
                    >
                        {isVideoOn ? (
                            <FaVideo size={15} />
                        ) : (
                            <FaVideoSlash size={15} />
                        )}
                    </button>
                    <button
                        onClick={handleScreenShareToggle}
                        className="btn btn-circle btn-sm"
                    >
                        {screenShareOn ? (
                            <TbScreenShare size={15} />
                        ) : (
                            <TbScreenShareOff size={15} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParticipentItem;
