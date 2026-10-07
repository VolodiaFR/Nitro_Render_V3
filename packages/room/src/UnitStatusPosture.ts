/**
 * What a unit status does to the posture. A status that only shows a sign or a pet gesture keeps a
 * sit or lay, but never a walk: without "mv" the unit has stopped, so a walking unit stands again.
 * (A horse stopping with "/gst lov/" kept walking on the spot.)
 */
export const settleUnitPosture = (postureUpdate: boolean, isPosture: boolean, wasWalking: boolean): 'apply' | 'stand' | 'keep' =>
{
    if(postureUpdate) return 'apply';

    return (isPosture || wasWalking) ? 'stand' : 'keep';
};
