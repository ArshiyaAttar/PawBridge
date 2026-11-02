import mongoose from "mongoose";
import AdoptionApplication from "../models/AdoptionApplication.js";
import Pet from "../models/Pet.js";
import {
  buildSubmissionEmail,
  buildSubmitterConfirmationEmail,
  buildAdoptionStatusEmail,
} from "../services/emailTemplates.js";
import { sendEmailNotifications } from "../services/emailService.js";

export const applyForAdoption = async (req, res) => {
  try {
    const { reason, experience, livingSituation } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ success: false, message: "Please provide an adoption reason of at least 10 characters" });
    }

    const pet = await Pet.findById(req.params.petId);

    if (!pet || !pet.isActive || pet.status !== "Available") {
      return res.status(404).json({ success: false, message: "Pet is not available for adoption" });
    }

    const application = await AdoptionApplication.create({
      pet: pet._id,
      applicant: req.user._id,
      reason,
      experience,
      livingSituation
    });

    const applicationDetails = [
      { label: "Applicant", value: req.user.name },
      { label: "Applicant email", value: req.user.email },
      { label: "Pet", value: `${pet.name} (${pet.species})` },
      { label: "Application ID", value: application._id },
      { label: "Reason", value: reason },
      { label: "Previous experience", value: experience || "Not provided" },
      { label: "Living situation", value: livingSituation || "Not provided" },
    ];
    const adminEmail = buildSubmissionEmail({
      kind: "adoption",
      details: applicationDetails,
    });
    const confirmationEmail = buildSubmitterConfirmationEmail({
      kind: "adoption",
      name: req.user.name,
      details: [
        { label: "Pet", value: pet.name },
        { label: "Application ID", value: application._id },
      ],
    });
    const emailResults = await sendEmailNotifications([
      {
        eventKey: `adoption-submitted:${application._id}`,
        type: "admin_submission",
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: `New adoption application for ${pet.name}`,
        ...adminEmail,
      },
      {
        eventKey: `adoption-submitted:${application._id}`,
        type: "submitter_confirmation",
        to: req.user.email,
        subject: `We received your application for ${pet.name}`,
        ...confirmationEmail,
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Adoption application submitted",
      emailNotificationSent: emailResults.allSent,
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "You have already applied for this pet" });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await AdoptionApplication.find({ applicant: req.user._id })
      .populate("pet")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch applications" });
  }
};

export const getShelterApplications = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : null;

    let applications;

    if (filter) {
      applications = await AdoptionApplication.find()
        .populate("pet")
        .populate("applicant", "name email phone")
        .sort({ createdAt: -1 });
    } else {
      const pets = await Pet.find({ shelter: req.user._id }).select("_id");
      applications = await AdoptionApplication.find({
        pet: { $in: pets.map((pet) => pet._id) }
      })
        .populate("pet")
        .populate("applicant", "name email phone")
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch applications" });
  }
};

export const reviewApplication = async (req, res) => {
  const session = await mongoose.startSession();
  let autoRejectedApplications = [];

  try {
    const { status, shelterNotes } = req.body;

    const allowedStatuses = ["Under Review", "Approved", "Rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    await session.withTransaction(async () => {
      autoRejectedApplications = [];
      const application = await AdoptionApplication.findById(
        req.params.id
      )
        .populate("pet")
        .session(session);

      if (!application) {
        const error = new Error("Application not found");
        error.statusCode = 404;
        throw error;
      }

      if (!application.pet) {
        const error = new Error("Associated pet not found");
        error.statusCode = 404;
        throw error;
      }

      if (
        req.user.role !== "admin" &&
        application.pet.shelter.toString() !== req.user._id.toString()
      ) {
        const error = new Error(
          "Not authorized to review this application"
        );
        error.statusCode = 403;
        throw error;
      }

      if (
        application.status === "Approved" ||
        application.status === "Rejected"
      ) {
        const error = new Error(
          "This application has already been finalized"
        );
        error.statusCode = 409;
        throw error;
      }

      if (status === "Approved") {
        const updatedPet = await Pet.findOneAndUpdate(
          {
            _id: application.pet._id,
            status: "Available",
            isActive: true,
          },
          {
            $set: { status: "Adopted" },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedPet) {
          const error = new Error(
            "Pet is no longer available for adoption"
          );
          error.statusCode = 409;
          throw error;
        }

        const otherApplications = await AdoptionApplication.find({
          pet: application.pet._id,
          _id: { $ne: application._id },
          status: { $in: ["Pending", "Under Review"] },
        })
          .select("_id applicant pet")
          .populate("pet", "name species")
          .populate("applicant", "name email")
          .session(session);
        autoRejectedApplications = otherApplications;

        await AdoptionApplication.updateMany(
          {
            pet: application.pet._id,
            _id: { $ne: application._id },
            status: { $in: ["Pending", "Under Review"] },
          },
          {
            $set: {
              status: "Rejected",
              shelterNotes: "Pet adopted through another application.",
              reviewedBy: req.user._id,
              reviewedAt: new Date(),
            },
          },
          { session }
        );
      }

      application.status = status;
      application.shelterNotes = shelterNotes ?? "";
      application.reviewedBy = req.user._id;
      application.reviewedAt = new Date();

      await application.save({ session });
    });

    const updatedApplication = await AdoptionApplication.findById(
      req.params.id
    )
      .populate("pet")
      .populate("applicant", "name email phone");

    const notificationRequests = [];
    if (["Approved", "Rejected"].includes(status)) {
      const applicant = updatedApplication?.applicant;
      const pet = updatedApplication?.pet;
      if (applicant?.email && pet) {
        notificationRequests.push({
          eventKey: `adoption-status:${updatedApplication._id}:${status}`,
          type: "adoption_status",
          to: applicant.email,
          subject: `Your application for ${pet.name} was ${status.toLowerCase()}`,
          ...buildAdoptionStatusEmail({
            name: applicant.name,
            petName: pet.name,
            status,
          }),
        });
      }
    }

    if (autoRejectedApplications.length > 0) {
      for (const application of autoRejectedApplications) {
        if (!application.applicant?.email || !application.pet) continue;

        notificationRequests.push({
          eventKey: `adoption-status:${application._id}:Rejected`,
          type: "adoption_status",
          to: application.applicant.email,
          subject: `Your application for ${application.pet.name} was rejected`,
          ...buildAdoptionStatusEmail({
            name: application.applicant.name,
            petName: application.pet.name,
            status: "Rejected",
          }),
        });
      }
    }

    const emailResults = notificationRequests.length
      ? await sendEmailNotifications(notificationRequests)
      : { allSent: true };

    res.status(200).json({
      success: true,
      message: "Application reviewed successfully",
      emailNotificationSent: emailResults.allSent,
      application: updatedApplication,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Unable to review application",
    });
  } finally {
    await session.endSession();
  }
};


export const getApplicationById = async (req, res) => {
  try {
    const application = await AdoptionApplication.findById(req.params.id)
      .populate("pet")
      .populate("applicant", "name email phone");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isApplicant =
      application.applicant &&
      application.applicant._id.toString() === req.user._id.toString();

    const isPetOwner =
      application.pet &&
      application.pet.shelter &&
      application.pet.shelter.toString() === req.user._id.toString();

    if (!isAdmin && !isApplicant && !isPetOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this application",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to fetch application details",
    });
  }
};
