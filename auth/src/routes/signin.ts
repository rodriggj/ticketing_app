import express, { Request, Response }from 'express'
import { body } from 'express-validator'
import jwt  from 'jsonwebtoken'

import { validateRequest } from '../middleware/validate-request'
import { User } from '../models/users'
import { BadRequestError } from '../errors/bad-request-error'
import { Password } from '../services/password'

const router = express.Router()

router.post('/api/users/signin', [
    body('email')
       .isEmail()
       .withMessage('Email must be valid.'),
    body('password')
       .trim()
       .notEmpty()
       .withMessage('You must supply a password.')
],
validateRequest,
async (req: Request, res: Response)=>{
    const { email, password } = req.body

    // Validate the user exists
    const existingUser = await User.findOne({ email })
    if(!existingUser) {
        throw new BadRequestError('Invalid credentials')
    }

    // Compare password in DB with password entered
    const passwordsMatch = await Password.compare(existingUser.password, password)
    if(!passwordsMatch) {
        throw new BadRequestError('Invalid credentials')
    }

    // Generate JWT
    const userJwt = jwt.sign({
        id: existingUser.id,
        email: existingUser.email
    }, process.env.JWT_KEY!)

    // Save it on the Session Object
    req.session = {
        jwt: userJwt
    }

    res.status(200).send(existingUser)
})

export { router as signinRouter}