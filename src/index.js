import connectDB from './db/connectDB.js';
import {app} from './app.js';
import {PROJECT_NAME} from './utils/constants.js';
import {updateTaskPriority} from './crons/task.crons.js';
import {callDueDatePassedUsers} from './crons/calling.crons.js';

connectDB()
    .then(
        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server listening on port ${process.env.PORT}`);
            console.log(`Project name: ${PROJECT_NAME}`);
            updateTaskPriority.start;
            callDueDatePassedUsers.start;
        })
    )
    .catch((err) => console.log(err));
