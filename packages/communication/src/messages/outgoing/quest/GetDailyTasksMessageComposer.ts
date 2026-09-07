import { IMessageComposer } from '@octane/api';

export class GetDailyTasksMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetDailyTasksMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetDailyTasksMessageComposer>;

    constructor()
    {
        this._data = [];
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
