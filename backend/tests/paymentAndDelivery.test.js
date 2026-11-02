import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import AdoptionApplication from "../models/AdoptionApplication.js";
import Pet from "../models/Pet.js";
import RescueReport from "../models/RescueReport.js";

import {
  applyForAdoption,
  collectAdoptionPayment,
  reviewApplication,
} from "../controllers/adoptionController.js";
import {
  createRescueReport,
  updateRescueReport,
} from "../controllers/rescueController.js";

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
  then(resolve, reject) {
    return Promise.resolve(document).then(resolve, reject);
  },
});

test("adoption requests snapshot the shelter fee and requested delivery details", async (t) => {
  const originalNotificationsEnabled = process.env.EMAIL_NOTIFICATIONS_ENABLED;
  process.env.EMAIL_NOTIFICATIONS_ENABLED = "false";
  t.after(() => {
    if (originalNotificationsEnabled === undefined) {
      delete process.env.EMAIL_NOTIFICATIONS_ENABLED;
    } else {
      process.env.EMAIL_NOTIFICATIONS_ENABLED = originalNotificationsEnabled;
    }
  });

  const pet = {
    _id: "pet-1",
    name: "Milo",
    species: "Cat",
    status: "Available",
    isActive: true,
    adoptionFee: 750,
  };
  let createdApplication;
  t.mock.method(Pet, "findById", async () => pet);
  t.mock.method(AdoptionApplication, "create", async (application) => {
    createdApplication = application;
    return { _id: "application-1" };
  });

  const res = response();
  await applyForAdoption(
    {
      params: { petId: "pet-1" },
      body: {
        reason: "I can offer a safe and caring home.",
        applicantPhone: "1234567890",
        householdConsent: true,
        carePlan: "I will provide daily exercise, vet checkups, and safe shelter.",
        homeDeliveryRequested: true,
        deliveryAddress: "12 Sample Road, Pune, Maharashtra",
      },
      user: {
        _id: "adopter-1",
        name: "Demo Adopter",
        email: "adopter@example.test",
      },
    },
    res
  );

  assert.equal(res.statusCode, 201);
  assert.equal(createdApplication.adoptionFee, 750);
  assert.equal(createdApplication.paymentMethod, "COD");
  assert.equal(createdApplication.paymentStatus, "Pending");
  assert.equal(createdApplication.homeDeliveryRequested, true);
  assert.equal(createdApplication.deliveryStatus, "Pending Review");
  assert.equal(
    createdApplication.deliveryAddress,
    "12 Sample Road, Pune, Maharashtra"
  );
});

