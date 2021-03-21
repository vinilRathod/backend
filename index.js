const express = require('express');
const cors = require('cors');
const { addUser , delUser , getUser , getUsersinRoom} = require('./users')
const PORT = process.env.PORT || 3001;
const router = require('./router');
const http = require('http');
const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
      origin: "https://vi-chat.netlify.app",
      methods: ["GET", "POST"],
      credentials: true
    }
  });
app.use(cors());
app.use(router);
app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if(req.method === 'OPTIONS')
    {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});
io.on('connection',(socket)=>{
    console.log("We have a new user connected !");
    socket.on('join',({name,room},callback)=>{
        const {error , user } = addUser({id:socket.id,name,room});
        if(error) 
        {
            return callback  && callback(error);
        }
        socket.emit('message',{user: 'admin',text:`${user.name} , Welcome to the room ${user.room}`});
        socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name} has joined !`});

        socket.join(user.room);
        io.to(user.room).emit('roomData',{room:user.room,users: getUsersinRoom(user.room)})
        if(callback) callback();
    });
    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('message',{user:user.name,text:message});
        io.to(user.room).emit('roomData',{room:user.room,users : getUsersinRoom(user.room)});
        callback();
    });
    socket.on('disconnect',()=>{
        const user = delUser(socket.id);
        if(user){
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} left the chat !`})
        }
    });
});


server.listen(PORT,()=>{
    console.log(`The server is running on ${PORT} !`)
});