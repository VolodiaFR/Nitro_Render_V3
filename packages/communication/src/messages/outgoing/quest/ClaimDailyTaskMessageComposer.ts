import { IMessageComposer } from '@octane/api';

export class ClaimDailyTaskMessageComposer implements IMessageComposer<ConstructorParameters<typeof ClaimDailyTaskMessageComposer>>
{
    private _data: ConstructorParameters<typeof ClaimDailyTaskMessageComposer>;

    constructor(taskId: number)
    {
        this._data = [taskId];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
