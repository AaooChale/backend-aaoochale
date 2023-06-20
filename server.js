// THIRD PARTY MODULES
const path = require("path");
let http = require("http");
// CORE MODULES
require("dotenv").config({ path: path.join(__dirname, "config.env") });
const express = require("express");
const schedule = require('node-schedule');
const Notification = require("./model/notificationSchema");
const Helper = require('./config/Helper');
// SELF MODULES
const dbConnect = require(path.join(__dirname, "config", "db.js"));
const app = require(path.join(__dirname, "app.js"));
dbConnect();

http = require("http").createServer(app);
const job = schedule.scheduleJob('0 0 0 * * *', async function(){
  var oneWeekAgo = new Date(Date.now());
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  Notification.deleteMany({createdOn:{$lt:oneWeekAgo}});
  Helper.sendRatingNotifictaion();
});

const server = http.listen(process.env.PORT, () => {
  console.log(`Server is running on port number ${process.env.PORT}`);
});

server.setTimeout(29000);
process.on("uncaughtException", (err) => {
  console.log(`Error ${err.message} ${err}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log(`Error ${err.message} ${err}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);
  server.close(() => {
    process.exit(1);
  });
});
const socket = require("socket.io");


const io = require("socket.io")(server, {
  cors: {
    origin: `*`,
    credentials: true,
    methods: ["GET", "POST"],
    transports: ["websocket"],
  },
  allowEIO3: true,
});

global.onlineUsers = [];

const addNewUser = (username, socketId) => {
  !global.onlineUsers.some((user) => user.username === username) && global.onlineUsers.push({ username, socketId });
  console.log("ONLINEUSERS", global.onlineUsers, username, socketId);
};

const removeUser = (socketId) => {
  global.onlineUsers = global.onlineUsers.filter((user) => user.socketId !== socketId);
};
io.on("connection", (socket) => {
  console.log("connection..", socket.id);
  global.chatSocket = socket;
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });

  socket.on("newUser", (UserId) => {
    addNewUser(UserId, socket.id);
    socket.emit("getNotification", "NOTIFICATION");
  });
  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

global.io = io;


