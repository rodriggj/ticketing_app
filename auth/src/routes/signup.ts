import express, { Request, Response }from 'express'
import { body } from 'express-validator'
import { User } from '../models/users'
import { BadRequestError } from '../errors/bad-request-error'
import { validateRequest } from '../middleware/validate-request'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post(
    '/api/users/signup', 
[
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({min:4, max:20})
      .withMessage('Password must be between 4 and 20 characters')
], 
validateRequest,
async (req: Request, res: Response) => {
        const { email, password } = req.body

        // Query existing User Documents to see if User already exists
        const existingUser = await User.findOne({ email })
        if(existingUser) {
            // console.log('Email already exists.')
            throw new BadRequestError('Email already exists.')
        }

        // If User does not exist we will Hash Password
        //   - this is being done with our services/password.ts file

        // We will then create the User Document in mongodb
        const user = User.build({ email, password })
        await user.save()

        // Generate JWT
        const userJwt = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_KEY!)

        // Save it on the Session Object
        req.session = {
            jwt: userJwt
        }

        res.status(201).send(user)
    }
)

export { router as signupRouter}