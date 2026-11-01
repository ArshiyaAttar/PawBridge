import Pet from "../models/Pet.js";
import ShelterMessage from "../models/ShelterMessage.js";
import { validateMessageBody } from "../utils/messageValidation.js";

const sameId = (left, right) => left?.toString() === right?.toString();

const canAccessConversation = (user, pet) =>
  user.role === "admin" || sameId(user._id, pet.shelter);

export const getPetConversation = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.petId, isActive: true }).select(
      "shelter"
    );

    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    const messages = await ShelterMessage.find({
      pet: pet._id,
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id },
      ],
    })
      .populate("sender", "name role")
      .populate("recipient", "name role")
      .sort({ createdAt: 1 });

    const hasMessages = messages.length > 0;
    if (!hasMessages && !canAccessConversation(req.user, pet)) {
      return res.json({ success: true, messages: [] });
    }

    const unreadIds = messages
      .filter(
        (message) =>
          sameId(message.recipient?._id, req.user._id) && !message.readAt
      )
      .map((message) => message._id);

    if (unreadIds.length) {
      await ShelterMessage.updateMany(
        { _id: { $in: unreadIds } },
        { $set: { readAt: new Date() } }
      );
    }

    return res.json({ success: true, messages });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid pet ID" });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to load shelter conversation",
    });
  }
};

export const sendPetMessage = async (req, res) => {
  try {
    const { body } = req.body;
    const validationError = validateMessageBody(body);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const pet = await Pet.findOne({ _id: req.params.petId, isActive: true }).select(
      "shelter status"
    );

    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    if (pet.status === "Adopted") {
      return res.status(409).json({
        success: false,
        message: "This pet is no longer accepting adoption questions",
      });
    }

    if (sameId(req.user._id, pet.shelter)) {
      return res.status(400).json({
        success: false,
        message: "Shelter staff cannot message themselves",
      });
    }

    const message = await ShelterMessage.create({
      pet: pet._id,
      sender: req.user._id,
      recipient: pet.shelter,
      body: body.trim(),
    });

    await message.populate("sender", "name role");
    await message.populate("recipient", "name role");

    return res.status(201).json({
      success: true,
      message: "Message sent to the shelter",
      conversationMessage: message,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid pet ID" });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to send message",
    });
  }
};
