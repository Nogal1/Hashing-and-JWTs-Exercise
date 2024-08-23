const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");

let testUserToken;
let otherUserToken;
let testUser;
let otherUser;
let testMessage;

describe("User and Message Routes Test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM messages WHERE from_username = 'testuser' OR to_username = 'testuser'");
  await db.query("DELETE FROM users WHERE username = 'testuser' OR username = 'otheruser'");


    // Seed users
    testUser = await User.register({
      username: "testuser",
      password: "password",
      first_name: "Test",
      last_name: "User",
      phone: "+1415555000",
    });

    otherUser = await User.register({
      username: "otheruser",
      password: "password",
      first_name: "Other",
      last_name: "User1",
      phone: "+1415555111",
    });

    // Generate token for testUser
    testUserToken = jwt.sign({ username: testUser.username }, process.env.SECRET_KEY);
    otherUserToken = jwt.sign({ username: otherUser.username }, process.env.SECRET_KEY);
    // Seed messages
    testMessage = await Message.create({
      from_username: "testuser",
      to_username: "otheruser",
      body: "Test message"
    });
  });

  /** Tests for User Routes */

  describe("GET /users", function () {
    test("can get list of users", async function () {
      let response = await request(app)
        .get("/users")
        .send({ _token: testUserToken }); // Token in body

      console.log("Response Body:", response.body);
      expect(response.body.users).toHaveLength(4);
      expect(response.body.users[0]).toHaveProperty("username");
    });

    test("fails if not logged in", async function () {
      let response = await request(app)
        .get("/users");

      expect(response.statusCode).toEqual(401);
    });
  });

  describe("GET /users/:username", function () {
    test("can get user detail", async function () {
      let response = await request(app)
        .get(`/users/${testUser.username}`)
        .send({ _token: testUserToken }); // Token in body

      expect(response.body.user).toHaveProperty("username", "testuser");
      expect(response.body.user).toHaveProperty("first_name", "Test");
    });

    test("fails if wrong user", async function () {
      let response = await request(app)
        .get(`/users/otheruser`)
        .send({ _token: testUserToken }); // Token in body

      expect(response.statusCode).toEqual(401);
    });
  });

  describe("GET /users/:username/to", function () {
    test("can't get messages to other user", async function () {
      let response = await request(app)
        .get(`/users/otheruser/to`)
        .send({ _token: testUserToken }); // Token in body

      expect(response.statusCode).toEqual(401);
    });

    test("can get messages to self", async function () {
      let response = await request(app)
        .get(`/users/otheruser/to`)
        .send({ _token: otherUserToken }); // Token in body

      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toHaveProperty("body", "Test message");
    });
  });

  describe("GET /users/:username/from", function () {
    test("can get messages from user", async function () {
      let response = await request(app)
        .get(`/users/testuser/from`)
        .send({ _token: testUserToken }); // Token in body

      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0]).toHaveProperty("body", "Test message");
    });

    test("fails if wrong user", async function () {
      let response = await request(app)
        .get(`/users/otheruser/from`)
        .send({ _token: testUserToken }); // Token in body

      expect(response.statusCode).toEqual(401);
    });
  });

  /** Tests for Message Routes */

  describe("GET /messages/:id", function () {
    test("can get message detail", async function () {
      let response = await request(app)
        .get(`/messages/${testMessage.id}`)
        .send({ _token: testUserToken }); // Token in body

      expect(response.body.message).toHaveProperty("body", "Test message");
    });

    test("fails if not sender or recipient", async function () {
      let response = await request(app)
        .get(`/messages/${testMessage.id}`)
        .send({ _token: '' }); // Token in body

      expect(response.statusCode).toEqual(401);
    });
  });

  describe("POST /messages", function () {
    test("can send a message", async function () {
      let response = await request(app)
        .post(`/messages`)
        .send({ _token: testUserToken, to_username: "otheruser", body: "Another test message" }); // Token in body

      expect(response.body.message).toHaveProperty("body", "Another test message");
    });

    test("fails if not logged in", async function () {
      let response = await request(app)
        .post(`/messages`)
        .send({ to_username: "otheruser", body: "Another test message" });

      expect(response.statusCode).toEqual(401);
    });
  });

  describe("POST /messages/:id/read", function () {
    test("can mark a message as read", async function () {
      let response = await request(app)
        .post(`/messages/${testMessage.id}/read`)
        .send({ _token: otherUserToken }); // Token in body

      expect(response.body.message).toHaveProperty("read_at");
    });

    test("fails if not recipient", async function () {
      let response = await request(app)
        .post(`/messages/${testMessage.id}/read`)
        .send({ _token: '' }); // Token in body

      expect(response.statusCode).toEqual(401);
    });
  });
});

afterAll(async function () {
  await db.end();
});