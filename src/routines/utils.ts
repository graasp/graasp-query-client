import { Routine } from '../types.js';

const createRoutine = (type: string): Routine => ({
  TRIGGER: `${type}/TRIGGER`,
  REQUEST: `${type}/REQUEST`,
  FAILURE: `${type}/FAILURE`,
  SUCCESS: `${type}/SUCCESS`,
  FULFILL: `${type}/FULFILL`,
});

export default createRoutine;
