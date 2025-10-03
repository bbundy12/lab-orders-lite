import { createServer, type Server } from "http";
import next from "next";
import { parse } from "url";

let serverInstance: Server | null = null;
let readyPromise: Promise<void> | null = null;
let baseUrl: string | null = null;

async function ensureServer() {
  if (!readyPromise) {
    readyPromise = (async () => {
      const app = next({ dev: true, dir: process.cwd() });
      const handle = app.getRequestHandler();

      await app.prepare();

      serverInstance = createServer((req, res) => {
        const parsedUrl = parse(req.url ?? "", true);
        handle(req, res, parsedUrl);
      });

      await new Promise<void>((resolve) => {
        serverInstance?.listen(0, () => {
          const address = serverInstance?.address();
          if (address && typeof address === "object" && address.port) {
            baseUrl = `http://127.0.0.1:${address.port}`;
          }
          resolve();
        });
      });
    })();
  }

  await readyPromise;
  if (!serverInstance || !baseUrl) {
    throw new Error("Test server failed to start");
  }

  return { server: serverInstance, baseUrl };
}

export async function getTestServer() {
  return ensureServer();
}

export async function closeTestServer() {
  if (!serverInstance) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    serverInstance?.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  serverInstance = null;
  readyPromise = null;
  baseUrl = null;
}
