const socket=io()




//elements
const $msgForm= document.querySelector('#message-form')
const $msgFormInput= $msgForm.querySelector('input')
const $msgFormButton=$msgForm.querySelector('button')
const $msgFormsendLoc=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//templates


const $msgTemp=document.querySelector('#message-template').innerHTML
const $msgTemploc=document.querySelector('#loc-message-template').innerHTML
const $sideBarTemp=document.querySelector('#sidebar-template').innerHTML


//options
const { username, room } = Qs.parse(location.search,{ignoreQueryPrefix:true})



const autoscroll = () => {

    const $newMsg = $messages.lastElementChild
    const newMsgStyle = getComputedStyle($newMsg)
    const newMsgMargin = parseInt(newMsgStyle.marginBottom)
    const newMsgHeight = $newMsg.offsetHeight + newMsgMargin

    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight-newMsgHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }

    console.log(newMsgMargin)

}



socket.on('message',(msg)=>{
    console.log(msg)
    const html=Mustache.render($msgTemp,{
        username : msg.username,
        msg : msg.text,
        createdAt : moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll()

})



socket.on('messageloc',(msg)=>{
    console.log(msg)
    
    const html=Mustache.render($msgTemploc,{
        username: msg.username,
        msg : msg.url,
        createdAt : moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)

    autoscroll()
})


socket.on('roomData',({room, users})=>{

    const html = Mustache.render($sideBarTemp,{
        room,
        users

    })

    document.querySelector('#sidebar').innerHTML=html

})




$msgForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $msgFormButton.setAttribute('disabled','disabled')

    const msg = e.target.elements.message.value

    socket.emit('sendMsg',msg,(error)=>{

        $msgFormButton.removeAttribute('disabled')
        $msgFormInput.value=''
        $msgFormInput.focus()

        if(error){
            return console.log(error)
        }

        console.log('Message Delivered !')
    })
})


$msgFormsendLoc.addEventListener('click',()=>{

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by browser. ')
    }


    $msgFormsendLoc.setAttribute('disabled','disabled')


    navigator.geolocation.getCurrentPosition((position)=>{

        console.log(position)


        socket.emit('location',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            

            $msgFormsendLoc.removeAttribute('disabled')

            console.log('location shared!! ')


        })
    
    })

    

})



socket.emit('join', {username, room },(error)=>{

    if(error){
        alert(error)
        location.href = '/'
    }

})

