const http = require("node:http");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

if (process.env.EXPO_METRO_API_PROXY === "true") {
  config.server = {
    ...config.server,
    enhanceMiddleware: (metroMiddleware) => (request, response, next) => {
      if (!request.url?.startsWith("/v1/")) {
        return metroMiddleware(request, response, next);
      }

      const upstream = http.request(
        {
          hostname: "127.0.0.1",
          port: Number(process.env.EXPO_METRO_API_PROXY_PORT ?? 4000),
          path: request.url,
          method: request.method,
          headers: {
            ...request.headers,
            host: "127.0.0.1:4000",
          },
        },
        (upstreamResponse) => {
          response.writeHead(
            upstreamResponse.statusCode ?? 502,
            upstreamResponse.headers,
          );
          upstreamResponse.pipe(response);
        },
      );

      upstream.on("error", () => {
        if (response.headersSent) {
          response.end();
          return;
        }
        response.writeHead(502, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            code: "DEVELOPMENT_API_UNAVAILABLE",
            message: "The local development API is unavailable.",
          }),
        );
      });

      request.pipe(upstream);
    },
  };
}

module.exports = config;
