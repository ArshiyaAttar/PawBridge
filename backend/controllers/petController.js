import Pet from "../models/Pet.js";

export const getPets = async (req, res) => {
  try {
    const { search, species, category, location, status } = req.query;
    const filter = {
      isActive: true,
      $and: [
        {
          $or: [
            { listingApprovalStatus: "Approved" },
            { listingApprovalStatus: { $exists: false } },
          ],
        },
      ],
    };

    if (species) filter.species = species;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (status) filter.status = status;

    if (search) {
      filter.$and.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { breed: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      });
    }

    const pets = await Pet.find(filter)
      .populate("shelter", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: pets.length, pets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch pets" });
  }
};

export const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      isActive: true,
      $or: [
        { listingApprovalStatus: "Approved" },
        { listingApprovalStatus: { $exists: false } },
      ],
    })
      .populate("shelter", "name email phone");

    if (!pet) return res.status(404).json({ success: false, message: "Pet not found" });

    res.json({ success: true, pet });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid pet ID" });
  }
};

export const getMyPetById = async (req, res) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .select("+listingContactPhone")
      .populate("shelter", "name email phone");

    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    if (
      req.user.role !== "admin" &&
      pet.shelter._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this pet listing",
      });
    }

    return res.json({ success: true, pet });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid pet ID" });
  }
};

export const createPet = async (req, res) => {
  try {
    const {
      name,
      species,
      age,
      description,
      location,
      listingContactPhone,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Upload a pet photo to create a listing",
      });
    }

    if (
      !name ||
      !species ||
      age === undefined ||
      !description ||
      !location ||
      typeof listingContactPhone !== "string" ||
      !/^[+]?[\d\s()-]{7,20}$/.test(listingContactPhone.trim())
    ) {
      return res.status(400).json({ success: false, message: "Required pet details are missing" });
    }

    const pet = await Pet.create({
      ...req.body,
      image: "",
      hasPhoto: true,
      photoData: req.file.buffer,
      photoContentType: req.file.mimetype,
      listingApprovalStatus: "Pending",
      listingReviewNotes: "",
      listingReviewedBy: null,
      listingReviewedAt: null,
      shelter: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Pet listing submitted for admin approval",
      pet,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet || !pet.isActive) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    if (pet.shelter.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this pet" });
    }

    if (req.file) {
      pet.image = "";
      pet.hasPhoto = true;
      pet.photoData = req.file.buffer;
      pet.photoContentType = req.file.mimetype;
    }

    if (pet.shelter.toString() === req.user._id.toString()) {
      pet.listingApprovalStatus = "Pending";
      pet.listingReviewNotes = "";
      pet.listingReviewedBy = null;
      pet.listingReviewedAt = null;
    }

    const allowed = [
      "name", "species", "category", "breed", "age", "gender", "description",
      "location", "listingContactPhone", "healthStatus", "vaccinated",
      "status", "adoptionFee"
    ];

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) pet[key] = req.body[key];
    });

    await pet.save();
    res.json({ success: true, message: "Pet updated successfully", pet });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPetPhoto = async (req, res) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      isActive: true,
      hasPhoto: true,
      $or: [
        { listingApprovalStatus: "Approved" },
        { listingApprovalStatus: { $exists: false } },
      ],
    }).select("+photoData +photoContentType");

    if (!pet?.photoData || !pet.photoContentType) {
      return res.status(404).json({
        success: false,
        message: "Pet photo not found",
      });
    }

    res.set("Content-Type", pet.photoContentType);
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    res.set("Cache-Control", "no-cache");
    return res.send(pet.photoData);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid pet ID" });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to fetch pet photo",
    });
  }
};

export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet || !pet.isActive) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    if (pet.shelter.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this pet" });
    }

    pet.isActive = false;
    await pet.save();

    res.json({ success: true, message: "Pet removed successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyPetPhoto = async (req, res) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      isActive: true,
      hasPhoto: true,
    }).select("+photoData +photoContentType");

    if (!pet?.photoData || !pet.photoContentType) {
      return res.status(404).json({
        success: false,
        message: "Pet photo not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      pet.shelter.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this pet photo",
      });
    }

    res.set("Content-Type", pet.photoContentType);
    res.set("Cache-Control", "private, no-store");
    return res.send(pet.photoData);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid pet ID" });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to fetch pet photo",
    });
  }
};


export const getMyPets = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.user.role !== "admin") {
      filter.shelter = req.user._id;
    }

    const pets = await Pet.find(filter)
      .populate("shelter", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pets.length,
      pets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch managed pets",
    });
  }
};
