import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import AdoptionApplication from "../models/AdoptionApplication.js";

dotenv.config();

const demoUsers = [
  { key: "admin", name: "PawBridge Admin", email: "admin@pawbridge.demo", role: "admin" },
  { key: "adopter", name: "Demo Adopter", email: "pawbridge.demo.adopter@gmail.com", role: "adopter" },
  { key: "shelter", name: "Hope Paws Shelter", email: "pawbridge.demo.shelter@gmail.com", role: "shelter" },
  { key: "rescuer", name: "Demo Rescuer", email: "pawbridge.demo.rescuer@gmail.com", role: "rescuer" },
];

const legacyDemoEmails = {
  adopter: "adopter@pawbridge.demo",
  shelter: "shelter@pawbridge.demo",
  rescuer: "rescuer@pawbridge.demo",
};

const demoPets = [
  { key: "luna", name: "Luna", species: "Dog", category: "Adult Dog", breed: "Indie mix", age: 2, gender: "Female", location: "Pune", healthStatus: "Healthy and playful", vaccinated: true, status: "Available", description: "Luna is a gentle, people-loving dog who enjoys walks and cuddles.", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700" },
  { key: "milo", name: "Milo", species: "Cat", category: "Kitten", breed: "Domestic shorthair", age: 1, gender: "Male", location: "Mumbai", healthStatus: "Healthy; neutered", vaccinated: true, status: "Available", description: "Milo is curious, affectionate, and happiest near a sunny window.", image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=700" },
  { key: "coco", name: "Coco", species: "Dog", category: "Adult Dog", breed: "Beagle", age: 4, gender: "Female", location: "Bengaluru", healthStatus: "Healthy; regular checkups", vaccinated: true, status: "Available", description: "Coco is an energetic companion who loves gentle games and patient families.", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=700" },
  { key: "rio", name: "Rio", species: "Bird", category: "Bird", breed: "Indian ringneck", age: 3, gender: "Male", location: "Hyderabad", healthStatus: "Healthy", vaccinated: false, status: "Available", description: "Rio is bright and social, with a cheerful personality and a love for attention.", image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=700" },
  { key: "moti", name: "Moti", species: "Dog", category: "Adult Dog", breed: "Indie mix", age: 3, gender: "Male", location: "Solapur, Maharashtra", healthStatus: "Healthy and active", vaccinated: true, status: "Available", description: "Moti is a friendly local dog who enjoys calm walks and spending time with people.", image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=700" },
  { key: "gauri", name: "Gauri", species: "Cat", category: "Kitten", breed: "Domestic shorthair", age: 1, gender: "Female", location: "Akkalkot, Maharashtra", healthStatus: "Healthy; vet check-up completed", vaccinated: true, status: "Available", description: "Gauri is a curious young cat who likes sunny spots, gentle play, and a quiet home.", image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=700" },
  { key: "bittu", name: "Bittu", species: "Dog", category: "Puppy", breed: "Indie mix", age: 1, gender: "Male", location: "Barshi, Maharashtra", healthStatus: "Healthy and playful", vaccinated: true, status: "Available", description: "Bittu is an affectionate young dog who is learning his routines and enjoys meeting people.", image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=700" },
  { key: "chiku", name: "Chiku", species: "Cat", category: "Adult Cat", breed: "Tabby mix", age: 2, gender: "Female", location: "Pandharpur, Maharashtra", healthStatus: "Healthy; indoor-ready", vaccinated: true, status: "Available", description: "Chiku is a relaxed, people-friendly cat who would suit a patient indoor family.", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=700" },
  { key: "bruno", name: "Bruno", species: "Dog", category: "Adult Dog", breed: "Labrador mix", age: 5, gender: "Male", location: "Nashik", healthStatus: "Healthy; calm temperament", vaccinated: true, status: "Pending", description: "Bruno is a loyal, easygoing dog currently meeting a prospective family.", image: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?w=700" },
  { key: "pepper", name: "Pepper", species: "Cat", category: "Adult Cat", breed: "Tuxedo mix", age: 2, gender: "Female", location: "Pune", healthStatus: "Healthy; indoor-ready", vaccinated: true, status: "Adopted", description: "Pepper is a quiet, affectionate cat who has found her forever home.", image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=700" },
  { key: "buddy", name: "Buddy", species: "Dog", category: "Puppy", breed: "Indie puppy", age: 0, gender: "Male", location: "Delhi", healthStatus: "Growing well; first vaccinations complete", vaccinated: true, status: "Available", description: "Buddy is a playful puppy who needs patient training and daily enrichment.", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=700" },
  { key: "simba", name: "Simba", species: "Cat", category: "Adult Cat", breed: "Orange tabby", age: 6, gender: "Male", location: "Chennai", healthStatus: "Healthy; prefers a quiet home", vaccinated: true, status: "Available", description: "Simba is a calm lap cat who warms up slowly and rewards patient adopters with affection.", image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=700" },
  { key: "daisy", name: "Daisy", species: "Dog", category: "Senior", breed: "Indie mix", age: 9, gender: "Female", location: "Jaipur", healthStatus: "Stable; joint-support diet", vaccinated: true, status: "Available", description: "Daisy is a gentle senior with a calm nature who would thrive in a peaceful home.", image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=700" },
  { key: "kiwi", name: "Kiwi", species: "Other", category: "Special Care", breed: "Rabbit", age: 2, gender: "Female", location: "Kolkata", healthStatus: "Healthy; indoor enclosure required", vaccinated: false, status: "Available", description: "Kiwi is a soft-natured rabbit who enjoys leafy treats and a secure indoor enclosure.", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=700" },
  { key: "zoro", name: "Zoro", species: "Dog", category: "Special Care", breed: "Three-legged indie", age: 3, gender: "Male", location: "Ahmedabad", healthStatus: "Healthy; mobility adapted", vaccinated: true, status: "Available", description: "Zoro is resilient, affectionate, and ready for a family that celebrates his unique journey.", image: "https://images.unsplash.com/photo-1554692918-08fa0fdc9db3?w=700" },
  { key: "sky", name: "Sky", species: "Bird", category: "Bird", breed: "Cockatiel", age: 2, gender: "Female", location: "Goa", healthStatus: "Healthy; social and active", vaccinated: false, status: "Available", description: "Sky is a friendly cockatiel who loves music, gentle attention, and a roomy safe habitat.", image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=700" },
];

const requireDemoConfig = () => {
  if (!process.env.MONGODB_URI || !process.env.DEMO_PASSWORD) {
    throw new Error("MONGODB_URI and DEMO_PASSWORD are required.");
  }
  if (process.env.DEMO_PASSWORD.length < 12) {
    throw new Error("DEMO_PASSWORD must contain at least 12 characters.");
  }
  if (process.env.NODE_ENV === "production" || process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error("Demo seeding is blocked unless ALLOW_DEMO_SEED=true and NODE_ENV is not production.");
  }
};

const getOrCreateUser = async ({ key, name, email, role }) => {
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    if (existing.role !== role || existing.name !== name) {
      throw new Error(`Demo email ${normalizedEmail} already belongs to a different account.`);
    }
    return existing;
  }

  const legacyEmail = legacyDemoEmails[key];
  if (legacyEmail) {
    const legacyUser = await User.findOne({ email: legacyEmail });
    if (legacyUser) {
      if (legacyUser.role !== role) {
        throw new Error(`Legacy demo account ${legacyEmail} has an unexpected role.`);
      }
      legacyUser.email = normalizedEmail;
      await legacyUser.save();
      return legacyUser;
    }
  }

  const password = await bcrypt.hash(process.env.DEMO_PASSWORD, 12);
  return User.create({ name, email: normalizedEmail, password, role, isActive: true });
};

const getOrCreatePet = async (pet, shelterId) => {
  const existing = await Pet.findOne({ demoKey: `demo-${pet.key}` });
  if (existing) {
    const updates = {};
    if (!existing.image && pet.image) updates.image = pet.image;
    if (!existing.category) updates.category = pet.category;
    if (!existing.listingContactPhone) updates.listingContactPhone = "555-0100";
    if (!existing.listingApprovalStatus) {
      updates.listingApprovalStatus = "Approved";
    }
    if (Object.keys(updates).length) {
      Object.assign(existing, updates);
      await existing.save();
    }
    return existing;
  }

  return Pet.create({
    ...pet,
    listingContactPhone: "555-0100",
    listingApprovalStatus: "Approved",
    demoKey: `demo-${pet.key}`,
    shelter: shelterId,
    isActive: true,
  });
};

const createApplicationIfMissing = async ({ pet, applicant, reviewer, status, reason, shelterNotes }) => {
  const existing = await AdoptionApplication.findOne({ pet: pet._id, applicant: applicant._id });
  if (existing) return existing;

  return AdoptionApplication.create({
    pet: pet._id,
    applicant: applicant._id,
    status,
    reason,
    experience: "I have cared for companion animals and can provide daily exercise and veterinary care.",
    livingSituation: "A safe home with time, space, and a plan for responsible long-term care.",
    shelterNotes,
    reviewedBy: status === "Pending" ? null : reviewer._id,
    reviewedAt: status === "Pending" ? null : new Date(),
  });
};

const seedDemo = async () => {
  try {
    requireDemoConfig();
    await mongoose.connect(process.env.MONGODB_URI);

    const users = {};
    for (const user of demoUsers) users[user.key] = await getOrCreateUser(user);

    const pets = {};
    for (const pet of demoPets) pets[pet.key] = await getOrCreatePet(pet, users.shelter._id);

    await createApplicationIfMissing({
      pet: pets.bruno,
      applicant: users.adopter,
      reviewer: users.shelter,
      status: "Pending",
      reason: "Bruno looks like a wonderful match for my active household.",
      shelterNotes: "Awaiting initial review.",
    });
    await createApplicationIfMissing({
      pet: pets.pepper,
      applicant: users.adopter,
      reviewer: users.shelter,
      status: "Approved",
      reason: "I can provide Pepper with a calm indoor home and consistent care.",
      shelterNotes: "Approved for demonstration history.",
    });
    await createApplicationIfMissing({
      pet: pets.luna,
      applicant: users.adopter,
      reviewer: users.shelter,
      status: "Rejected",
      reason: "I would love to learn more about Luna and her daily routine.",
      shelterNotes: "Another applicant was a closer fit for this pet.",
    });

    console.log(`Demo seed complete: ${demoUsers.length} users, ${demoPets.length} pets, and 3 applications are available.`);
  } catch (error) {
    console.error("Demo seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDemo();
