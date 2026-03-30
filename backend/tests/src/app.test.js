import assert from "node:assert/strict";
import http from "node:http";
import app from "../../src/app.js";
import { test } from "../helpers/testRunner.js";

const listen = () =>
  new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });

const request = (port, path) =>
  new Promise((resolve, reject) => {
    const req = http.get(
      {
        host: "127.0.0.1",
        port,
        path,
      },
      (res) => {
        let body = "";

        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
          });
        });
      }
    );

    req.on("error", reject);
  });

test("app boots and returns json for unknown api routes", async () => {
  const server = await listen();

  try {
    const address = server.address();
    const response = await request(address.port, "/api/unknown");

    assert.equal(response.statusCode, 404);
    assert.equal(
      response.headers["content-type"]?.includes("application/json"),
      true
    );
    assert.deepEqual(JSON.parse(response.body), {
      success: false,
      message: "API route not found",
    });
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});
