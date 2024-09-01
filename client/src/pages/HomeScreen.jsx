import { useCallback, useEffect } from "react";
import MeetJoinForm from "../components/home/MeetJoinForm";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const HomeScreen = () => {
    const socket = useSocket();
    const navigate = useNavigate();

    const handleJoinRoom = useCallback((data) => {
        const { email, roomId } = data;
        navigate(`/meet/${roomId}`);
    }, []);

    useEffect(() => {
        socket.on("room:join", handleJoinRoom);
        return () => {
            socket.off("room:join", handleJoinRoom);
        };
    }, [socket]);

    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold">Login now!</h1>
                    <p className="py-6">
                        Provident cupiditate voluptatem et in. Quaerat fugiat ut
                        assumenda excepturi exercitationem quasi. In deleniti
                        eaque aut repudiandae et a id nisi.
                    </p>
                </div>
                <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                    <MeetJoinForm />
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
