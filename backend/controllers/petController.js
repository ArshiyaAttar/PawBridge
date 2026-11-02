import Pet from "../models/Pet.js";

export const getPets = async (req, res) => {
  try {
    const { search, species, category, location, status } = req.query;
    const filter = { isActive: true };

    if (species) filter.species = species;
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { breed: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
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
    const pet = await Pet.findOne({ _id: req.params.id, isActive: true })
      .populate("shelter", "name email phone");

    if (!pet) return res.status(404).json({ success: false, message: "Pet not found" });

    res.json({ success: true, pet });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid pet ID" });
  }
};

export const createPet = async (req, res) => {
  try {
    const { name, species, age, description, location } = req.body;

    if (!name || !species || age === undefined || !description || !location) {
      return res.status(400).json({ success: false, message: "Required pet details are missing" });
    }

    const pet = await Pet.create({
      ...req.body,
      shelter: req.user._id
    });

    res.status(201).json({ success: true, message: "Pet listed successfully", pet });
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

    const allowed = [
      "name", "species", "category", "breed", "age", "gender", "description",
      "image", "location", "healthStatus", "vaccinated", "status"
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
