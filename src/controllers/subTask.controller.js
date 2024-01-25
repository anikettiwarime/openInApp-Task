import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {SubTask} from '../models/subTask.model.js';
import {Task} from '../models/task.model.js';
import {isValidObjectId} from 'mongoose';

const createSubTask = asyncHandler(async (req, res) => {
    const {task_id, title, description} = req.body;

    if ([task_id, title, description].some((field) => field?.trim === '')) {
        throw new ApiError(400, 'Task ID, title, and description are required');
    }

    if (isValidObjectId(task_id) === false) {
        throw new ApiError(400, 'Invalid task ID');
    }

    const subTask = await SubTask.create({
        task_id,
        title,
        description,
        status: 0,
    });

    if (!subTask) {
        throw new ApiError(
            500,
            'Unable to create sub task due to server error'
        );
    }

    return res
        .status(201)
        .json(new ApiResponse(201, subTask, 'Sub task created successfully'));
});

const getAllSubTask = asyncHandler(async (req, res) => {
    const tasks = await Task.find({user: req.user._id});
    const taskIds = tasks.map((task) => task._id);

    const subTasks = await SubTask.find({ task_id: { $in: taskIds } });
    
    const data = {
        subTasks,
        totalSubTasks: subTasks.length
    }

    return res
        .status(200)
        .json(new ApiResponse(200, data, 'Sub tasks fetched successfully'));
});

const getSubTask = asyncHandler(async (req, res) => {
    const {task_id} = req.params;

    if (isValidObjectId(task_id) === false) {
        throw new ApiError(400, 'Invalid task ID');
    }

    const subTask = await SubTask.findOne({_id: task_id});
    if (!subTask) {
        throw new ApiError(404, 'Sub task not found');
    }

    if (subTask.deletedAt !== null) {
        throw new ApiError(404, 'Sub task deleted');
    }

    if (subTask.task_id !== req.user._id) {
        throw new ApiError(403, 'Forbidden');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subTask, 'Sub task fetched successfully'));
});

const updateSubTask = asyncHandler(async (req, res) => {
    const {sub_task_id} = req.params;

    if (!sub_task_id) {
        throw new ApiError(400, 'Sub task ID is required');
    }
    if (isValidObjectId(sub_task_id) === false) {
        throw new ApiError(400, 'Invalid sub task ID');
    }
    const {status} = req.body;

    if (!status) {
        throw new ApiError(400, 'Status is required');
    }

    if ([0, 1].includes(status) === false) {
        throw new ApiError(400, 'Invalid status');
    }

    const subTask = await SubTask.findOneAndUpdate(
        {_id: sub_task_id},
        {status},
        {new: true}
    );

    if (!subTask) {
        throw new ApiError(404, 'Sub task not found');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subTask, 'Sub task fetched successfully'));
});

const deleteSubTask = asyncHandler(async (req, res) => {
    const {sub_task_id} = req.params;

    if (!sub_task_id) {
        throw new ApiError(400, 'Sub task ID is required');
    }

    if (isValidObjectId(sub_task_id) === false) {
        return res.status(400).json(new ApiError(400, 'Invalid sub task ID'));
    }

    const subTask = await SubTask.findOneAndDelete({_id: sub_task_id});

    if (!subTask) {
        return res.status(404).json(new ApiError(404, 'Sub task not found'));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subTask, 'Sub task fetched successfully'));
});

export {createSubTask, getAllSubTask, getSubTask, updateSubTask, deleteSubTask};
