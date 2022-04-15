import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { isExpressionStatement } from 'typescript'

interface UserPayload {
    id: String, 
    email: String
}

declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload
        }
    }   
}

export const currentUser = (req: Request, res: Response, next: NextFunction ) => {
    // First check to see that the current session has a JWT Token passed in the cookie
    if(!req.session?.jwt) {   // writtent this way b/c of typescript w/o ts, this line would be !req.session | !req.session.jwt
        return next()
    }

    try{
        const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload
        req.currentUser = payload
    } catch(err){}
    next()
}   