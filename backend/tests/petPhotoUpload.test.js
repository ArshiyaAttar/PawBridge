import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Pet from "../models/Pet.js";
import {
  createPet,
  getPets,
  getPetPhoto,
  getMyPetPhoto,
} from "../controllers/petController.js";
import { getImageContentType } from "../middleware/petPhotoUpload.js";
import { reviewPetListing } from "../controllers/adminController.js";

const response = () => ({
  statusCode: 200,
  headers: {},
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
  set(name, value) {
    this.headers[name] = value;
    return this;
  },
  send(body) {
    this.body = body;
    return this;
  },
});

test("validates uploaded photo signatures instead of trusting file extensions", () => {
  assert.equal(
    getImageContentType(
      Buffer.from([0xff, 0xd8, 0xff, 0x00])
    ),
    "image/jpeg"
  );
  assert.equal(
    getImageContentType(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    ),
    "image/png"
  );
  assert.equal(getImageContentType(Buffer.from("not an image")), null);
});

test("pet listing requires and stores an uploaded photo", async (t) => {
  const photoBuffer = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
  const create = t.mock.method(Pet, "create", async (pet) => ({
    ...pet,
    _id: "pet-1",
  }));
  const res = response();

  await createPet(
    {
      body: {
        name: "Milo",
        species: "Cat",
        age: "2",
        description: "A friendly cat looking for a family.",
        location: "Solapur",
        listingContactPhone: "1234567890",
      },
      file: { buffer: photoBuffer, mimetype: "image/jpeg" },
      user: { _id: "shelter-1" },
    },
    res
  );

  assert.equal(res.statusCode, 201);
  assert.equal(create.mock.callCount(), 1);
  assert.equal(create.mock.calls[0].arguments[0].hasPhoto, true);
  assert.equal(
    create.mock.calls[0].arguments[0].listingApprovalStatus,
    "Pending"
  );
  assert.equal(create.mock.calls[0].arguments[0].photoContentType, "image/jpeg");
  assert.deepEqual(create.mock.calls[0].arguments[0].photoData, photoBuffer);
});

test("public pet browsing excludes listings awaiting admin review", async (t) => {
  let query;
  t.mock.method(Pet, "find", (filter) => {
    query = filter;
    return {
      populate() {
        return this;
      },
      sort: async () => [],
    };
  });
  const res = response();

  await getPets({ query: { search: "Milo" } }, res);

  assert.equal(res.statusCode, 200);
  assert.ok(query.$and.some((clause) =>
    clause.$or?.some((condition) => condition.listingApprovalStatus === "Approved")
  ));
  assert.ok(query.$and.some((clause) =>
    clause.$or?.some((condition) => condition.name)
  ));
});

test("admin approval publishes only a currently pending pet listing", async (t) => {
  let update;
  const pet = { _id: "pet-1", listingApprovalStatus: "Approved" };
  t.mock.method(Pet, "findOneAndUpdate", (filter, changes) => {
    update = { filter, changes };
    return {
      populate: async () => pet,
    };
  });
  const res = response();

  await reviewPetListing(
    {
      params: { id: "pet-1" },
      body: { status: "Approved", notes: "Contact checked." },
      user: { _id: "admin-1" },
    },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(update.filter.listingApprovalStatus, "Pending");
  assert.equal(update.changes.$set.listingApprovalStatus, "Approved");
  assert.equal(update.changes.$set.listingReviewNotes, "Contact checked.");
  assert.equal(update.changes.$set.listingReviewedBy, "admin-1");
});

test("pet JSON does not expose stored photo bytes", () => {
  const pet = new Pet({
    name: "Milo",
    species: "Cat",
    age: 2,
    description: "A friendly cat looking for a family.",
    location: "Solapur",
    listingContactPhone: "1234567890",
    shelter: new mongoose.Types.ObjectId(),
    hasPhoto: true,
    photoData: Buffer.from([0xff, 0xd8, 0xff]),
    photoContentType: "image/jpeg",
  });

  const json = pet.toJSON();
  assert.equal(json.hasPhoto, true);
  assert.equal(json.photoData, undefined);
  assert.equal(json.photoContentType, undefined);
});

test("pet listing rejects requests without an uploaded photo", async (t) => {
  const create = t.mock.method(Pet, "create", async () => ({}));
  const res = response();

  await createPet(
    {
      body: {
        name: "Milo",
        species: "Cat",
        age: "2",
        description: "A friendly cat looking for a family.",
        location: "Solapur",
      },
      user: { _id: "shelter-1" },
    },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.equal(create.mock.callCount(), 0);
});

test("photo endpoint serves stored bytes using the verified media type", async (t) => {
  const photoBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const pet = {
    photoData: photoBuffer,
    photoContentType: "image/png",
  };
  const select = t.mock.fn(async () => pet);
  t.mock.method(Pet, "findOne", () => ({ select }));
  const res = response();

  await getPetPhoto({ params: { id: "pet-1" } }, res);

  assert.deepEqual(res.body, photoBuffer);
  assert.equal(res.headers["Content-Type"], "image/png");
  assert.equal(res.headers["Cross-Origin-Resource-Policy"], "cross-origin");
  assert.equal(res.headers["Cache-Control"], "no-cache");
  assert.equal(select.mock.calls[0].arguments[0], "+photoData +photoContentType");
});

test("owner photo endpoint serves a pending listing photo to its shelter", async (t) => {
  const photoBuffer = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
  const pet = {
    shelter: { toString: () => "shelter-1" },
    photoData: photoBuffer,
    photoContentType: "image/jpeg",
  };
  const select = t.mock.fn(async () => pet);
  t.mock.method(Pet, "findOne", () => ({ select }));
  const res = response();

  await getMyPetPhoto(
    {
      params: { id: "pet-1" },
      user: { _id: "shelter-1", role: "shelter" },
    },
    res
  );

  assert.deepEqual(res.body, photoBuffer);
  assert.equal(res.headers["Content-Type"], "image/jpeg");
  assert.equal(res.headers["Cache-Control"], "private, no-store");
});

test("owner photo endpoint denies other shelters", async (t) => {
  const pet = {
    shelter: { toString: () => "shelter-1" },
    photoData: Buffer.from([0xff, 0xd8, 0xff]),
    photoContentType: "image/jpeg",
  };
  t.mock.method(Pet, "findOne", () => ({ select: async () => pet }));
  const res = response();

  await getMyPetPhoto(
    {
      params: { id: "pet-1" },
      user: { _id: "shelter-2", role: "shelter" },
    },
    res
  );

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, "Not authorized to view this pet photo");
});
