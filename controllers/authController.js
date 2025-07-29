import HttpError from "../helpers/HttpError.js";
import controllerWrapper from "./controllerWrapper.js";
import { registerUser, loginUser, logoutUser, updateData, verifyEmailService} from "../services/authServices.js";


const registerController = async(req, res, next) =>{
    const data = await req.body
    const newUser = await registerUser({...req.body});


    res.status(201).json({
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isOnboarded: newUser.isOnboarded
    })
}

const loginController = async(req, res, next) =>{
    const {token, payload} = await loginUser(req.body)

    res.json({
        token,
        user: {
            email: payload.email,
            name: payload.name,
            role: payload.role,
            isOnboarded: payload.isOnboarded
        }
    })
}

const logoutController = async(req, res) => {
    const {id} = req.user;
    await logoutUser(id)
    res.status(204).send()
}

const getCurrentController = (req, res)=>{
    const {email, name, role, isOnboarded} = req.user
    res.json({
        email,
        name,
        role,
        isOnboarded
    })
}


const verifyEmail = async(req, res) => {
    const { token } = req.params;

    const result = await verifyEmailService(token)
    if(result.isVerified){
        res.json({message: 'Email successfully confirmed!'})
    }
}

export default {
    registerController: controllerWrapper(registerController),
    loginController: controllerWrapper(loginController),
    getCurrentController: controllerWrapper(getCurrentController),
    logoutController: controllerWrapper(logoutController),
    verifyEmail: controllerWrapper(verifyEmail)
}