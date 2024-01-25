import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {Task} from '../models/task.model.js';
import {calculateTaskPriority, isNotPastDate} from '../utils/helper.js';
import mongoose from 'mongoose';

const createTask = asyncHandler(async (req, res) => {
    const {title, description, due_date} = req.body;

    if ([title, description, due_date].some((field) => field?.trim === '')) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    'Title, description and due date are required'
                )
            );
    }

    if (isNotPastDate(due_date) === false) {
        return res
            .status(400)
            .json(new ApiError(400, 'Due date cannot be in the past'));
    }

    const task = await Task.create({
        title,
        description,
        due_date,
        user: req.user.id,
        priority: calculateTaskPriority(due_date),
    });

    if (!task) {
        return res
            .status(500)
            .json(new ApiError(500, 'Task not created due to server error'));
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                task,
                'Task created successfully with priority'
            )
        );
});

const getAllUserTasks = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, priority, due_date, status} = req.query;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
    };

    const aggregate = Task.aggregate();
    aggregate.match({
        user: new mongoose.Types.ObjectId(req.user._id),
    });

    if (status) {
        aggregate.match({
            status,
        });
    }

    if (priority) {
        aggregate.match({
            priority: parseInt(priority),
        });
    }

    aggregate.match({
        deletedAt: null,
    });

    if (due_date) {
        aggregate.match({
            due_date: new Date(due_date),
        });
    }
    aggregate.project({
        _id: 1,
        title: 1,
        description: 1,
        due_date: 1,
        priority: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        deletedAt: 1,
        user: 1,
    });

    // Execute the aggregate query
    const tasks = await Task.aggregatePaginate(aggregate, {
        ...options,
        customLabels: {
            docs: 'tasks',
            totalDocs: 'total tasks',
        },
    });

    return res.status(200).json(new ApiResponse(200, tasks, 'Tasks found'));
});

const updateTask = asyncHandler(async (req, res) => {
    const {task_id} = req.params;
    let {due_date, status} = req.body;

    if (!due_date && !status) {
        return res
            .status(400)
            .json(new ApiError(400, 'Due date or status is required'));
    }

    if (isValidObjectId(task_id) === false) {
        return res.status(400).json(new ApiError(400, 'Invalid task ID'));
    }

    if (status) {
        status = String(status).toUpperCase();
        if (!['TODO', 'DONE'].includes(status)) {
            return res.status(400).json(new ApiError(400, 'Invalid status'));
        }
    }

    if (isNotPastDate(due_date) === false) {
        return res
            .status(400)
            .json(new ApiError(400, 'Due date cannot be in the past'));
    }

    const task = await Task.findOne({
        _id: task_id,
        user: req.user.id,
    });

    if (!task) {
        return res.status(404).json(new ApiError(404, 'Task not found'));
    }

    if (due_date) {
        task.due_date = due_date;
        task.priority = calculateTaskPriority(due_date);
    }

    if (status) {
        task.status = status;
    }

    const updatedTask = await task.save();

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTask, 'Task updated successfully'));
});

const deleteTask = asyncHandler(async (req, res) => {
    const {task_id} = req.params;

    if (isValidObjectId(task_id) === false) {
        return res.status(400).json(new ApiError(400, 'Invalid task ID'));
    }

    const task = await Task.findOneAndUpdate(
        {
            _id: task_id,
            user: req.user.id,
        },
        {
            deletedAt: Date.now(),
        },
        {
            new: true,
        }
    );

    if (!task) {
        return res.status(404).json(new ApiError(404, 'Task not found'));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task, 'Task deleted successfully'));
});

export {createTask, getAllUserTasks, updateTask, deleteTask};
