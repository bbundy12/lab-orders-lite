import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { closeTestServer, getTestServer } from "@/test/integration/utils/test-server";

let baseUrl: string;

beforeAll(async () => {
  const { baseUrl: url } = await getTestServer();
  baseUrl = url;
});

afterAll(async () => {
  await closeTestServer();
});

function api() {
  return request(baseUrl);
}

describe("Orders API integration", () => {
  it("creates an order and returns full payload", async () => {
    const [patient, labTests] = await Promise.all([
      prisma.patient.findFirstOrThrow(),
      prisma.labTest.findMany({ take: 2 }),
    ]);

    const payload = {
      patientId: patient.id,
      items: labTests.map((test) => ({
        labTestId: test.id,
        unitPriceCents: test.priceCents,
        turnaroundDaysAtOrder: test.turnaroundDays,
      })),
    };

    const response = await api()
      .post("/api/orders")
      .set("accept", "application/json")
      .set("content-type", "application/json")
      .send(payload);

    if (response.status !== 201) {
      console.error("create order failure", {
        status: response.status,
        body: response.body,
        text: response.text,
        error: response.error ? response.error.message : undefined,
        headers: response.headers,
      });
    }

    expect(response.status).toBe(201);
    expect(response.body.patientId).toBe(payload.patientId);
    expect(response.body.items).toHaveLength(labTests.length);
    expect(response.body.totalCents).toBe(
      labTests.reduce((total, test) => total + test.priceCents, 0)
    );
    expect(response.body.status).toBe("DRAFT");
  });

  it("moves through status transitions", async () => {
    const patient = await prisma.patient.findFirstOrThrow();
    const labTest = await prisma.labTest.findFirstOrThrow();

    const createResponse = await api()
      .post("/api/orders")
      .set("accept", "application/json")
      .set("content-type", "application/json")
      .send({
        patientId: patient.id,
        items: [
          {
            labTestId: labTest.id,
            unitPriceCents: labTest.priceCents,
            turnaroundDaysAtOrder: labTest.turnaroundDays,
          },
        ],
      });

    if (createResponse.status !== 201) {
      console.error("order setup failure", {
        status: createResponse.status,
        body: createResponse.body,
        text: createResponse.text,
        error: createResponse.error ? createResponse.error.message : undefined,
        headers: createResponse.headers,
      });
    }

    expect(createResponse.status).toBe(201);

    const orderId = createResponse.body.id;
    const transitions = ["SUBMITTED", "IN_PROGRESS", "READY"] as const;

    for (const status of transitions) {
      const response = await api()
        .patch(`/api/orders/${orderId}`)
        .set("accept", "application/json")
        .set("content-type", "application/json")
        .send({ status });

      if (response.status !== 200) {
        console.error(
          "transition failure",
          status,
          response.status,
          response.body ?? response.text
        );
      }

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(status);
    }

    const invalidResponse = await api()
      .patch(`/api/orders/${orderId}`)
      .set("accept", "application/json")
      .set("content-type", "application/json")
      .send({ status: "SUBMITTED" });

    expect(invalidResponse.status).toBe(400);
  });
});
