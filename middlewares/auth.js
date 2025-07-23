import HttpError from "../helpers/HttpError.js"
import { verifyToken } from "../helpers/jwt.js";
import { findUser } from "../services/authServices.js";


const auth = async(req, res, next) =>{
    const {authorization} = req.headers;
    if(!authorization){
        return next(HttpError(401, "Not authorized"));
    }

    const [bearer, token] = authorization.split(" ");
    if(bearer !== "Bearer"){
        return next(HttpError(401, "Not authorized"));
    }

    const {payload, error} = verifyToken(token)
    if (error || !payload || !payload.email) {
        return next(HttpError(401, "Not authorized"));
    }
    
    const user = await findUser({email: payload.email})
    if(!user || !user.token) {
        return next(HttpError(401, "Not authorized"));
    }
    req.user = user;
    next();
}

export default auth