require("dotenv").config();
const express = require("express");
const Client = require("../models/Client");
const router = express.Router();
// Add client api

router.post("/add", async (req, res) => {
    console.log(req.session.userId)
    try {
      const { 
            name, 
            email, 
            phone_no, 
            address, 
            note, 
            chest,
            waist,
            hips,
            shoulders,
            armLength,
            totalLength,
            neck,
            inseam
    } = req.body;

      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized: User not logged in" });
      }
      const newClient = new Client({
        u_id:req.session.userId,
        name,
        email,
        phone_no,
        address,
        note,
        measurements: {
            chest: "",
            waist: "",
            hips: "",
            shoulders: "",
            armLength: "",
            totalLength: "",
            neck: "",
            inseam:""
          }
      }
      
    );
  
      await newClient.save();
  
      res.status(201).json({ message: "Client created successfully", client: newClient });
    } catch (error) {
      console.error("Client creation error:", error);
      if (error.code === 11000) {
        return res.status(400).json({ message: "Email already exists" });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // GET all clients for the logged-in user
router.get("/get", async (req, res) => {
    try {
      const userId = req.session.userId;
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const clients = await Client.find({ u_id: userId }).sort({ createdAt: -1 }); // most recent first
  
      res.json({ clients });
    } catch (error) {
      console.error("Fetch clients error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get Singel Client for Edit
  // GET /client/:id
router.get('get/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ client });
  } catch (error) {
    console.error("Fetch client error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
