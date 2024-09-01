const Modal = ({ open, setOpen, children, title, onClose }) => {
    const handleClose = () => {
        setOpen(false);
        if (onClose) {
            onClose();
        }
    };
    return (
        <>
            <input
                checked={open}
                type="checkbox"
                id="my-modal-3"
                className="modal-toggle"
            />
            <div className="modal">
                <div className="modal-box relative">
                    <label
                        onClick={handleClose}
                        className="btn btn-sm btn-circle absolute right-2 top-2"
                    >
                        ✕
                    </label>
                    {title && <h3 className="text-lg font-bold">{title}</h3>}

                    {children}
                </div>
            </div>
        </>
    );
};

export default Modal;
