export const DEFAULT_PRINT_AGENT_URL = "http://127.0.0.1:3421/print";

export function resolvePrintAgentUrl(configuredUrl: string | undefined) {
  return configuredUrl?.trim() || DEFAULT_PRINT_AGENT_URL;
}
