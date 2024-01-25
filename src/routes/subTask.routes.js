import {Router} from 'express';
const router = Router();

import {verifyJWT} from '../middlewares/auth.middleware.js';
import {
    createSubTask,
    getAllSubTask,
    getSubTask,
    updateSubTask,
    deleteSubTask,
} from '../controllers/subTask.controller.js';

router.route('/').get(verifyJWT, getAllSubTask).post(verifyJWT, createSubTask);
router.route('/:task_id').get(verifyJWT, getSubTask);
router
    .route('/:sub_task_id')
    .patch(verifyJWT, updateSubTask)
    .delete(verifyJWT, deleteSubTask);

export default router;
