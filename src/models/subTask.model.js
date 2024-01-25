import {Schema, model} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const subTaskSchema = new Schema(
    {
        task_id: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: null,
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

subTaskSchema.plugin(mongooseAggregatePaginate);

export const SubTask = model('SubTask', subTaskSchema);
