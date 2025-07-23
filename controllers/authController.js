import HttpError from "../helpers/HttpError.js";
import controllerWrapper from "./controllerWrapper.js";
import { registerUser, loginUser, logoutUser, updateData } from "../services/authServices.js";


const registerController = async(req, res, next) =>{
    const newUser = await registerUser({...req.body});


    res.status(201).json({
        email: newUser.email,
        name: newUser.name,
    })
}

const loginController = async(req, res, next) =>{
    const {token, payload} = await loginUser(req.body)

    res.json({
        token,
        user: {
            email: payload.email,
            name: payload.name,
        }
    })
}

const logoutController = async(req, res) => {
    const {id} = req.user;
    await logoutUser(id)
    res.status(204).send()
}

const getCurrentController = (req, res)=>{
    const {email, name} = req.user
    console.log(req.user)
    res.json({
        email,
        name,
    })
}

export default {
    registerController: controllerWrapper(registerController),
    loginController: controllerWrapper(loginController),
    getCurrentController: controllerWrapper(getCurrentController),
    logoutController: controllerWrapper(logoutController),
}