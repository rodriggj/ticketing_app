import express, { Request, Response }from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router()

router.post('/api/users/signin', (req, res)=>{
    res.send('Hello from the Sign In route.')
})


export { router as signinRouter}