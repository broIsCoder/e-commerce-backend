const cron = require('node-cron');
const User = require('../models/User');
const Product = require('../models/Product');

const scheduleDelivery = async () => {
    cron.schedule('* * * * *', async () => { // Runs every minute
        try {
            const users = await User.find({ 'orders.orderStatus': 'Pending' }).exec();
            const now = new Date();

            for (const user of users) {
                let updated = false;

                for (const order of user.orders) {
                    if (order.orderStatus === 'Pending' && now - new Date(order.orderDate) >= 60000) { // 1 minute
                        order.orderStatus = 'Delivered';
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
    });
};

module.exports = scheduleDelivery;
