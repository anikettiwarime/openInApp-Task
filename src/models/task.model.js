import {Schema, model} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        due_date: {
            type: Date,
            required: true,
        },
        priority: {
            type: Number,
            enum: [0, 1, 2, 3],
            // 0 - Today,1 - (Tomorrow and Day After Tomorrow), 2 - (3 to 4 days), 3 - (5+ - 5 or more days)
        },
        status: {
            type: String,
            enum: ['TODO', 'IN_PROGRESS', 'DONE'],
            default: 'TODO',
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
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

taskSchema.plugin(mongooseAggregatePaginate);

export const Task = model('Task', taskSchema);
