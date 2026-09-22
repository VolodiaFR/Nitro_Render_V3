import { Container } from 'pixi.js';

const stage = new Container();

stage.eventMode = 'none';

export const GetStage = () => stage;
