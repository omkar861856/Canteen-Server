import Router from 'express'
import Razorpay from 'razorpay';
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils.js';


const router = Router();

// routes

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * @swagger
 * /api/v1/razorpay/orders:
 *   post:
 *     summary: Create a Razorpay order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalPrice:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Order created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *                   example: "INR"
 *                 receipt:
 *                   type: string
 *                   example: "receipt order no 777"
 *       500:
 *         description: Error creating order.
 */

router.post("/orders", async (req, res) => {
    const { totalPrice } = req.body;
    const generateReceipt = () => `receipt_${Date.now()}`;

    let amount = parseInt(totalPrice, 10) * 100;
    try {

        const options = {
            amount: amount,
            currency: "INR",
            receipt: generateReceipt()
        }

        const order = await instance.orders.create(options)


        if (!order) { return res.status(200).send({ msg: "Something went wrong" }) }

        res.status(200).send(order);

    } catch (error) {
        res.status(200).send({ error, msg: "entered error block" })
    }
})

/**
 * @swagger
 * /api/v1/razorpay/success:
 *   post:
 *     summary: Verify Razorpay payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderCreationId:
 *                 type: string
 *                 example: "order_HVmS9fEfxX9yM9"
 *               razorpayPaymentId:
 *                 type: string
 *                 example: "pay_HVmSxyz12345"
 *               razorpayOrderId:
 *                 type: string
 *                 example: "order_HVmS9fEfxX9yM9"
 *               razorpaySignature:
 *                 type: string
 *                 example: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
 *     responses:
 *       200:
 *         description: Payment verified successfully.
 *       400:
 *         description: Payment verification failed.
 *       500:
 *         description: Error verifying payment.
 */

router.post("/success", async (req, res) => {
    try {

        // getting the details bacfont-end
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        const secret = process.env.RAZORPAY_KEY_SECRET;


        if (!orderCreationId || !razorpayPaymentId || !secret) {
            return res.status(400).json({ error: 'Missing required fields for HMAC generation' });
        }

        const validate = validatePaymentVerification(
            { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
            razorpaySignature,
            secret
        );

        // comaparing our digest with the actual signature 
        if (!validate) {
            console.log("signature varification failed")
            return res.status(400).json({ msg: "Transaction not legit!" });
        }

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        res.status(200).send({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        })
    } catch (error) {
        res.status(200).send(error)
    }
})

/**
 * @swagger
 * /api/v1/razorpay/payment/{paymentId}:
 *   get:
 *     summary: Fetch payment details by payment ID
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *           example: "pay_HVmSxyz12345"
 *     responses:
 *       200:
 *         description: Payment details fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 entity:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *                 status:
 *                   type: string
 *       500:
 *         description: Error fetching payment details.
 */

router.get('/payment/:paymentId', async (req, res) => {
    try {

        const { paymentId } = req.params;
        const response = await instance.payments.fetch(paymentId)
        res.status(200).send(response)


    } catch (error) {

        res.status(200).send(error)


    }
})


export default router;