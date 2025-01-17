export function getJobDuration(job) {
  try {
    const params = JSON.parse(job.parameters);
    if (typeof job.next_job_details === 'string') {
      const next_job = JSON.parse(job.next_job_details);
      return parseInt(params.drive_time) + getJobDuration(next_job);
    } else {
      return parseInt(params.drive_time);
    }
  } catch(e) {
    console.warn("Error when reading job duration, defaulting to 0s", e);
    return 0;
  }
}

/**
 * Compute the wait time for a job (given perfect conditions)
 * @method
 * @param {Number[]} prev - duration of the jobs that are to be run before
 * @param {Number} workers - the number of workers
 * @return {Number} wait time in seconds, or -1 if wait time is unknown/infinite
*/
export function getJobWaitTime(prev, workers) {
  if (workers === 0) return -1;
  // An array with the time spent on each workers
  const wait = new Array(workers).fill(0);
  while (prev.length > 0) {
    const batch = prev.splice(0, workers);
    batch.forEach((v, i) => {
      wait[i] += v;
    })
    // Sort because the first job in prev should go the to first available worker
    // (the one with the least wait)
    wait.sort((a, b) => a > b);
  }
  // wait is sorted, so this is the min
  return wait[0];
}
