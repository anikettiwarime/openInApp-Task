import nodecron from 'node-cron';
import {Task} from '../models/task.model.js';
import {calculateTaskPriority} from '../utils/helper.js';

const updateTaskPriority = nodecron.schedule('0 0 * * *', async () => {
    const tasks = await Task.find({
        deletedAt: null,
    });

    const updatedTasksIds = tasks.map((task) => {
        task.priority = calculateTaskPriority(task.due_date);
        task.save();
        return task._id;
    });
    console.log(`Updated tasks: ${updatedTasksIds}`);
});

export {updateTaskPriority};
