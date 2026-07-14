import { describe, expect, it } from 'vitest';
import { readMessengerE2eEnvironment } from './messengerE2eEnvironment';

const valid = {
    E2E_WS_URL: 'ws://127.0.0.1:31999',
    E2E_SSO_TICKET: 'ticket-a',
    E2E_USER_ID: '900001',
    E2E_ROOM_ID: '900002',
    E2E_PROBE_URL: 'http://127.0.0.1:31999/__e2e',
    E2E_SECOND_SSO_TICKET: 'ticket-b',
    E2E_SECOND_USER_ID: '900003'
};

describe('readMessengerE2eEnvironment', () =>
{
    it('returns both Messenger identities', () =>
    {
        expect(readMessengerE2eEnvironment(valid)).toMatchObject({
            ssoTicket: 'ticket-a',
            userId: 900001,
            secondSsoTicket: 'ticket-b',
            secondUserId: 900003
        });
    });

    it('rejects a missing second ticket', () =>
    {
        expect(() => readMessengerE2eEnvironment({ ...valid, E2E_SECOND_SSO_TICKET: '' }))
            .toThrow('E2E_SECOND_SSO_TICKET');
    });

    it('rejects a duplicate second identity', () =>
    {
        expect(() => readMessengerE2eEnvironment({ ...valid, E2E_SECOND_USER_ID: '900001' }))
            .toThrow('must differ');
    });
});
