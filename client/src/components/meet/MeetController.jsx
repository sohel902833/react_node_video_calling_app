import { useState } from "react";
import { IoMdMic, IoMdMicOff } from "react-icons/io";
import { FaVideo, FaVideoSlash } from "react-icons/fa";
import { TbScreenShare, TbScreenShareOff } from "react-icons/tb";
import { FaRocketchat } from "react-icons/fa";
import { BsRecordCircleFill } from "react-icons/bs";
import RecordingOptionModal from "./RecordingOptionModal";

const MeetController = ({
    handleChatToggle,
    roomName,
    screenShareOn,
    handleToggleShareScreen,
    isVideoOpen,
    handleToggleVideo,
    isOnMute,
    handleToggleMic,
    handleToggleRecording,
    isRecording,
}) => {
    const [openRecordingOptionModal, setOpenRecordingOptionModal] =
        useState(false);

    const handleOpenRecordionOptionModal = () => {
        if (!isRecording) {
            setOpenRecordingOptionModal((prev) => !prev);
        } else {
            handleToggleRecording("");
        }
    };

    const handleRecord = (recordType) => {
        setOpenRecordingOptionModal(false);
        handleToggleRecording(recordType);
    };

    return (
        <div className="fixed bottom-4 left-2 right-2">
            <div className="px-3 py-5 rounded-e-md bg-base-300 flex items-center justify-between">
                <div>{roomName} | 5:32AM</div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToggleMic}
                        className="btn btn-circle"
                    >
                        {!isOnMute ? (
                            <IoMdMic size={20} />
                        ) : (
                            <IoMdMicOff size={20} />
                        )}
                    </button>
                    <button
                        onClick={handleToggleVideo}
                        className="btn btn-circle"
                    >
                        {isVideoOpen ? (
                            <FaVideo size={20} />
                        ) : (
                            <FaVideoSlash size={20} />
                        )}
                    </button>
                    <button
                        onClick={handleToggleShareScreen}
                        className="btn btn-circle"
                    >
                        {screenShareOn ? (
                            <TbScreenShare size={20} />
                        ) : (
                            <TbScreenShareOff size={20} />
                        )}
                    </button>
                    <button
                        onClick={handleOpenRecordionOptionModal}
                        className="btn btn-circle"
                    >
                        {isRecording ? (
                            <BsRecordCircleFill size={20} />
                        ) : (
                            <BsRecordCircleFill size={20} />
                        )}
                    </button>
                </div>
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => handleChatToggle()}
                        className="btn btn-circle"
                    >
                        <FaRocketchat size={20} />
                    </button>
                </div>
            </div>
            <RecordingOptionModal
                open={openRecordingOptionModal}
                onCancel={() => setOpenRecordingOptionModal(false)}
                onAction={handleRecord}
                setOpen={setOpenRecordingOptionModal}
            />
        </div>
    );
};

export default MeetController;
