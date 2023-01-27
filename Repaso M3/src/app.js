const express = require("express");
const morgan = require("morgan");
const postsRouter = require("./routes/postsRouter");
const usersRouter = require("./routes/usersRouter");

const server = express();

server.use(express.json());
server.use(morgan("dev"));

server.get("/", (req, res) => {
  res.send("Welcome to mini API");
});

server.use("/posts", postsRouter);
server.use("/users", usersRouter);

module.exports = server;
