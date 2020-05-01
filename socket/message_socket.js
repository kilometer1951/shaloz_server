// const mongoose = require("mongoose");

// const Message = mongoose.model("messages");
// const Conversation = mongoose.model("conversations");

// module.exports = function (io) {
//   io.on("connection", function (socket) {
//     console.log("User connected");

//     socket.on("join", function (room) {
//       socket.join(room);
//     });

//     socket.on("createMessage", async function (data) {
//       console.log(data);
     

//       // //emit to client
//       // io.to(message.room).emit('newMessage', {
//       //     message: data.message,
//       //     from_id: data.from_id,
//       //     to_id: data.to_id,
//       //     room: data.room
//       // });


//        //check if theres a conversation
//        const convo = await Conversation.findOne({from:data.from, to:data.to})
//     });

//     socket.on("disconnect", function () {
//       console.log("user disconnected");
//     });
//   });
// };
