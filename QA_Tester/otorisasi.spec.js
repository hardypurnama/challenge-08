require("dotenv").config();
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { JWT_SIGNATURE_KEY } = require("../config/application");
const app = require("../app");
const models = require("../app/models");
const {
  WrongPasswordError,
  EmailNotRegisteredError,
  EmailAlreadyTakenError,
} = require("../app/errors");

let token;
let server;

const decodeToken = (token) => jwt.verify(token, JWT_SIGNATURE_KEY);

const user = {
  name: "Hardy123",
  email: "hardy@gmail.com",
  password: "Test123!@#",
};

beforeAll(() => {
  server = app.listen(1337);
});

describe("POST /v1/auth/register", () => {
  it("data berhasil create", async () =>
    request(server)
      .post("/v1/auth/register")
      .send(user)
      .set("Accept", "application/json")
      .then((res) => {
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(
          expect.objectContaining({
            accessToken: expect.any(String),
          })
        );
      }));
  it("data tidak terotorisasi", async () =>
    request(server)
      .post("/v1/auth/register")
      .send(user)
      .set("Accept", "application/json")
      .then((res) => {
        expect(res.statusCode).toBe(422);
        expect(res.body).toEqual(
          expect.objectContaining(new EmailAlreadyTakenError())
        );
      }));
});

describe("POST /v1/auth/login", () => {
  const { email, password } = user;

  it("data berhasil create", async () =>
    request(server)
      .post("/v1/auth/login")
      .send({ email, password })
      .set("Accept", "application/json")
      .then((res) => {
        if (res.body.accessToken) {
          token = res.body.accessToken;
        }
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(
          expect.objectContaining({
            accessToken: expect.any(String),
          })
        );
      }));

  it("data tidak terotorisasi", async () =>
    request(server)
      .post("/v1/auth/login")
      .send({ email, password: "512213" })
      .set("Accept", "application/json")
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toEqual(
          expect.objectContaining(new WrongPasswordError())
        );
      }));

  it("data tidak ditemukan", async () => {
    const email = "hardy@hotmail.com";
    const password = "asd123";

    return request(server)
      .post("/v1/auth/login")
      .send({ email, password })
      .set("Accept", "application/json")
      .then((res) => {
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual(
          expect.objectContaining(new EmailNotRegisteredError(email).toJSON())
        );
      });
  });
});

describe("GET /v1/auth/whoami", () => {
  it("sukses", async () =>
    request(server)
      .get("/v1/auth/whoami")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .then((res) => {
        const decodedToken = decodeToken(token);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            id: decodedToken.id,
            email: decodedToken.email,
            name: decodedToken.name,
          })
        );
      }));

  it("gagal login", async () =>
    request(server)
      .get("/v1/auth/whoami")
      .set("Accept", "application/json")
      .then((res) => {
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty(["error"]);
      }));
});

afterAll(async () => {
  await models.User.destroy({
    where: {
      email: user.email,
    },
  });
  models.sequelize.close();
  server.close();
});
