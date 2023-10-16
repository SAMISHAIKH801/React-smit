
import express from 'express'

let router = express.Router()


router.delete('/feed/:userId', (req, res, next) => {
    
    console.log('this is login', new Date())
    res.send('Post created' + new Date())
    
})

export default router