import express from 'express'

const router = express.Router()

router.get('/api/users/currentuser', (req, res)=>{
    res.send('Hello from the Current User route.')
})

export { router as currentUserRouter}