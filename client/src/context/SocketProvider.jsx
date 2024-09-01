import React, { createContext, useContext, useMemo } from "react";

import { io } from "socket.io-client";
const SOCKET_CONTEXT = createContext(null);

export const useSocket = () => {
    const socket = useContext(SOCKET_CONTEXT);
    return socket;
};

export const SocketProvider = (props) => {
    const socket = useMemo(() => {
        // const url = `http://192.168.0.103/stream`;
        const url = `localhost:3001/stream`;
        return io(url);
    }, []);

    return (
        <SOCKET_CONTEXT.Provider value={socket}>
            {props.children}
        </SOCKET_CONTEXT.Provider>
    );
};
