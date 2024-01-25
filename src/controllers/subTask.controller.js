import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {SubTask} from '../models/subTask.model.js';
import {isValidObjectId} from 'mongoose';

const createSubTask = asyncHandler(async (req, res) => {
    const {task_id, title, description} = req.body;

    if ([task_id, title, description].some((field) => field?.trim === '')) {
        return res
            .status(400)
            .json(
                new ApiError(400, 'Task ID, title and description are required')
            );
    }

    if (isValidObjectId(task_id) === false) {
        return res.status(400).json(new ApiError(400, 'Invalid task ID'));
    }

    const subTask = await SubTask.create({
        task_id,
        title,
        description,
        status: 0,
    });

    if (!subTask) {
        return res
            .status(500)
            .json(
                new ApiError(500, 'Sub task not created due to server error')
            );
    }

    return res
        .status(201)
        .json(new ApiResponse(201, subTask, 'Sub task created successfully'));
});

const getAllSubTask = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, status} = req.query;

    return res.status(200).json(
        new ApiResponse(
            200,
            await SubTask.aggregatePaginate(
                {
                    task_id: req.params.task_id,
                    ...(status && {status}),
                },
                {
                    page,
                    limit,
                    sort: {createdAt: -1},
                }
            ),
            'Sub task fetched successfully'
        )
    );
});

const getSubTask = asyncHandler(async (req, res) => {
    const {task_id} = req.params;

    const subTask = await SubTask.findOne({task_id});

    if (!subTask) {
        return res.status(404).json(new ApiError(404, 'Sub task not found'));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subTask, 'Sub task fetched successfully'));
});

const updateSubTask = asyncHandler(async (req, res) => {
    const {task_id} = req.params;

    const {status} = req.body;

    if (!status) {
        return res.status(400).json(new ApiError(400, 'Status is required'));
    }

    if (isValidObjectId(task_id) === false) {
        return res.status(400).json(new ApiError(400, 'Invalid task ID'));
    }

    const subTask = await SubTask.findOneAndUpdate(
        {task_id},
        {status},
        {new: true}
    );

    if (!subTask) {
        return res.status(404).json(new ApiError(404, 'Sub task not found'));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subTask, 'Sub task fetched successfully'));
});

const deleteSubTask = asyncHandler(async (req, res) => {
    const {task_id} = req.params;

    if (isValidObjectId(task_id) === false) {
        return res.status(400).json(new ApiError(400, 'Invalid task ID'));
    }

    const subTask = await SubTask.findOneAndDelete({task_id});

    if (!subTask) {
        return res.status(404).json(new ApiError(404, 'Sub task not found'));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subTask, 'Sub task fetched successfully'));
});

export {createSubTask, getAllSubTask, getSubTask, updateSubTask, deleteSubTask};
