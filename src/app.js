import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
    })
);

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public'));
app.use(cookieParser());

// Routes import
import userRoutes from './routes/user.routes.js';
import taskRoutes from './routes/task.routes.js';
import subTaskRoutes from './routes/subTask.routes.js';

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/subtasks', subTaskRoutes);

export {app};
