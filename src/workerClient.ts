import type { WorkerOutcome, WorkerRequestKind, WorkerResponse } from "./protocol";

const worker = new Worker(new URL("./db.worker.ts", import.meta.url), { type: "module" });
const pending = new Map<number, (outcome: WorkerOutcome) => void>();
let nextId = 0;

worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
  const { id, outcome } = event.data;
  pending.get(id)?.(outcome);
  pending.delete(id);
};

export function sendToWorker(kind: WorkerRequestKind, sql: string): Promise<WorkerOutcome> {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    worker.postMessage({ id, kind, sql });
  });
}
