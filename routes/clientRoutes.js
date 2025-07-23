require("dotenv").config();
const express = require("express");
const Client = require("../models/Client");
const Order = require("../models/Order");
const router = express.Router();
// Add client api

router.post("/add", async (req, res) => {
  console.log(req.session.userId);
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
      inseam,
    } = req.body;

    if (!req.session || !req.session.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in" });
    }
    const newClient = new Client({
      u_id: req.session.userId,
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
        inseam: "",
      },
    });

    await newClient.save();

    res
      .status(201)
      .json({ message: "Client created successfully", client: newClient });
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

    // For each client, get order count
    const clientsWithOrderCount = await Promise.all(
      clients.map(async (client) => {
        const orderCount = await Order.countDocuments({
          customerId: client._id,
        });
        const activeOrderCount = await Order.countDocuments({
          customerId: client._id,
          orderStatus: { $ne: "Completed" } // not equal to "Completed"
        });
        return {
          ...client.toObject(), // convert Mongoose doc to plain JS object
          totalOrders: orderCount,
          activeOrders: activeOrderCount
        };
      })
    );

    res.json({ clients: clientsWithOrderCount });
  } catch (error) {
    console.error("Fetch clients error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Singel Client for Edit
// GET /client/:id
router.get("/get/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const orderCount = await Order.countDocuments({
      customerId: client._id,
    });

    const activeOrderCount = await Order.countDocuments({
      customerId: client._id,
      orderStatus: { $ne: "Completed" }
    });
     // Sum of all order prices
     const totalOrderPriceAgg = await Order.aggregate([
      { $match: { customerId:client._id } },
      { $group: { _id: null, totalPrice: { $sum: "$price" } } }
    ]);
    const totalOrderPrice = totalOrderPriceAgg[0]?.totalPrice || 0;
    
    const recentOrders = await Order.find({ customerId: client._id })
      .sort({ createdAt: -1 }) // latest first
      .limit(3)
      .select("item createdAt orderStatus price"); // only select needed fields

    res.json({
      client: {
        ...client.toObject(),
        totalOrders: orderCount,
        activeOrders: activeOrderCount,
        totalOrderPrice,
        recentOrders
      }
    });

  } catch (error) {
    console.error("Fetch client error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// PUT: Update client with measurements
router.put("/update/:id", async (req, res) => {
  try {
    const clientId = req.params.id;
    const { name, phone_no, email, address, notes, measurements } = req.body;

    if (!name || !phone_no) {
      return res
        .status(400)
        .json({ message: "Name and phone number are required." });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      {
        name,
        phone_no,
        email,
        address,
        notes,
        measurements,
      },
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found." });
    }

    res.status(200).json({
      message: "Client updated successfully.",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
