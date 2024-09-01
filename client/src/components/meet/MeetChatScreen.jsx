const MeetChatScreen = ({ open }) => {
    return (
        <div
            className={`fixed bottom-[110px] top-0 transition-all duration-200 ${
                open ? "-right-[320px]" : "right-0"
            }`}
        >
            <div className="px-3 py-5 rounded-e-md bg-base-300 flex flex-col h-full w-[320px]">
                Chat Screen
            </div>
        </div>
    );
};

export default MeetChatScreen;
