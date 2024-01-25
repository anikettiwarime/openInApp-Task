import {Schema, model} from 'mongoose';

const subTaskSchema = new Schema(
    {
        task_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        status: {
            type: Number,
            enum: [0, 1], // 0 - incomplete, 1 - complete
            default: 0,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export default model('SubTask', subTaskSchema);
