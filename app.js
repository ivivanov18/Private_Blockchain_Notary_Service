const express = require("express");
const bodyParser = require("body-parser");

// Project imports
const blocks = require("./routes/api/blocks");
const stars = require("./routes/api/stars");
const messageSignatures = require("./routes/api/messageSignatures");
const Blockchain = require("./simpleChain").BlockChain;
const app = express();
const notaryBlockChain = new Blockchain();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("blockchain", notaryBlockChain);
app.get("/", (req, res) => {
  res.send("PRIVATE BLOCKCHAIN API");
});

// ROUTES
app.use("/", blocks);
app.use("/message-signature", messageSignatures);
app.use("/stars", stars);

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//TODO: fix error when signature has been validated and user make request for address with validated signature --> delete valid request in DB after block created
//TODO: Some error that with validationwindow closed
