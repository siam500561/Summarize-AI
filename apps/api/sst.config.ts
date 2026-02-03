/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "ai-summarizer-api",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    const api = new sst.aws.Function("Api", {
      handler: "src/lambda.handler",
      runtime: "nodejs20.x",
      timeout: "30 seconds",
      memory: "512 MB",
      url: true,
      environment: {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
        CORS_ORIGINS: process.env.CORS_ORIGINS || "",
        NODE_ENV: "production",
      },
    });

    return {
      apiUrl: api.url,
    };
  },
});
