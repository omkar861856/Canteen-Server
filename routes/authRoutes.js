import { User } from '../models/User.js';
import { Router } from 'express';
import axios from 'axios'
import jwt from 'jsonwebtoken'

const router = Router();

const fast2sms_auth = process.env.FAST2SMS_AUTH;

const jwt_secret = process.env.JWT_SECRET;


/**
 * @swagger
 * /api/v1/auth/signin/send-otp:
 *   post:
 *     summary: Generate and send OTP for login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: OTP sent successfully.
 *       404:
 *         description: No user found.
 *       403:
 *         description: User already has an active login.
 *       500:
 *         description: Internal server error.
 */

// Generate and send OTP
router.post('/signin/send-otp', async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: 'No user found, kindly signup' });
        }
        if(user.isLoggedIn){
            return res.status(403).send({message:"User already has and active login"})
        }
        if(!user.isRegistered){

           return res.status(409).send({message: "User registeration not complete"})
            
        }
        const token = user.token;
        await jwt.verify(token, jwt_secret, async (err, decoded) => {
            if (err) {
                try {
                    console.error("Verification failed:", err.message);
                    //send otp further
                    const otp = Math.floor(100000 + Math.random() * 900000).toString();
                    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

                    user.otp = otp;
                    user.otpExpiresAt = otpExpiresAt;

                    await axios.get(`https://www.fast2sms.com/dev/bulkV2`, {
                        params: {
                            authorization: fast2sms_auth,
                            route: 'otp',
                            variables_values: otp,
                            flash: 0,
                            numbers: phone,
                        },
                    });
                    await user.save();
                    return res.status(200).json({ message: 'OTP sent successfully!', user });
                } catch (error) {

                    console.log("Error", error)
                    return res.status(500).send('Error during OTP generation or sending:')

                }
            } else {
                // login
                user.isLoggedIn = true;
                await user.save()
                return res.status(200).json({ message: "Valid Token", user })
            }
        });
    } catch (err) {
        console.error('Other error:', err);
        return res.status(500).json({ message: 'Internal server error.', error: err.message });
    }
});


/**
 * @swagger
 * /api/v1/auth/signup/send-otp:
 *   post:
 *     summary: Generate and send OTP for signup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               isKitchen:
 *                 type: boolean
 *               kitchenId:
 *                 type: string
 *               kitchenName:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully.
 *       409:
 *         description: User with this phone number exists.
 *       500:
 *         description: Internal server error.
 */

router.post('/signup/send-otp', async (req, res) => {
    const { firstName, lastName, phone, isKitchen, kitchenId, kitchenName, connectedKitchen } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    let user = await User.findOne({ phone });

    if (user) {
        return res.status(409).send({ message: 'User with this phone number exists, kindly sign in.' });
    }

    // Create a new user with OTP
    user = new User({
        firstName,
        lastName,
        phone,
        otp,
        token: "empty",
        isLoggedIn: false,
        otpExpiresAt,
        isRegistered: false,
        isKitchen, 
        kitchenId, 
        kitchenName,
        isKitchenOnline: false,
        connectedKitchen
    });

    await user.save();

    try {
        await axios.get(`https://www.fast2sms.com/dev/bulkV2?authorization=${fast2sms_auth}&route=otp&variables_values=${otp}&flash=0&numbers=${phone}&schedule_time=`)
        res.status(200).send('OTP sent successfully!');
    } catch (err) {
        res.status(500).send('Failed to send OTP.');
    }
})

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and complete user login or registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: User verified successfully.
 *       400:
 *         description: Invalid or expired OTP.
 *       500:
 *         description: Internal server error.
 */

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });

    if (!user || user.otp !== otp || new Date() > user.otpExpiresAt) {
        return res.status(400).send('Invalid or expired OTP');
    }

    try {
        // Generate JWT
        const token = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '1d' });
        user.token = token;
        if(!user.isRegistered){
            user.isRegistered = true;
        }
        if(user.isRegistered){
            user.isLoggedIn = true;
        }
        await user.save()
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).send({ message: "Something went wrong at the server" })
    }
});


/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: User logged out successfully.
 *       500:
 *         description: Internal server error.
 */

router.post("/logout", async (req, res) => {
    const { phone } = req.body;
    const user = await User.findOne({ phone })
    try {

        user.isLoggedIn = false;
        await user.save()
        res.status(200).send({ message: "User logged out successfully" })

    } catch (error) {

        res.status(500).send({ message: "Server side error" })

    }
})


/**
 * @swagger
 * /api/v1/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *     responses:
 *       201:
 *         description: New OTP sent.
 *       500:
 *         description: Internal server error.
 */

router.post('/resend-otp', async (req, res) => {

    const { phone } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    let user = await User.findOne({ phone });

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save()
    res.status(201).send({ message: "New otp sent", otp })

})


/**
 * @swagger
 * /api/v1/auth/user:
 *   get:
 *     summary: Get user information from JWT
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: Bearer <JWT token>
 *     responses:
 *       200:
 *         description: User information retrieved successfully.
 *       401:
 *         description: Unauthorized or invalid token.
 */

// Get user info
router.get('/user', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const jwt_secret = process.env.JWT_SECRET;
    if (!token) return res.status(401).send('Unauthorized');

    try {
        const decoded = jwt.verify(token, jwt_secret);
        res.json({ phone: decoded.phone });
    } catch {
        res.status(401).send('Invalid token');
    }
});

/**
 * @swagger
 * /api/v1/auth/update-kitchen-status:
 *   post:
 *     summary: Update the status of the kitchen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               kitchenId:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Kitchen status updated successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

// set kitchen status 
router.post('/update-kitchen-status', async (req,res)=>{
    try {
        const {kitchenId, status} = req.body;
        const user = await User.findOne({ kitchenId });
        if(!user){
            return res.status(404).send({message:"User not found"})
        }
        user.isKitchenOnline = status
        await user.save()
        res.status(200).send({message: "Kitchen status updated", status: user.isKitchenOnline})
    } catch (error) {
        res.status(500).send({message: "Internal server error"}) 
    }
})

/**
 * @swagger
 * /api/v1/auth/kitchen-status/{kitchenId}:
 *   get:
 *     summary: Get the status of a specific kitchen
 *     parameters:
 *       - in: path
 *         name: kitchenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kitchen status retrieved successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

// get kitchen status 

router.get("/kitchen-status/:kitchenId", async (req,res)=>{
    try {
        const {kitchenId} = req.params;
        const user = await User.findOne({ kitchenId });
        if(!user){
            return res.status(404).send({message:"User not found"})
        }
        res.status(200).send({message: "Kitchen status updated", status: user.isKitchenOnline, kitchenNumber: user.phone, kitchenName: user.kitchenName})
    } catch (error) {
        res.status(500).send({message: "Internal server error"})  
    }
})


export default router;