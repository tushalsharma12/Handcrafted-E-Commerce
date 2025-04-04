import Order from "../models/Order.js";

export const order = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { items, totalAmount } = req.body;

        console.log("Incoming Order Data:", items);

        const order = new Order({
            userId,
            items,
            totalAmount,
            paymentStatus: "paid"
        });

        await order.save();
        console.log("New order created:", order);

        res.status(201).json({ 
            success: true, 
            message: "Order placed successfully", 
            order 
        });
    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({ 
            error: "Failed to create order" 
        });
    }
};


export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const orders = await Order.find({ userId })
        .populate('items.productId', 'title price img discount')// Product details fetch karne ke liye
            .sort({ createdAt: -1 })
            .lean();
            const formattedOrders = orders.map(order => ({
                ...order,
                items: order.items.map(item => ({
                    ...item,
                    price: item.productId?.price || item.price,
                    title: item.productId?.title || item.title,
                    img: item.productId?.img || item.img
                }))
            }));
    
            console.log('Formatted orders:', formattedOrders); // Debug log
            res.json(formattedOrders);
    } catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({ 
            error: "Failed to fetch orders" 
        });
    }
};


// ✅ 1. Get all orders (Admin)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
        .populate("items.productId", "title price img discount")  // ✅ Yeh ensure karega ki product ki details aayein
            .populate("userId", "name email profilePicture")  // User details fetch karne ke liye
            .sort({ createdAt: -1 })
            .lean();

            const updatedOrders = orders.map(order => ({
                ...order,
                userId: {
                    ...order.userId,
                    profilePicture: order.userId?.profilePicture
                        ? `http://localhost:5000${order.userId.profilePicture}`
                        : "/backend/uploads/1741196388847-tushal link.jpg"
                }
            }));

            console.log("Orders Fetched:", JSON.stringify(orders, null, 2));
        res.status(200).json(updatedOrders);
    } catch (error) {
        console.error("Get all orders error:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

// ✅ 2. Update Order Status (Admin)
export const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    try {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus }, { new: true });
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({ error: "Failed to update order status" });
    }
};

// ✅ 3. Delete Order (Admin)
export const deleteOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        await Order.findByIdAndDelete(orderId);
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Delete order error:", error);
        res.status(500).json({ error: "Failed to delete order" });
    }
};
