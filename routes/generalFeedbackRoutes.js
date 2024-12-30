import express from "express";
import GeneralFeedback from "../models/GeneralFeedback.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/generalfeedback/:
 *   post:
 *     summary: Submit a new feedback
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedback:
 *                 type: string
 *                 example: "The service was excellent!"
 *               rating:
 *                 type: integer
 *                 example: 5
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: Feedback submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 feedback:
 *                   $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: All fields are required.
 *       500:
 *         description: Failed to save feedback.
 */

// Create feedback
router.post("/", async (req, res) => {
  const { feedback, rating, fullName, kitchenId, userId } = req.body;

  // Validate input
  if (!feedback || !rating || !fullName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newFeedback = new GeneralFeedback(req.body);
    const savedFeedback = await newFeedback.save();
    res.status(201).json({ message: "Feedback submitted successfully", feedback: savedFeedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});
 

/**
 * @swagger
 * /api/v1/generalfeedback/:
 *   get:
 *     summary: Retrieve all feedbacks
 *     responses:
 *       200:
 *         description: A list of feedbacks.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 *       500:
 *         description: Failed to fetch feedbacks.
 */

// Get all feedbacks
router.get("/", async (req, res) => {
  try {
    const feedbacks = await GeneralFeedback.find();
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
});

/**
 * @swagger
 * /api/v1/generalfeedback/{fullName}:
 *   get:
 *     summary: Retrieve feedback by fullName
 *     parameters:
 *       - in: path
 *         name: fullName
 *         required: true
 *         schema:
 *           type: string
 *           example: "John Doe"
 *     responses:
 *       200:
 *         description: Feedbacks for the specified user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 *       404:
 *         description: No feedback found for this user.
 *       500:
 *         description: Failed to fetch feedback.
 */

// Get feedback by fullName
router.get("/:fullName", async (req, res) => {
  const { fullName } = req.params;

  try {
    const feedbacks = await GeneralFeedback.find({ fullName });
    if (!feedbacks || feedbacks.length === 0) {
      return res.status(404).json({ error: "No feedback found for this user" });
    }

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

/**
 * @swagger
 * generalfeedbackcomponents:
 *   schemas:
 *     Feedback:
 *       type: object
 *       properties:
 *         feedback:
 *           type: string
 *         rating:
 *           type: integer
 *         fullName:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export default router;