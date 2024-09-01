import Modal from "../utill/Modal";

const RecordingOptionModal = ({ open, setOpen, onAction, onCancel }) => {
    return (
        <Modal open={open} setOpen={setOpen} title={""}>
            <h1 className=" text-xl font-extrabold">Choose Recording Option</h1>
            <br />
            <p className="my-6">Select What You Wan't to Record</p>
            <div className="flex items-center gap-3 justify-between">
                <button className="btn btn-ghost" onClick={onCancel}>
                    Cancel
                </button>

                <button
                    className="btn btn-outline"
                    onClick={() => onAction("video")}
                >
                    Record Video
                </button>
                <button
                    className="btn btn-outline"
                    onClick={() => onAction("screen")}
                >
                    Record Screen
                </button>
            </div>
        </Modal>
    );
};

export default RecordingOptionModal;
