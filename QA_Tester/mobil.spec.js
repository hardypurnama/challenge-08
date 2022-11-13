require("dotenv").config();
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { JWT_SIGNATURE_KEY } = require("../config/application");
const app = require("../app");
const models = require("../app/models");
const {
  CarAlreadyRentedError,
  RecordNotFoundError,
  InsufficientAccessError,
} = require("../app/errors");

let adminToken;
let server;
let carId;
let custToken;

const user = {
  name: "Hardy123",
  email: "hardy@gmail.com",
  password: "Test123!@#",
};

const customer = {
  name: "asep123",
  email: "asep@gmail.com",
  password: "Test123!@#",
};

const newCar = {
  name: "Toyota Veloz",
  price: 400000000,
  size: "MPV",
  image:
    "https://www.toyota.astra.co.id/sites/default/files/2021-11/3-veloz-platinum-white-pearl.png",
};

const unauthorizedResponse = new InsufficientAccessError("CUSTOMER");

beforeAll(() => {
  server = app.listen(1338);
  adminToken = jwt.sign(
    {
      id: 1,
      name: user.name,
      email: user.email,
      role: {
        id: 2,
        name: "ADMIN",
      },
    },
    JWT_SIGNATURE_KEY
  );
  custToken = jwt.sign(
    {
      id: 2,
      name: customer.name,
      email: customer.email,
      role: {
        id: 1,
        name: "CUSTOMER",
      },
    },
    JWT_SIGNATURE_KEY
  );
});

describe("GET /v1/cars", () => {
  it("sukses 200", async () =>
    request(server)
      .get("/v1/cars")
      .then((res) => {
        expect(res.statusCode).toBe(200);
      }));
});

describe("POST /v1/cars/", () => {
  it("respon 400", async () =>
    request(server)
      .post("/v1/cars")
      .send(newCar)
      .set("Accept", "application/json")
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty(["error"]);
      }));

  it("respon 400", async () =>
    request(server)
      .post("/v1/cars")
      .send(newCar)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${custToken}`)
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual(
          expect.objectContaining({
            error: {
              name: "Error",
              message: unauthorizedResponse.message,
              details: unauthorizedResponse.details,
            },
          })
        );
      }));

  it("respon 200", async () =>
    request(server)
      .post("/v1/cars")
      .send(newCar)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${adminToken}`)
      .then((res) => {
        carId = res.body.id;
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            name: newCar.name,
            price: newCar.price,
            image: newCar.image,
            size: newCar.size,
          })
        );
      }));
});

describe("GET /v1/cars/{id}", () => {
  it("respon 400", async () =>
    request(server)
      .get("/v1/cars/99")
      .then((res) => {
        expect(res.statusCode).toBe(422);
        expect(res.body).toEqual(
          expect.objectContaining(new RecordNotFoundError())
        );
      }));

  it("respon berdasarkan id", async () =>
    request(server)
      .get(`/v1/cars/${carId}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining(new RecordNotFoundError())
        );
      }));
});

describe("PUT /v1/cars/{id}", () => {
  it("respon 400", async () =>
    request(server)
      .put("/v1/cars/99")
      .send(newCar)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${adminToken}`)
      .then((res) => {
        expect(res.statusCode).toBe(422);
        expect(res.body).toEqual(
          expect.objectContaining(new RecordNotFoundError())
        );
      }));

  it("respon 400", async () =>
    request(server)
      .put("/v1/cars/${carId}")
      .send(newCar)
      .set("Accept", "application/json")
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty(["error"]);
      }));

  it("respon 400", async () =>
    request(server)
      .put(`/v1/cars/${carId}`)
      .send(newCar)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${custToken}`)
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual(
          expect.objectContaining({
            error: {
              name: "Error",
              message: unauthorizedResponse.message,
              details: unauthorizedResponse.details,
            },
          })
        );
      }));

  it("respon 200", async () =>
    request(server)
      .put(`/v1/cars/${carId}`)
      .send(newCar)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${adminToken}`)
      .then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            id: carId,
            name: newCar.name,
            price: newCar.price,
            image: newCar.image,
            size: newCar.size,
          })
        );
      }));
});

describe("DELETE /v1/cars/{id}", () => {
  it("respon 400", async () =>
    request(server)
      .delete("/v1/cars/99")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${adminToken}`)
      .then((res) => {
        expect(res.statusCode).toBe(422);
        expect(res.body).toEqual(
          expect.objectContaining(new RecordNotFoundError())
        );
      }));

  it("respon 400", async () =>
    request(server)
      .delete(`/v1/cars/${carId}`)
      .set("Accept", "application/json")
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty(["error"]);
      }));

  it("respon 400", async () =>
    request(server)
      .delete(`/v1/cars/${carId}`)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${custToken}`)
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual(
          expect.objectContaining({
            error: {
              name: "Error",
              message: unauthorizedResponse.message,
              details: unauthorizedResponse.details,
            },
          })
        );
      }));

  it("respon 200", async () =>
    request(server)
      .delete(`/v1/cars/${carId}`)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${adminToken}`)
      .then((res) => {
        expect(res.statusCode).toBe(204);
      }));
});

afterAll(async () => {
  await models.Car.destroy({
    where: {
      name: newCar.name,
    },
  });
  models.sequelize.close();
  server.close();
});
