import {Router} from 'express';
const router = Router();

import {verifyJWT} from '../middlewares/auth.middleware.js';
import {
    createTask,
    getAllUserTasks,
    updateTask,
    deleteTask,
} from '../controllers/task.controller.js';

router.route('/').get(verifyJWT, getAllUserTasks).post(verifyJWT, createTask);
router
    .route('/:task_id')
    .patch(verifyJWT, updateTask)
    .delete(verifyJWT, deleteTask);

export default router;
