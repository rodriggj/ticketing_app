import express, { Request, Response }from 'express'
import { body, validationResult } from 'express-validator'
import { User } from '../models/users'
import { RequestValidationError } from '../errors/request-validation-error'
import { BadRequestError } from '../errors/bad-request-error'

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
async (req: Request, res: Response) => {
        const errors = validationResult(req)

        if(!errors.isEmpty()) {
            throw new RequestValidationError(errors.array())
        }

        const { email, password } = req.body

        // Query existing User Documents to see if User already exists
        const existingUser = await User.findOne({ email })
        if(existingUser) {
            console.log('Email already exists.')
            throw new BadRequestError('Email already exists.')
        }

        // If User does not exist we will Hash Password

        // We will then create the User Document in mongodb
        const user = User.build({ email, password })
        await user.save()

        // Send back to the user some token for Auth

        res.status(201).send(user)
    }
)

export { router as signupRouter}