import { IMessageDataWrapper, IMessageParser } from '@octane/api';
import { DailyTaskData } from './DailyTaskData';

/** ActiveDailyTasks (2900) and DailyTasksAdded (670): a list of daily tasks. */
export class ActiveDailyTasksMessageParser implements IMessageParser
{
    private _tasks: DailyTaskData[];

    public flush(): boolean
    {
        this._tasks = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._tasks.push(new DailyTaskData(wrapper));

        return true;
    }

    public get tasks(): DailyTaskData[]
    {
        return this._tasks;
    }
}
