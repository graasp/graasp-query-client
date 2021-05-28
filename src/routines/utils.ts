const createRoutine = (type: string) => ({
  FAILURE: `${type}/FAILURE`,
  SUCCESS: `${type}/SUCCESS`,
});

export default createRoutine;
