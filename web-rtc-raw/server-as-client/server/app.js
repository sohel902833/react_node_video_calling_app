const express = require("express");
const cors = require("cors");
const app = express();
const webRTCManager = require("./src/WebRTCManager");
const PORT = process.env.PORT || 5001;

app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(express.json());
app.use(cors());

app.post("/connect", async (req, res) => {
    const { offer, user_name, room_name } = req.body;
    const parsedOffer = JSON.parse(offer);
    const answer = await webRTCManager.createConnection(
        parsedOffer,
        user_name,
        room_name
    );
    let response = {};
    if (answer) {
        response.success = true;
        response.answer = answer;
    } else {
        response.success = false;
    }
    return res.json(response);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
