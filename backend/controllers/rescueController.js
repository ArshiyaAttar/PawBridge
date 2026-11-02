import RescueReport from "../models/RescueReport.js";
import User from "../models/User.js";
import { sendSubmissionNotifications } from "../utils/submissionNotifications.js";

export const createRescueReport = async (req, res) => {
  try {
    const { animalType, description, location, contactPhone } = req.body;

    if (!animalType || !description || !location || !contactPhone) {
      return res.status(400).json({ success: false, message: "All required rescue details must be provided" });
    }

    const report = await RescueReport.create({
      reporter: req.user._id,
      animalType,
      description,
      location,
      contactPhone,
      image: req.body.image || ""
    });

    const emailNotificationSent = await sendSubmissionNotifications({
      adminSubject: `New ${animalType} rescue report`,
      adminText: [
        "A new animal rescue report was submitted on PawBridge.",
        `Reporter: ${req.user.name} (${req.user.email})`,
        `Animal type: ${animalType}`,
        `Location: ${location}`,
        `Contact phone: ${contactPhone}`,
        `Report ID: ${report._id}`,
        `Description: ${description}`,
      ].join("\n"),
      senderSubject: "We received your PawBridge rescue report",
      senderText: [
        `Hello ${req.user.name},`,
        "",
        "We received your animal rescue report.",
        `Report ID: ${report._id}`,
        `Animal type: ${animalType}`,
        `Reported location: ${location}`,
        "You can track updates from your PawBridge account.",
        "",
        "If the animal is in immediate danger, contact local rescue services or emergency authorities directly.",
        "",
        "PawBridge",
      ].join("\n"),
      senderEmail: req.user.email,
    });

    res.status(201).json({
      success: true,
      message: "Rescue report submitted",
      emailNotificationSent,
      report,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRescueReports = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role !== "admin") {
      if (req.user.role === "rescuer") {
        filter.$or = [
          { assignedRescuer: req.user._id },
          { status: "Submitted" }
        ];
      } else {
        filter.reporter = req.user._id;
      }
    }

    const reports = await RescueReport.find(filter)
      .populate("reporter", "name email phone")
      .populate("assignedRescuer", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch rescue reports" });
  }
};

export const updateRescueReport = async (req, res) => {
  try {
    const report = await RescueReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Rescue report not found",
      });
    }

    const { status, rescueNotes, assignedRescuer } = req.body;

    if (req.user.role === "admin") {
      if (assignedRescuer !== undefined) {
        const rescuer = await User.findOne({
          _id: assignedRescuer,
          role: "rescuer",
          isActive: true,
        });

        if (!rescuer) {
          return res.status(400).json({
            success: false,
            message: "Please select an active rescuer account",
          });
        }

        report.assignedRescuer = rescuer._id;

        if (!status) {
          report.status = "Assigned";
        }
      }

      if (status) {
        const allowedStatuses = [
          "Submitted",
          "Assigned",
          "In Progress",
          "Resolved",
          "Rejected",
        ];

        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid rescue report status",
          });
        }

        if (status === "Assigned" && !report.assignedRescuer) {
          return res.status(400).json({
            success: false,
            message: "Assign a rescuer before marking this case as Assigned",
          });
        }

        report.status = status;
      }

      if (rescueNotes !== undefined) {
        report.rescueNotes = rescueNotes;
      }
    } else if (req.user.role === "rescuer") {
      if (
        !report.assignedRescuer ||
        report.assignedRescuer.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "This rescue case is not assigned to you",
        });
      }

      if (!["In Progress", "Resolved"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rescuer status update",
        });
      }

      report.status = status;

      if (rescueNotes !== undefined) {
        report.rescueNotes = rescueNotes;
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await report.save();

    await report.populate("reporter", "name email phone");
    await report.populate("assignedRescuer", "name email phone");

    res.status(200).json({
      success: true,
      message: "Rescue report updated",
      report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};