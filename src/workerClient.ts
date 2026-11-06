import type { WorkerOutcome, WorkerRequestBody, WorkerResponse } from "./protocol";

const TIMEOUT_MS = 10_000;
const TIMEOUT_MESSAGE =
  "Your query took longer than 10 seconds, so it was stopped. Any changes made in the playground were reset.";

type Pending = { resolve: (outcome: WorkerOutcome) => void; timer: ReturnType<typeof setTimeout> };

const pending = new Map<number, Pending>();
let nextId = 0;
let worker = startWorker();

function startWorker(): Worker {
  const created = new Worker(new URL("./db.worker.ts", import.meta.url), { type: "module" });
  created.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const { id, outcome } = event.data;
    const request = pending.get(id);
    if (!request) return;
    clearTimeout(request.timer);
    pending.delete(id);
    request.resolve(outcome);
  };
  return created;
}

/** A running query can't be interrupted, so the whole worker is replaced. */
function stopRunningQuery() {
  worker.terminate();
  worker = startWorker();
  for (const { resolve, timer } of pending.values()) {
    clearTimeout(timer);
    resolve({ kind: "error", error: TIMEOUT_MESSAGE });
  }
  pending.clear();
}

export function sendToWorker(body: WorkerRequestBody): Promise<WorkerOutcome> {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, { resolve, timer: setTimeout(stopRunningQuery, TIMEOUT_MS) });
    worker.postMessage({ ...body, id });
  });
}
