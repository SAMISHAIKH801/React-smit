
import express from 'express'

let router = express.Router()


router.get('/signup', (req, res, next) => {
    
    console.log('this is signup', new Date())
    res.send('this is signup' + new Date())
    
})
router.get('/login', (req, res, next) => {
    
    console.log('this is login', new Date())
    res.send('this is login' + new Date())
    
})

export default router