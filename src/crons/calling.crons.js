import nodecron from 'node-cron';
import {makeOutGoingCall} from '../utils/twilio.js';
import {Task} from '../models/task.model.js';
import {User} from '../models/user.model.js';

const callDueDatePassedUsers = nodecron.schedule('0 12 * * *', async () => {
    const tasks = await Task.find({
        deletedAt: null,
        due_date: {
            $lte: new Date(),
        },
        status: {
            $ne: 'DONE',
        },
    });

    const users = await User.find({
        _id: {
            $in: tasks.map((task) => task.user),
        },
    }).sort({
        priority: 1,
    });

    console.log('\n\nCalling Started\n\n');
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const task = tasks.find(
            (task) => task.user.toString() === user._id.toString()
        );
        await makeOutGoingCall(
            user.phone_number,
            `Hello this is a reminder for your task ${task.title}`
        );
    }
});

export {callDueDatePassedUsers};
