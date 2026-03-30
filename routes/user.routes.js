import { Router } from 'express';

import authorize from '../middleware/auth.middleware.js';
import errormiddleware from '../middleware/error.middleware.js';
import { getUsers } from '../controllers/user.controller.js';
import { getUserById } from '../controllers/user.controller.js';
import { createUser } from '../controllers/user.controller.js';
import { updateUser } from '../controllers/user.controller.js';
import { deleteUser } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.get('/', getUsers);

userRouter.get('/:id', authorize, errormiddleware, getUserById);

userRouter.post('/', createUser);

userRouter.put('/:id', authorize, errormiddleware, updateUser);

userRouter.delete('/:id', authorize, errormiddleware, deleteUser);

export default userRouter;