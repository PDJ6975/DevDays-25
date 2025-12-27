import { Router } from "express";
import { addUser, getUser, getUsers, removeUser, updateUser } from "../controllers/user.controller.js";
import { validateCreateAndUpdateUser } from "../middlewares/user.middleware.js";


const userRouter = Router();

userRouter.get('/users', getUsers);
userRouter.get('/users/:id', getUser);
userRouter.post('/users', validateCreateAndUpdateUser, addUser);
userRouter.delete('/users/:id', removeUser);
userRouter.put('/users/:id', validateCreateAndUpdateUser, updateUser);

export { userRouter };