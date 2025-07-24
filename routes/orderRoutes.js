require("dotenv").config();
const express = require("express");
const Order = require("../models/Order");
const Counter = require("../models/Counter");
const router = express.Router();
// Add client api



router.post("/add", async (req, res) => {
  try {
    const {
      customerId,
      item,
      notes,
      deliveryDate,
      price,
      stitchCategory,
      customMeasurements,
    } = req.body;

    if (!customerId || !item || !deliveryDate || !price || !stitchCategory) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Get and increment counter
    const counter = await Counter.findOneAndUpdate(
      { name: "order" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const orderId = `ORD-${String(counter.seq).padStart(3, "0")}`; // e.g., ORD-001

    const newOrder = new Order({
      orderId,
      customerId,
      item,
      notes,
      deliveryDate,
      price,
      stitchCategory,
      customMeasurements,
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Add Order Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


router.get("/get", async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    // ✅ Step 1: Get the client/user
    const client = await Client.findById({u_id:userId});
    console.log(client)
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // ✅ Step 2: Get the orders of that client
    const orders = await Order.find({ customerId: client._id })
      .populate("customerId", "name phone_no")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Orders fetched successfully",
      client: {
        _id: client._id,
        name: client.name,
        phone_no: client.phone_no,
      },
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// GET single order by ID
router.get("/get/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate("customerId"); // fetch order with client detail

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order and client fetched successfully",
      order,
      client: order.customerId, // this contains full client details
    });
  } catch (error) {
    console.error("Get Order Detail Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const {
    customerId,
    item,
    notes,
    deliveryDate,
    price,
    orderStatus,
    stitchCategory,
    customMeasurements
  } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update fields
    order.customerId = customerId || order.customerId;
    order.item = item || order.item;
    order.notes = notes || order.notes;
    order.deliveryDate = deliveryDate || order.deliveryDate;
    order.price = price || order.price;
    order.orderStatus = orderStatus || order.orderStatus;
    order.stitchCategory = stitchCategory || order.stitchCategory;
    order.customMeasurements = customMeasurements || order.customMeasurements;

    await order.save();

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Update order status to 'completed'
router.put("/update-status/:id", async (req, res) => {
  const _id = req.params.id;
  console.log("Updating order ID:", _id);

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      _id,
      { orderStatus: "Completed" }, // Correct field name
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated to Completed",
      order: updatedOrder
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
