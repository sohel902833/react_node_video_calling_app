import React, { createContext, useContext, useMemo } from "react";

import { io } from "socket.io-client";
const SOCKET_CONTEXT = createContext(null);

export const useSocket = () => {
    const socket = useContext(SOCKET_CONTEXT);
    return socket;
};

export const SocketProvider = (props) => {
    const socket = useMemo(() => {
        return io("localhost:8000");
    }, []);

    return (
        <SOCKET_CONTEXT.Provider value={socket}>
            {props.children}
        </SOCKET_CONTEXT.Provider>
    );
};
