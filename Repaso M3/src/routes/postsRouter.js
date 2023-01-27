// const express = require('express')
const { Router } = require('express')
const { addPost } = require('../controllers/controllers')

// const postsRouter = express.Router()
const postsRouter = Router()

postsRouter.get('/',(req,res)=>{
res.send('soy las rutas posts')
})

postsRouter.post('/',(req,res)=>{
    try {
        const { userId, title, contents } = req.body
        if(!userId || !title || !contents) throw new Error('Faltan enviar datos para crear post')
        const newPost = addPost(title, contents,userId)
        res.status(200).json(newPost)
    } catch (error) {
        res.status(400).json(error.message)
    }
})



module.exports = postsRouter