
import express from 'express'

let router = express.Router()

router.get('/comment/:postId/:commentId', (req, res, next) => {
    
    console.log('this is login', new Date())
    res.send('Post created' + new Date())
    
})
router.get('/comments/:postId', (req, res, next) => {

    console.log('this is login', new Date())
    res.send('Post created 2' + new Date())
    
})
router.post('/comment', (req, res, next) => {

    console.log('this is login', new Date())
    res.send('Post created' + new Date())
    
})
router.put('/comment/:postId/:commentId', (req, res, next) => {

    console.log('this is login', new Date())
    res.send('Post created' + new Date())
    
})
router.delete('/comment/:postId/:commentId', (req, res, next) => {

    console.log('this is login', new Date())
    res.send('Post created' + new Date())
    
})

export default router