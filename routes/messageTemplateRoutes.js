const express = require("express");
const router = express.Router();
const MessageTemplate = require("../models/MessageTemplate");

// GET all message templates
router.get("/get", async (req, res) => {
  try {
    const templates = await MessageTemplate.find();
    res.json({ templates });
  } catch (error) {
    console.error("Fetch templates error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single template by id (e.g., 'ready')
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const template = await MessageTemplate.findOne({ id });
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json({ template });
  } catch (error) {
    console.error("Fetch template error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE a template by id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, template } = req.body;

  try {
    const updated = await MessageTemplate.findOneAndUpdate(
      { id },
      { name, template },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json({
      message: "Template updated successfully",
      template: updated,
    });
  } catch (error) {
    console.error("Update template error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
