import cors from "cors";

const CLICKED_PRODUCTION_ORIGIN = "https://clickedph.vercel.app";
const LOOPBACK_ORIGIN = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

function configuredOrigins(value = process.env.PRINT_AGENT_ALLOWED_ORIGINS) {
  return new Set([
    CLICKED_PRODUCTION_ORIGIN,
    ...String(value ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]);
}

export function isAllowedAgentOrigin(origin, allowedOrigins = configuredOrigins()) {
  return !origin || LOOPBACK_ORIGIN.test(origin) || allowedOrigins.has(origin);
}

export function configureLocalAgentAccess(app, options = {}) {
  const allowedOrigins = configuredOrigins(options.allowedOrigins);

  app.use((request, response, next) => {
    const origin = request.get("Origin");
    const requestsPrivateNetwork = request.get("Access-Control-Request-Private-Network") === "true";

    if (requestsPrivateNetwork && isAllowedAgentOrigin(origin, allowedOrigins)) {
      response.setHeader("Access-Control-Allow-Private-Network", "true");
    }
    next();
  });

  app.use(cors({
    origin(origin, callback) {
      callback(null, isAllowedAgentOrigin(origin, allowedOrigins));
    },
  }));
}
