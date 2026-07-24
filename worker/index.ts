import handler from "vinext/server/app-router-entry";

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

interface WorkerEnvironment {
  ASSETS?: {
    fetch(request: Request): Promise<Response> | Response;
  };
}

const worker = {
  fetch: (
    request: Request,
    environment: WorkerEnvironment,
    context: ExecutionContext,
  ): Response | Promise<Response> =>
    handler.fetch(request, environment, context),
};

export default worker;
