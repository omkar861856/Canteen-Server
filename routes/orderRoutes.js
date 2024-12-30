import Router from 'express'
import Order from '../models/Order.js'

const router = Router();


// routes

/**
 * @swagger
 * /api/v1/orders/:
 *   post:
 *     summary: Create a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               totalAmount:
 *                 type: number
 *               userPhoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *               status:
 *                 type: string
 *                 example: "Pending"
 *     responses:
 *       201:
 *         description: Order created successfully.
 *       400:
 *         description: Bad request.
 */

// Create Order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    const orders = await Order.find();

    res.status(201).json({ message: "Order created successfully", orders });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
* @swagger
* /api/v1/orders/{id}:
*   put:
*     summary: Update an order's status
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*           example: "order123"
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               status:
*                 type: string
*                 example: "Completed"
*     responses:
*       200:
*         description: Order updated successfully.
*       404:
*         description: Order not found.
*       400:
*         description: Bad request.
*/

// Update Order for Completion or Cancellation
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Expected status: 'Completed' or 'Cancelled'


  try {
    const order = await Order.findOneAndUpdate(
      { orderId: id },      // Search for the document by orderId
      { status, completedAt: new Date().toISOString() },           // Update the status field
      { new: true }         // Return the updated document
    ); if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
* @swagger
* /api/v1/orders/{id}:
*   delete:
*     summary: Delete an order
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*           example: "order123"
*     responses:
*       200:
*         description: Order deleted successfully.
*       404:
*         description: Order not found.
*       400:
*         description: Bad request.
*/

// Delete Order (for Cancellation)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByIdAndDelete(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
* @swagger
* /api/v1/orders/:
*   get:
*     summary: Retrieve all orders
*     responses:
*       200:
*         description: A list of orders.
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Order'
*       400:
*         description: Bad request.
*/

// Get All Orders
router.get('/:kitchenId', async (req, res) => {
  const {kitchenId} = req.params;
  try {
    const orders = await Order.find({kitchenId});
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
* @swagger
* /api/v1/orders/{phone}:
*   get:
*     summary: Retrieve all orders by phone number
*     parameters:
*       - in: path
*         name: phone
*         required: true
*         schema:
*           type: string
*           example: "1234567890"
*     responses:
*       200:
*         description: Orders retrieved successfully.
*       400:
*         description: Bad request.
*/

// Get All Orders by Phone

router.get('/:phone/:kitchenId', async (req, res) => {
  const { phone, kitchenId } = req.params;
  try {
  // Find orders matching both userPhoneNumber and kitchenId
  const orders = await Order.find({
    userPhoneNumber: phone,
    kitchenId: kitchenId,
  });    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
* @swagger
* /api/v1/orders/{id}:
*   get:
*     summary: Retrieve a specific order by ID
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*           example: "order123"
*     responses:
*       200:
*         description: Order retrieved successfully.
*       404:
*         description: Order not found.
*       400:
*         description: Bad request.
*/

// Get Specific Order by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * orderscomponents:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *               quantity:
 *                 type: number
 *         totalAmount:
 *           type: number
 *         userPhoneNumber:
 *           type: string
 *         status:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */



export default router;