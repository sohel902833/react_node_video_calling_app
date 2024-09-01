const InputError = ({ children, visible = false }) => {
    if (!visible) {
        return null;
    }
    return (
        <p className="text-red-500 font-light text-sm ml-2 mt-2">{children}</p>
    );
};

export default InputError;
