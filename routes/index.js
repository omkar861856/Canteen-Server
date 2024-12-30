import { Router } from "express";
import homeRoutes from './homeRoutes.js'
import inventoryRoutes from './inventoryRoutes.js'
import ordersRoutes from './orderRoutes.js'
import paymentsRoutes from './paymentRoutes.js'
import razorpayRoutes from './razorpayRoutes.js'
import generalFeedbackRoutes from './generalFeedbackRoutes.js'
import authRoutes from './authRoutes.js'
import swaggerUiExpress from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import notificationRoutes from './notificationRoutes.js'

const router = Router();

const swaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "Backend API",
        version: "1.0.0",
        description: "API documentation for the backend server",
      },
    },
    apis: ["./routes/*.js"], // Adjust path to your route files
  };

const swaggerDocs = swaggerJsdoc(swaggerOptions);

router.use("/api-docs", swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerDocs));

router.use('/home', homeRoutes);
router.use('/inventory', inventoryRoutes)
router.use('/orders', ordersRoutes)
router.use('/payments', paymentsRoutes)
router.use('/razorpay', razorpayRoutes)
router.use('/generalfeedback', generalFeedbackRoutes)
router.use('/auth', authRoutes)  
router.use('/notifications', notificationRoutes)



export default router;     