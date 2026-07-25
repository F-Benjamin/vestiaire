export type RuntimeEnvironment = "development" | "preview" | "production";

const runtimeEnvironments = new Set<RuntimeEnvironment>([
  "development",
  "preview",
  "production",
]);

const isRuntimeEnvironment = (
  value: string | undefined,
): value is RuntimeEnvironment =>
  runtimeEnvironments.has(value as RuntimeEnvironment);

export const getRuntimeEnvironment = (): RuntimeEnvironment => {
  if (isRuntimeEnvironment(process.env.APP_ENV)) {
    return process.env.APP_ENV;
  }

  if (
    process.env.CONTEXT === "deploy-preview" ||
    process.env.CONTEXT === "branch-deploy" ||
    process.env.CONTEXT === "preview-server"
  ) {
    return "preview";
  }

  return process.env.NODE_ENV === "development"
    ? "development"
    : "production";
};
