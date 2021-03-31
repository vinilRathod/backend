const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 12;
const connection=require('./db');
router.get("/",(req,res)=>{
    res.send("The server is up and running !")
});

router.post("/create",(req,res)=>{
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if(err) console.log(err);
        connection.query("INSERT INTO rooms(roomname,roompass) VALUES(?,?);",[req.body.room,hash],(err2,results)=>{
            if(err2) 
            {
                res.json({msg:"Roomname not availabe !",created:false});
            }else{
            res.json({msg:"Registration Success ! Login now !",created:true});
            }
        });
    });
    });
router.post("/login",(req,res)=>{
            connection.query("INSERT INTO people(pname,room) VALUES(?,?);",[req.body.name,req.body.room],(err2,results)=>{
                if(err2) 
                {
                    res.json({msg:"Username not availabe !",loggedin:false});
                }else{
                res.json({msg:"Done !",loggedin:true});
                }
            });
        });
router.post("/enter",(req,res)=>{
        connection.query("SELECT * FROM rooms WHERE roomname =?",[req.body.room],(err,results)=>{
            if(err) console.log(err);
            if(results.length >0 ){ 
                bcrypt.compare(req.body.password, results[0].roompass, function(err2, result) {
                    if(err2) console.log(err2);
                    if(result){
                        res.json({entered:true,username:req.body.username});
                    }else{
                        res.json({entered:false,msg:"Invalid Password/Roomname !"});
                    }
                });
               
            }else{
                res.json({entered:false,msg:"Roomname doesn't exist !"});
            }
        });
    });
module.exports=router;