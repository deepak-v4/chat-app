const http=require('http')
const Filter = require('bad-words')

const { static } = require('express')
const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const { Socket } = require('dgram')

const { generateMessage, generateLocMessage }= require('../src/utils/messages')

const { getUser,getUserInRoom,removeUser,addUser } = require('./utils/users')

const app = express()
const server=http.createServer(app)
const io=socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))


const msg='welcome'    
io.on('connection',(socket)=>{

    console.log('New web scoket connection !!')



    socket.on('join',(options, callback)=>{

        
        const { error, user }= addUser({id:socket.id,...options})
        
        if(error){
            return callback(error)
        }


        socket.join(user.room)



        socket.emit('message',generateMessage('Admin','Welcome!'))  
        socket.broadcast.to(user.room).emit('Admin',generateMessage(user.username,`${user.username} has joined !`))

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUserInRoom(user.room)
        })



        callback()
    })


    socket.on('sendMsg',(msg,callback)=>{
        
        
        
        const user = getUser(socket.id)
        
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed !!')
        }

        io.to(user.room).emit('message',generateMessage(user.username,msg))    
        callback()


    })

    socket.on('disconnect',()=>{

        const userR = removeUser(socket.id)

        if(userR){
            io.to(userR.room).emit('message',generateMessage('Admin',`${userR.username} has left !`))
        
            io.to(userR.room).emit('roomData',{
                room: userR.room,
                users: getUserInRoom(userR.room)
            })
        
        }

        //socket.broadcast.emit('message',generateMessage('A user has disconnected !!'))
    })

    socket.on('location',(coords,callback)=>{

        const user = getUser(socket.id)

        io.to(user.room).emit('messageloc',generateLocMessage(user.username,`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`))
    
        callback()
    
    })

})


server.listen(port,()=>{

    console.log('Server is up on port '+port+' !')
})