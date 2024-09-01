import { useEffect, useRef, useState } from "react";
import { FaRegWindowMinimize } from "react-icons/fa";
const MineVideoStream = ({ isParticipentsExists, videoStream }) => {
    const videoRef = useRef();
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = videoStream;
        }
    }, [videoStream, isHidden]);
    return (
        <div
            className={` 
                max-h-screen 
            ${isParticipentsExists ? " fixed left-2 bottom-[100px] z-30" : ""}

            ${isHidden ? " !bottom-[0px]" : ""}
            
            `}
        >
            <div
                className={` relative p-2 transition-all duration-300 ${
                    isParticipentsExists
                        ? "  h-[350px] w-[350px] rounded-md bg-base-300"
                        : " h-[calc(100vh-120px)] rounded-md m-3 bg-base-200"
                }
                 ${isHidden ? " !h-[50px]" : ""}
                
                `}
            >
                {isParticipentsExists && (
                    <button
                        onClick={() => setIsHidden((prev) => !prev)}
                        className="z-40 btn btn-circle absolute top-1 right-1 flex items-center justify-center"
                    >
                        <FaRegWindowMinimize size={20} />
                    </button>
                )}
                {!isHidden && (
                    <video
                        ref={videoRef}
                        // id={id}
                        autoPlay
                        playsInline
                        className="h-full w-full z-[31]"
                    ></video>
                )}
            </div>
        </div>
    );
};

export default MineVideoStream;
