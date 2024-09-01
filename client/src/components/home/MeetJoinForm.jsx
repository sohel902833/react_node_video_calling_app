import { useState } from "react";
import InputError from "../utill/InputError";
import { useSocket } from "../../context/SocketProvider";

const initialData = {
    email: "",
    roomId: "",
};
const MeetJoinForm = () => {
    const [data, setData] = useState(initialData);
    const [errors, setErrors] = useState(initialData);
    const socket = useSocket();
    const handleSubmit = (e) => {
        e.preventDefault();
        const newError = {};

        if (!data.email.trim()) {
            newError.email = "Please enter your email";
        }

        if (!data.roomId.trim()) {
            newError.roomId = "Please enter room id";
        }

        if (Object.keys(newError).length > 0) {
            setErrors(newError);
            return;
        }

        setErrors(initialData);

        socket.emit("room:join", data);
    };
    return (
        <form onSubmit={handleSubmit} className="card-body">
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Email</span>
                </label>
                <input
                    type="email"
                    placeholder="email"
                    className="input input-bordered"
                    value={data.email}
                    onChange={(e) => {
                        setData((prev) => ({ ...prev, email: e.target.value }));
                    }}
                />
                <InputError visible={Boolean(errors.email)}>
                    {errors.email}
                </InputError>
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Room Id</span>
                </label>
                <input
                    type="text"
                    placeholder="Room Id"
                    className="input input-bordered"
                    value={data.roomId}
                    onChange={(e) => {
                        setData((prev) => ({
                            ...prev,
                            roomId: e.target.value,
                        }));
                    }}
                />
                <InputError visible={Boolean(errors.roomId)}>
                    {errors.roomId}
                </InputError>
            </div>
            <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary">
                    Join Now
                </button>
            </div>
        </form>
    );
};

export default MeetJoinForm;
