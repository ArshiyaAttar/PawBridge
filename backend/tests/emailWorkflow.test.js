import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import AdoptionApplication from "../models/AdoptionApplication.js";
import EmailNotification from "../models/EmailNotification.js";
import Pet from "../models/Pet.js";
import RescueReport from "../models/RescueReport.js";
import User from "../models/User.js";

const sentEmails = [];

const { applyForAdoption, reviewApplication } = await import(
  "../controllers/adoptionController.js"
);
const { createRescueReport, updateRescueReport } = await import(
  "../controllers/rescueController.js"
);

const envKeys = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "MAIL_FROM",
  "ADMIN_NOTIFICATION_EMAIL",
  "EMAIL_NOTIFICATIONS_ENABLED",
  "EMAIL_NOTIFY_ADMIN",
  "EMAIL_NOTIFY_SUBMITTER",
  "EMAIL_NOTIFY_ADOPTION_STATUS",
  "EMAIL_NOTIFY_RESCUE_ASSIGNMENT",
  "EMAIL_NOTIFY_RESCUE_RESOLVED",
];
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));

const setEmailEnvironment = () => {
  process.env.SMTP_HOST = "smtp.gmail.com";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "sender@example.test";
  process.env.SMTP_PASSWORD = "mock-app-password";
  process.env.MAIL_FROM = "sender@example.test";
  process.env.ADMIN_NOTIFICATION_EMAIL = "admin@example.test";
  process.env.EMAIL_NOTIFICATIONS_ENABLED = "true";
  process.env.EMAIL_NOTIFY_ADMIN = "true";
  process.env.EMAIL_NOTIFY_SUBMITTER = "true";
  process.env.EMAIL_NOTIFY_ADOPTION_STATUS = "true";
  process.env.EMAIL_NOTIFY_RESCUE_ASSIGNMENT = "true";
  process.env.EMAIL_NOTIFY_RESCUE_RESOLVED = "true";
};

let deliveryRecords;

const response = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const queryFor = (document) => ({
  populate() {
    return this;
  },
  session() {
    return this;
  },
  select() {
    return this;
  },
  then(resolve, reject) {
    return Promise.resolve(document).then(resolve, reject);
  },
});

test.beforeEach((t) => {
  setEmailEnvironment();
  sentEmails.length = 0;
  deliveryRecords = new Map();
  t.mock.method(nodemailer, "createTransport", (options) => ({
    options,
    sendMail: async (message) => {
      sentEmails.push(message);
      return { accepted: [message.to], rejected: [] };
    },
  }));
  t.mock.method(EmailNotification, "create", async (record) => {
    if (deliveryRecords.has(record.dedupeKey)) {
      const error = new Error("duplicate");
      error.code = 11000;
      throw error;
    }
    deliveryRecords.set(record.dedupeKey, { ...record });
  });
  t.mock.method(EmailNotification, "findOne", ({ dedupeKey }) => ({
    lean: async () => {
      const record = deliveryRecords.get(dedupeKey);
      return record ? { status: record.status } : null;
    },
  }));
  t.mock.method(EmailNotification, "updateOne", async ({ dedupeKey }, { $set }) => {
    const record = deliveryRecords.get(dedupeKey);
    if (record) Object.assign(record, $set);
  });
});

test.afterEach(() => {
  envKeys.forEach((key) => {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  });
});

test("adoption submission persists first, then emails admin and adopter once", async (t) => {
  const application = { _id: "application-1" };
  t.mock.method(Pet, "findById", async () => ({
    _id: "pet-1",
    name: "Milo",
    species: "Cat",
    status: "Available",
    isActive: true,
  }));
  t.mock.method(AdoptionApplication, "create", async () => application);

  const res = response();
  await applyForAdoption(
    {
      params: { petId: "pet-1" },
      body: {
        reason: "I can offer a safe and caring home.",
        applicantPhone: "1234567890",
        householdConsent: true,
        carePlan: "I will provide daily exercise, vet checkups, and safe shelter.",
      },
      user: { _id: "adopter-1", name: "Alex", email: "adopter@example.test" },
    },
    res
  );

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.emailNotificationSent, true);
  assert.deepEqual(
    sentEmails.map(({ to }) => to).sort(),
    ["admin@example.test", "adopter@example.test"]
  );
  assert.ok(sentEmails.every(({ html }) => html.includes("PAWBRIDGE")));
  assert.ok([...deliveryRecords.values()].every(({ status }) => status === "sent"));
});

test("rescue submission emails the admin and reporting user", async (t) => {
  t.mock.method(RescueReport, "create", async () => ({
    _id: "rescue-1",
    animalType: "Dog",
    location: "Solapur",
  }));

  const res = response();
  await createRescueReport(
    {
      body: {
        animalType: "Dog",
        description: "An injured dog needs help near the main road.",
        location: "Solapur",
        contactPhone: "1234567890",
      },
      user: { _id: "reporter-1", name: "Alex", email: "reporter@example.test" },
    },
    res
  );

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.emailNotificationSent, true);
  assert.deepEqual(
    sentEmails.map(({ to }) => to).sort(),
    ["admin@example.test", "reporter@example.test"]
  );
});

