require("dotenv").config();
const express = require("express");
const Client = require("../models/Client");
const Order = require("../models/Order");
const User = require("../models/User");
const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("b_name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 1: Get all clients of this user
    const clients = await Client.find({ u_id: userId }).select("_id");
    const clientIds = clients.map((c) => c._id);
    console.log(clientIds);
    // Step 2: Query orders using those client IDs
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayOrders = await Order.countDocuments({
      customerId: { $in: clientIds },
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    //   console.log(totalOrders)
    const completedOrders = await Order.countDocuments({
      customerId: { $in: clientIds },
      orderStatus: "Completed",
    });
    const pendingOrders = await Order.countDocuments({
      customerId: { $in: clientIds },
      orderStatus: { $ne: "Completed" },
    });

    const upcomingDeliveries = await Order.find({
      customerId: { $in: clientIds },
      deliveryDate: { $gte: new Date() },
      orderStatus: { $ne: "Completed" },
    })
      .sort({ deliveryDate: 1 })
      .populate("customerId", "name phone_no")
      .select("item deliveryDate orderStatus customerId");

    const formattedDeliveries = upcomingDeliveries.map((order) => ({
      _id: order._id,
      item: order.item,
      deliveryDate: order.deliveryDate,
      orderStatus: order.orderStatus,
      clientName: order.customerId?.name || "N/A",
    }));

    res.status(200).json({
      businessName: user.b_name,
      todayOrders,
      completedOrders,
      pendingOrders,
      upcomingDeliveries: formattedDeliveries,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/reports
router.get("/reports", async (req, res) => {
  const { startDate, endDate } = req.query;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "startDate and endDate are required" });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Find clients for this user
    const clients = await Client.find({ u_id: userId });
    const clientIds = clients.map((c) => c._id);

    // Find orders belonging to those clients
    const orders = await Order.find({
      customerId: { $in: clientIds },
      createdAt: { $gte: start, $lte: end },
    });
    // Calculate total days (inclusive)
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.orderStatus === "Completed"
    ).length;
    const totalEarnings = orders.reduce((sum, o) => sum + (o.price || 0), 0);
    const averageOrderValue = totalOrders ? totalEarnings / totalOrders : 0;

    // Calculate new/returning clients
    const allClientOrders = await Order.find({
      customerId: { $in: clientIds },
    });

    let newClients = 0;
    let returningClients = 0;

    clientIds.forEach((cid) => {
      const allOrdersForClient = allClientOrders.filter(
        (o) => o.customerId?.toString() === cid?.toString()
      );
    
      if (allOrdersForClient.length === 0) return; // Skip clients with no orders
    
      const firstOrder = allOrdersForClient
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
    
      if (!firstOrder?.createdAt) return; // Skip if createdAt is missing
    
      const orderDate = new Date(firstOrder.createdAt);
      if (orderDate >= start && orderDate <= end) {
        newClients++;
      } else {
        returningClients++;
      }
    });
    

    res.json({
      totalOrders,
      completedOrders,
      totalEarnings,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      newClients,
      returningClients,
      totalDays
    });
  } catch (err) {
    console.error("Error in reports:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
