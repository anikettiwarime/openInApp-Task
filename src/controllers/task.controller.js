import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {Task} from '../models/task.model.js';
import {SubTask} from '../models/subTask.model.js';
import {
    calculateTaskPriority,
    isNotPastDate,
    isValidDate,
} from '../utils/helper.js';
import mongoose, {isValidObjectId} from 'mongoose';

// Create a task for a user
const createTask = asyncHandler(async (req, res) => {
    const {title, description, due_date} = req.body;

    if ([title, description, due_date].some((field) => field?.trim === '')) {
        throw new ApiError(
            400,
            'Title, description, and due date are required'
        );
    }

    if (isNotPastDate(due_date) === false && isValidDate(due_date) === false) {
        throw new ApiError(400, 'Due date cannot be in the past or invalid');
    }

    const task = await Task.create({
        title,
        description,
        due_date,
        user: req.user.id,
        priority: calculateTaskPriority(due_date),
    });

    if (!task) {
        throw new ApiError(500, 'Unable to create task due to server error');
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

// Get all tasks for a user
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
        if (!isValidDate(due_date)) {
            throw new ApiError(400, 'Invalid due date');
        }
        aggregate.match({
            due_date: new Date(due_date),
        });
    }

    aggregate.lookup({
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
            {
                $project: {
                    _id: 1,
                    phone_number: 1,
                    priority: 1,
                },
            },
        ],
    });

    aggregate.lookup({
        from: 'subtasks',
        localField: '_id',
        foreignField: 'task_id',
        as: 'subTasks',
        pipeline: [
            {
                $match: {
                    deletedAt: null,
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    due_date: 1,
                    priority: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ],
    });


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
        user: {
            $arrayElemAt: ['$user', 0],
        },
        subTasks: 1,
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

// Update a task for a user
const updateTask = asyncHandler(async (req, res) => {
    const {task_id} = req.params;
    let {due_date, status} = req.body;

    if (!due_date && !status) {
        throw new ApiError(400, 'Due date or status is required');
    }

    if (isValidObjectId(task_id) === false) {
        throw new ApiError(400, 'Invalid task ID');
    }

    if (status) {
        status = String(status).toUpperCase();
        if (!['TODO', 'DONE'].includes(status)) {
            throw new ApiError(400, 'Invalid status');
        }
    }

    // Check if due date is valid
    if (isNotPastDate(due_date) === false || isValidDate(due_date) === false) {
        throw new ApiError(400, 'Due date cannot be in the past or invalid');
    }

    const task = await Task.findOne({
        _id: task_id,
        user: req.user.id,
    });

    if (!task) {
        throw new ApiError(404, 'Task not found');
    }

    if (due_date && isNotPastDate(due_date)) {
        task.due_date = due_date;
        task.priority = calculateTaskPriority(due_date);
    }

    if (status) {
        task.status = status;
        if (status === 'DONE') {
            await SubTask.updateMany(
                {
                    task_id: task._id,
                },
                {
                    status: 1,
                }
            );
        }
    }

    const updatedTask = await task.save();

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTask, 'Task updated successfully'));
});

// Delete a task for a user
const deleteTask = asyncHandler(async (req, res) => {
    const {task_id} = req.params;

    if (isValidObjectId(task_id) === false) {
        throw new ApiError(400, 'Invalid task ID');
    }

    const task = await Task.findOneAndUpdate(
        {
            _id: task_id,
            user: new mongoose.Types.ObjectId(req.user._id),
        },
        {
            deletedAt: Date.now(),
        },
        {
            new: true,
        }
    );

    if (!task) {
        throw new ApiError(404, 'Task not found');
    }

    await SubTask.updateMany(
        {
            task_id: task._id,
        },
        {
            deletedAt: Date.now(),
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                task,
                'Task deleted successfully with all subtasks'
            )
        );
});

export {createTask, getAllUserTasks, updateTask, deleteTask};
