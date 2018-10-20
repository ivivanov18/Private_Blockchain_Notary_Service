const express = require("express");
const bodyParser = require("body-parser");

// Project imports
const blocks = require("./routes/api/blocks");
const messageSignatures = require("./routes/api/messageSignatures");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("PRIVATE BLOCKCHAIN API");
});

// ROUTES
app.use("/", blocks);
app.use("/message-signature", messageSignatures);

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
