import RescueReport from "../models/RescueReport.js";
import User from "../models/User.js";
import {
  buildSubmissionEmail,
  buildSubmitterConfirmationEmail,
  buildRescueAssignmentEmail,
  buildRescueResolvedEmail,
} from "../services/emailTemplates.js";
import { sendEmailNotifications } from "../services/emailService.js";

export const createRescueReport = async (req, res) => {
  try {
    const { animalType, description, location, contactPhone } = req.body;

    if (
      !animalType ||
      typeof description !== "string" ||
      !location ||
      !contactPhone
    ) {
      return res.status(400).json({ success: false, message: "All required rescue details must be provided" });
    }

    const donationAmount =
      req.body.donationAmount === undefined || req.body.donationAmount === ""
        ? 0
        : Number(req.body.donationAmount);
    if (
      !Number.isSafeInteger(donationAmount) ||
      donationAmount < 0 ||
      donationAmount > 1000000
    ) {
      return res.status(400).json({
        success: false,
        message: "Donation pledge must be a whole amount between ₹0 and ₹1,000,000",
      });
    }

    const report = await RescueReport.create({
      reporter: req.user._id,
      animalType,
      description,
      location,
      contactPhone,
      image: req.body.image || "",
      donationAmount,
      donationStatus: donationAmount > 0 ? "Pledged" : "None",
    });

    const reportDetails = [
      { label: "Reporter", value: req.user.name },
      { label: "Reporter email", value: req.user.email },
      { label: "Animal type", value: animalType },
      { label: "Location", value: location },
      { label: "Contact phone", value: contactPhone },
      { label: "Report ID", value: report._id },
      { label: "Description", value: description },
    ];
    const adminEmail = buildSubmissionEmail({
      kind: "rescue",
      details: reportDetails,
    });
    const confirmationEmail = buildSubmitterConfirmationEmail({
      kind: "rescue",
      name: req.user.name,
      details: [
        { label: "Animal type", value: animalType },
        { label: "Location", value: location },
        { label: "Report ID", value: report._id },
      ],
    });
    const emailResults = await sendEmailNotifications([
      {
        eventKey: `rescue-submitted:${report._id}`,
        type: "admin_submission",
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: `New ${animalType} rescue report`,
        ...adminEmail,
      },
      {
        eventKey: `rescue-submitted:${report._id}`,
        type: "submitter_confirmation",
        to: req.user.email,
        subject: "We received your PawBridge rescue report",
        ...confirmationEmail,
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Rescue report submitted",
      emailNotificationSent: emailResults.allSent,
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

    const previousStatus = report.status;
    const previousAssigneeId = report.assignedRescuer?.toString() || "";
    const { status, rescueNotes, assignedRescuer, donationStatus } = req.body;

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

      if (
        status !== undefined &&
        !["In Progress", "Resolved"].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid rescuer status update",
        });
      }

      if (status !== undefined) report.status = status;

      if (rescueNotes !== undefined) {
        report.rescueNotes = rescueNotes;
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (donationStatus !== undefined) {
      if (donationStatus !== "Collected") {
        return res.status(400).json({
          success: false,
          message: "Invalid donation status update",
        });
      }

      if (report.donationStatus !== "Pledged" || !(report.donationAmount > 0)) {
        return res.status(409).json({
          success: false,
          message: "There is no outstanding donation pledge to collect",
        });
      }

      const collectedAt = new Date();
      const updateResult = await RescueReport.updateOne(
        {
          _id: req.params.id,
          donationStatus: "Pledged",
          donationAmount: { $gt: 0 },
        },
        {
          $set: {
            donationStatus: "Collected",
            donationCollectedAt: collectedAt,
            donationCollectedBy: req.user._id,
          },
        }
      );

      if (updateResult.modifiedCount !== 1) {
        return res.status(409).json({
          success: false,
          message: "The donation pledge is no longer outstanding",
        });
      }

      report.donationStatus = "Collected";
      report.donationCollectedAt = collectedAt;
      report.donationCollectedBy = req.user._id;
    }

    await report.save();

    await report.populate("reporter", "name email phone");
    await report.populate("assignedRescuer", "name email phone");

    const notificationRequests = [];
    const currentAssigneeId = report.assignedRescuer?._id?.toString() || "";
    if (
      currentAssigneeId &&
      currentAssigneeId !== previousAssigneeId &&
      report.assignedRescuer?.email
    ) {
      notificationRequests.push({
        eventKey: `rescue-assigned:${report._id}:${report.updatedAt.toISOString()}`,
        type: "rescue_assignment",
        to: report.assignedRescuer.email,
        subject: "A PawBridge rescue case was assigned to you",
        ...buildRescueAssignmentEmail({
          rescuerName: report.assignedRescuer.name,
          animalType: report.animalType,
          location: report.location,
          reportId: report._id,
        }),
      });
    }

    if (
      previousStatus !== "Resolved" &&
      report.status === "Resolved" &&
      report.reporter?.email
    ) {
      notificationRequests.push({
        eventKey: `rescue-resolved:${report._id}:${report.updatedAt.toISOString()}`,
        type: "rescue_resolution",
        to: report.reporter.email,
        subject: "Your PawBridge rescue report was resolved",
        ...buildRescueResolvedEmail({
          reporterName: report.reporter.name,
          animalType: report.animalType,
          location: report.location,
          reportId: report._id,
        }),
      });
    }

    const emailResults = notificationRequests.length
      ? await sendEmailNotifications(notificationRequests)
      : { allSent: true };

    res.status(200).json({
      success: true,
      message: "Rescue report updated",
      emailNotificationSent: emailResults.allSent,
      report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};