test("adoption delivery request requires a valid address before saving", async (t) => {
  t.mock.method(Pet, "findById", async () => ({
    _id: "pet-1",
    status: "Available",
    isActive: true,
  }));
  const createApplication = t.mock.method(
    AdoptionApplication,
    "create",
    async () => ({ _id: "application-1" })
  );

  const res = response();
  await applyForAdoption(
    {
      params: { petId: "pet-1" },
      body: {
        reason: "I can offer a safe and caring home.",
        applicantPhone: "1234567890",
        householdConsent: true,
        carePlan: "I will provide daily exercise, vet checkups, and safe shelter.",
        homeDeliveryRequested: true,
        deliveryAddress: "short",
      },
      user: { _id: "adopter-1", name: "Demo Adopter", email: "adopter@example.test" },
    },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.equal(createApplication.mock.callCount(), 0);
});

test("shelter must decide delivery availability before approving a delivery request", async (t) => {
  const application = {
    status: "Pending",
    homeDeliveryRequested: true,
    deliveryStatus: "Pending Review",
    pet: { _id: "pet-1", shelter: "shelter-1" },
    async save() {},
  };
  t.mock.method(mongoose, "startSession", async () => ({
    withTransaction: async (operation) => operation(),
    endSession: async () => {},
  }));
  t.mock.method(AdoptionApplication, "findById", () => ({
    ...queryFor(application),
    session() {
      return this;
    },
  }));
  const updatePet = t.mock.method(Pet, "findOneAndUpdate", async () => ({
    _id: "pet-1",
  }));

  const res = response();
  await reviewApplication(
    {
      params: { id: "application-1" },
      body: { status: "Approved" },
      user: { _id: "shelter-1", role: "shelter" },
    },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.equal(application.status, "Pending");
  assert.equal(application.deliveryStatus, "Pending Review");
  assert.equal(updatePet.mock.callCount(), 0);
});

test("shelter records COD only for its approved application", async (t) => {
  const application = {
    _id: "application-1",
    status: "Approved",
    adoptionFee: 750,
    paymentStatus: "Pending",
    pet: { shelter: "shelter-1" },
    async save() {},
  };
  t.mock.method(AdoptionApplication, "findById", () => queryFor(application));
  t.mock.method(AdoptionApplication, "findOneAndUpdate", async (_filter, update) => {
    Object.assign(application, update.$set);
    return application;
  });

  const res = response();
  await collectAdoptionPayment(
    {
      params: { id: "application-1" },
      user: { _id: "shelter-1", role: "shelter" },
    },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(application.paymentStatus, "Paid");
  assert.equal(application.paymentCollectedBy, "shelter-1");
  assert.ok(application.paymentCollectedAt instanceof Date);
});

test("adoption COD cannot be recorded by another shelter", async (t) => {
  const application = {
    status: "Approved",
    adoptionFee: 750,
    paymentStatus: "Pending",
    pet: { shelter: "shelter-1" },
    async save() {},
  };
  t.mock.method(AdoptionApplication, "findById", () => queryFor(application));

  const res = response();
  await collectAdoptionPayment(
    {
      params: { id: "application-1" },
      user: { _id: "other-shelter", role: "shelter" },
    },
    res
  );

  assert.equal(res.statusCode, 403);
  assert.equal(application.paymentStatus, "Pending");
});

test("rescue reports store optional donations as cash pledges", async (t) => {
  const originalNotificationsEnabled = process.env.EMAIL_NOTIFICATIONS_ENABLED;
  process.env.EMAIL_NOTIFICATIONS_ENABLED = "false";
  t.after(() => {
    if (originalNotificationsEnabled === undefined) {
      delete process.env.EMAIL_NOTIFICATIONS_ENABLED;
    } else {
      process.env.EMAIL_NOTIFICATIONS_ENABLED = originalNotificationsEnabled;
    }
  });

  let createdReport;
  t.mock.method(RescueReport, "create", async (report) => {
    createdReport = report;
    return { _id: "rescue-1", animalType: report.animalType, location: report.location };
  });

  const res = response();
  await createRescueReport(
    {
      body: {
        animalType: "Dog",
        description: "An injured dog needs help near the main road.",
        location: "Solapur",
        contactPhone: "1234567890",
        donationAmount: "250",
      },
      user: { _id: "reporter-1", name: "Demo Reporter", email: "reporter@example.test" },
    },
    res
  );

  assert.equal(res.statusCode, 201);
  assert.equal(createdReport.donationAmount, 250);
  assert.equal(createdReport.donationStatus, "Pledged");
});

test("rescue donation pledge rejects negative and fractional amounts", async (t) => {
  const createReport = t.mock.method(
    RescueReport,
    "create",
    async () => ({ _id: "rescue-1" })
  );
  const res = response();
  await createRescueReport(
    {
      body: {
        animalType: "Dog",
        description: "An injured dog needs help near the main road.",
        location: "Solapur",
        contactPhone: "1234567890",
        donationAmount: "-10.5",
      },
      user: { _id: "reporter-1", name: "Demo Reporter", email: "reporter@example.test" },
    },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.equal(createReport.mock.callCount(), 0);
});

test("assigned rescuer can record a pledged donation as collected", async (t) => {
  const report = {
    _id: "rescue-1",
    status: "In Progress",
    assignedRescuer: "rescuer-1",
    donationAmount: 250,
    donationStatus: "Pledged",
    async save() {},
    async populate() {
      return this;
    },
  };
  t.mock.method(RescueReport, "findById", async () => report);
  t.mock.method(RescueReport, "updateOne", async () => ({ modifiedCount: 1 }));

  const res = response();
  await updateRescueReport(
    {
      params: { id: "rescue-1" },
      body: { donationStatus: "Collected" },
      user: { _id: "rescuer-1", role: "rescuer" },
    },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(report.donationStatus, "Collected");
  assert.equal(report.donationCollectedBy, "rescuer-1");
  assert.ok(report.donationCollectedAt instanceof Date);
});

test("unassigned rescuers cannot collect another case donation", async (t) => {
  const report = {
    status: "In Progress",
    assignedRescuer: "rescuer-1",
    donationAmount: 250,
    donationStatus: "Pledged",
    async save() {},
  };
  t.mock.method(RescueReport, "findById", async () => report);

  const res = response();
  await updateRescueReport(
    {
      params: { id: "rescue-1" },
      body: { donationStatus: "Collected" },
      user: { _id: "rescuer-2", role: "rescuer" },
    },
    res
  );

  assert.equal(res.statusCode, 403);
  assert.equal(report.donationStatus, "Pledged");
});
