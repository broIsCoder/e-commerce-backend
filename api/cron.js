const User = require('../models/User');
const Product = require('../models/Product');

const handler = async () => {
    try {
        const users = await User.find({ 'orders.orderStatus': 'Pending' }).exec();
        const now = new Date();

        for (const user of users) {
            let updated = false;

            for (const order of user.orders) {
                // Check if the order is pending and if the order date exceeds 1 minute (60000 ms)
                if (order.orderStatus === 'Pending' && now - new Date(order.orderDate) >= 60000) {
                    order.orderStatus = 'Delivered';
                    order.deliveredDate = new Date();

                    for (const product of order.items) {
                        const foundItem = await Product.findById(product.productId).exec();
                        const newBuyer = foundItem.delieveredBuyers.find(buyer => buyer.userId.equals(user._id));
                        if (!newBuyer) {
                            foundItem.delieveredBuyers.push({ userId: user._id });
                        }
                        foundItem.productTotalRevenue += product.quantity * product.price;
                        foundItem.productQuantitySold += product.quantity;
                        await foundItem.save();
                    }
                    updated = true;
                }
            }

            if (updated) {
                await user.save();
                console.log("Cron job: Order has been delivered");
            }
        }
    } catch (error) {
        console.error(`Cron job error: ${error.message}`);
    }
};
module.exports = handler;
