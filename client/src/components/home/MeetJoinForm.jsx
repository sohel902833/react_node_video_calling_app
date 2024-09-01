import { useEffect, useState } from "react";
import InputError from "../utill/InputError";
import { useSocket } from "../../context/SocketProvider";

function generateRandomId() {
    const characters = "abcdefghijklmnopqrstuvwxyz";
    const segments = [3, 4, 3]; // Specifies the length of each segment

    return segments
        .map((segmentLength) => {
            return Array.from({ length: segmentLength }, () => {
                return characters.charAt(
                    Math.floor(Math.random() * characters.length)
                );
            }).join("");
        })
        .join("-");
}
const initialData = {
    name: "",
    roomName: "",
};

const MeetJoinForm = ({ onSuccess }) => {
    const [data, setData] = useState(initialData);
    const [errors, setErrors] = useState(initialData);
    const socket = useSocket();
    const handleSubmit = (e) => {
        e.preventDefault();
        const newError = {};

        if (!data.name.trim()) {
            newError.name = "Please enter your name";
        }

        if (!data.roomName.trim()) {
            newError.roomName = "Please enter room name";
        }

        if (Object.keys(newError).length > 0) {
            setErrors(newError);
            return;
        }

        setErrors(initialData);
        sessionStorage.setItem("username", data.name);
        onSuccess(data);
    };
    useEffect(() => {
        const rand = generateRandomId();
        const name = `${rand}-User`;
        setData({
            name: name,
            roomName: rand,
        });
    }, []);
    return (
        <form onSubmit={handleSubmit} className="card-body">
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Name</span>
                </label>
                <input
                    type="name"
                    placeholder="name"
                    className="input input-bordered"
                    value={data.name}
                    onChange={(e) => {
                        setData((prev) => ({ ...prev, name: e.target.value }));
                    }}
                />
                <InputError visible={Boolean(errors.name)}>
                    {errors.name}
                </InputError>
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Room Name</span>
                </label>
                <input
                    type="text"
                    placeholder="Room Name"
                    className="input input-bordered"
                    value={data.roomName}
                    onChange={(e) => {
                        setData((prev) => ({
                            ...prev,
                            roomName: e.target.value,
                        }));
                    }}
                />
                <InputError visible={Boolean(errors.roomName)}>
                    {errors.roomName}
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
