import { E2eEnvironment, readE2eEnvironment } from './e2eEnvironment';

export interface MessengerE2eEnvironment extends E2eEnvironment
{
    secondSsoTicket: string;
    secondUserId: number;
}

export const readMessengerE2eEnvironment = (environment: Record<string, string | undefined>): MessengerE2eEnvironment =>
{
    const common = readE2eEnvironment(environment);
    const secondSsoTicket = environment.E2E_SECOND_SSO_TICKET?.trim();

    if(!secondSsoTicket) throw new Error('Missing E2E environment variable: E2E_SECOND_SSO_TICKET');

    const secondUserId = Number(environment.E2E_SECOND_USER_ID);

    if(!Number.isSafeInteger(secondUserId) || secondUserId <= 0) throw new Error('E2E_SECOND_USER_ID must be a positive integer');
    if(secondUserId === common.userId) throw new Error('E2E_SECOND_USER_ID must differ from E2E_USER_ID');

    return { ...common, secondSsoTicket, secondUserId };
};
