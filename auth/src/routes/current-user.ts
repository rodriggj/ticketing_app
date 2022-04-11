import express from 'express'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.get('/api/users/currentuser', (req, res)=>{

    // First check to see that the current session has a JWT Token passed in the cookie
    if(!req.session?.jwt) {   // writtent this way b/c of typescript w/o ts, this line would be !req.session | !req.session.jwt
        return res.send({ currentUser: null })
    }

    // now check to see that the JWT is valid
    try{
        const payload = jwt.verify(
            req.session.jwt, 
            process.env.JWT_KEY!   // written with ! b/c ts
        )
        res.send({ currentUser: payload })
    } catch(err) {
        res.send( { currentUser: null })
    }
})

export { router as currentUserRouter}
