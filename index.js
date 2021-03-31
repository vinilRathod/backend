const express = require('express');
const cors = require('cors');
const connection = require('./db');
const PORT = process.env.PORT || 3001;
const { addUser, delUser, getUser, getUsersInRoom,getUsersInRoombySoc } = require('./users');
const router = require('./router');
const http = require('http');
const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
      origin: "https://vi-chat.netlify.app",
      methods: ["GET", "POST","PUT","DELETE"],
      credentials: true
    }
  });
app.use(express.json());
app.use(cors());

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
app.use(router);

io.on('connection',(socket)=>{
    console.log("We have a new user connected !");
    socket.on('join',({name,room},callback)=>{
       
        addUser({id:socket.id,name,room}).then(res=>{
            global.user1=res;
            socket.emit('message',{user: 'bot',text:`${global.user1.name} , Welcome to the room ${global.user1.room}`});
            socket.broadcast.to(global.user1.room).emit('message',{user:'bot',text:`${global.user1.name} has joined !`});
            socket.join(global.user1.room);
        }).catch(err=>{
            return callback  && callback(error);
        })
        getUsersInRoom(room).then(result=>{
                users=result;
                io.to(room).emit('roomData',{room,users})
            }).catch(err=>{
            return callback  && callback(error);
        })
        
           
            
        if(callback) callback();
    });
    socket.on('sendMessage',(message,callback)=>{
        var user,users;
        getUser(socket.id).then(res=>{
            user=res;
            io.to(user.room).emit('message',{user:user.pname,text:message});
        }).catch(err=>{
            console.log(err)
        })
        getUsersInRoombySoc(socket.id).then(result=>{
                room=result[0].room;
                getUsersInRoom(room).then(results=>{
                    users=results;
                    io.to(room).emit('roomData',{room,users})
                }).catch(err=>{
                return callback  && callback(error);
            })
            }).catch(err =>{
                console.log(err);
            })
        
       
       // io.to(user.room).emit('roomData',{room:user.room,users :getUsersInRoom(user.room)});
        callback();
    });
    socket.on('disconnect',()=>{
        var user,users;
        getUser(socket.id).then(res=>{
            user=res;
        }).catch(err=>{
            console.log(err)
        })
        delUser(socket.id).then(res=>{
            if(user){
                io.to(user.room).emit('message',{user:'bot',text:`${user.pname} left the chat !`})
                //io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
          }
        }).catch(err =>{
            console.log(err);
        })
        getUsersInRoombySoc(socket.id).then(result=>{
            room=result[0].room;
            getUsersInRoom(room).then(results=>{
                users=results;
                io.to(room).emit('roomData',{room,users})
            }).catch(err=>{
            return callback  && callback(error);
        })
        }).catch(err =>{
            console.log(err);
        })
       
});
});


server.listen(PORT,()=>{
    console.log(`The server is running on ${PORT} !`)
});