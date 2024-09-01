import {
    BrowserRouter as Router,
    Routes,
    Route,
    BrowserRouter,
} from "react-router-dom";
import HomeScreen from "./pages/HomeScreen";
import { SocketProvider } from "./context/SocketProvider";
import MeetScreen from "./pages/MeetScreen";

const App = () => {
    return (
        <SocketProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/meet/:roomName" element={<MeetScreen />} />
                </Routes>
            </Router>
        </SocketProvider>
    );
};

export default App;