test("email failures do not undo saved adoption or rescue submissions", async (t) => {
  t.mock.method(console, "error", () => {});
  EmailNotification.create.mock.mockImplementation(async () => {
    const error = new Error("database unavailable");
    error.code = "DB_UNAVAILABLE";
    throw error;
  });
  t.mock.method(Pet, "findById", async () => ({
    _id: "pet-1",
    name: "Milo",
    species: "Cat",
    status: "Available",
    isActive: true,
  }));
  const createApplication = t.mock.method(
    AdoptionApplication,
    "create",
    async () => ({ _id: "application-failure-1" })
  );
  const createReport = t.mock.method(
    RescueReport,
    "create",
    async () => ({ _id: "rescue-failure-1" })
  );

  const adoptionResponse = response();
  await applyForAdoption(
    {
      params: { petId: "pet-1" },
      body: {
        reason: "I can offer a safe and caring home.",
        applicantPhone: "1234567890",
        householdConsent: true,
        carePlan: "I will provide daily exercise, vet checkups, and safe shelter.",
      },
      user: { _id: "adopter-1", name: "Alex", email: "adopter@example.test" },
    },
    adoptionResponse
  );

  const rescueResponse = response();
  await createRescueReport(
    {
      body: {
        animalType: "Dog",
        description: "An injured dog needs help near the main road.",
        location: "Solapur",
        contactPhone: "1234567890",
      },
      user: { _id: "reporter-1", name: "Alex", email: "reporter@example.test" },
    },
    rescueResponse
  );

  assert.equal(createApplication.mock.callCount(), 1);
  assert.equal(createReport.mock.callCount(), 1);
  assert.equal(adoptionResponse.statusCode, 201);
  assert.equal(adoptionResponse.body.emailNotificationSent, false);
  assert.equal(rescueResponse.statusCode, 201);
  assert.equal(rescueResponse.body.emailNotificationSent, false);
});

test("application approval emails the adopter after the database transaction commits", async (t) => {
  const pet = {
    _id: "pet-2",
    name: "Coco",
    species: "Dog",
    shelter: "shelter-1",
  };
  const application = {
    _id: "application-2",
    status: "Pending",
    pet,
    applicant: "adopter-2",
    async save() {},
  };
  t.mock.method(mongoose, "startSession", async () => ({
    withTransaction: async (operation) => operation(),
    endSession: async () => {},
  }));
  const findApplication = t.mock.method(
    AdoptionApplication,
    "findById",
    () => queryFor(application)
  );
  t.mock.method(AdoptionApplication, "find", () =>
    queryFor([
      {
        _id: "application-3",
        pet,
        applicant: {
          _id: "adopter-3",
          name: "Jamie",
          email: "other-adopter@example.test",
        },
      },
    ])
  );
  t.mock.method(AdoptionApplication, "updateMany", async () => ({ modifiedCount: 0 }));
  t.mock.method(Pet, "findOneAndUpdate", async () => pet);
  findApplication.mock.mockImplementation(() =>
    queryFor({
      ...application,
      applicant: {
        _id: "adopter-2",
        name: "Alex",
        email: "adopter@example.test",
      },
    })
  );

  const res = response();
  await reviewApplication(
    {
      params: { id: "application-2" },
      body: { status: "Approved" },
      user: { _id: "admin-1", role: "admin" },
    },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.emailNotificationSent, true);
  assert.equal(sentEmails.length, 2);
  assert.ok(
    sentEmails.some(
      ({ to, subject }) =>
        to === "adopter@example.test" && subject.includes("approved")
    )
  );
  assert.ok(
    sentEmails.some(
      ({ to, subject }) =>
        to === "other-adopter@example.test" && subject.includes("rejected")
    )
  );
});

test("rescue assignment notifies the assigned rescuer and resolution notifies reporter", async (t) => {
  const rescuer = {
    _id: "rescuer-1",
    name: "Sam",
    email: "rescuer@example.test",
  };
  t.mock.method(User, "findOne", async () => rescuer);

  const assignedReport = {
    _id: "report-1",
    reporter: { name: "Alex", email: "reporter@example.test" },
    assignedRescuer: null,
    status: "Submitted",
    animalType: "Dog",
    location: "Solapur",
    updatedAt: new Date(),
    async save() {
      this.updatedAt = new Date();
    },
    async populate(field) {
      if (field === "reporter") return this;
      this.assignedRescuer = rescuer;
      return this;
    },
  };
  const findReport = t.mock.method(
    RescueReport,
    "findById",
    async () => assignedReport
  );

  const assignmentResponse = response();
  await updateRescueReport(
    {
      params: { id: "report-1" },
      body: { assignedRescuer: "rescuer-1", status: "Assigned" },
      user: { _id: "admin-1", role: "admin" },
    },
    assignmentResponse
  );

  assert.equal(assignmentResponse.statusCode, 200);
  assert.equal(assignmentResponse.body.emailNotificationSent, true);
  assert.equal(sentEmails.at(-1).to, "rescuer@example.test");
  assert.ok(sentEmails.at(-1).subject.includes("assigned"));

  const resolvingReport = {
    _id: "report-2",
    reporter: "reporter-2",
    assignedRescuer: "rescuer-1",
    status: "In Progress",
    animalType: "Cat",
    location: "Pune",
    updatedAt: new Date(),
    async save() {
      this.updatedAt = new Date();
    },
    async populate(field) {
      if (field === "reporter") {
        this.reporter = { name: "Alex", email: "reporter@example.test" };
      } else {
        this.assignedRescuer = rescuer;
      }
      return this;
    },
  };
  findReport.mock.mockImplementation(async () => resolvingReport);

  const resolutionResponse = response();
  await updateRescueReport(
    {
      params: { id: "report-2" },
      body: { status: "Resolved" },
      user: { _id: "rescuer-1", role: "rescuer" },
    },
    resolutionResponse
  );

  assert.equal(resolutionResponse.statusCode, 200);
  assert.equal(resolutionResponse.body.emailNotificationSent, true);
  assert.equal(sentEmails.at(-1).to, "reporter@example.test");
  assert.ok(sentEmails.at(-1).subject.includes("resolved"));
});
