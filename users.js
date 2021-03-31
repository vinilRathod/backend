const { json } = require('express');
const connection = require('./db');
const addUser = ({id,name,room}) =>{
    return new Promise((resolve,reject)=>{
        connection.query("INSERT INTO people(pname,room,id) VALUES(?,?,?);",[name,room,id],(err,res)=>{
            if(err) 
            {
                reject(new Error("Username already exists !"))
            }
            const user={id,name,room};
            resolve(user)
        });
    })
    
}
const delUser = (id) =>{
    return new Promise((resolve,reject)=>{
    connection.query("DELETE FROM people WHERE id= ?",id,(err,results)=>{
        if(err) reject(err);
        resolve(200);
    });
});
}
const getUser = (id) =>{
    return new Promise((resolve,reject)=>{
    connection.query("SELECT * FROM people where id = (?)",[id],(err4,res4)=>{
        if(err4) reject(err4);
        resolve(res4[0]);
    });
})
}

const getUsersInRoombySoc = (id) =>{
    return new Promise((resolve,reject)=>{
        connection.query("SELECT room FROM people where id = (?)",[id],(err4,res4)=>{
            if(err4) reject(err4);
            resolve(res4);
        });
    })
}

const getUsersInRoom = (room) =>{
    return new Promise((resolve,reject)=>{
        connection.query("SELECT * FROM people where room = (?)",[room],(err4,res4)=>{
            if(err4) reject(err4);
            resolve(res4);
        });
    })
}

module.exports={
    addUser,
    delUser,
    getUser,
    getUsersInRoom,
    getUsersInRoombySoc
}