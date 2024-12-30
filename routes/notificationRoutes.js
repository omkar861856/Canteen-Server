import Router from 'express'
import { vapidKeys } from '../socket/index.js';

const router = Router();
// routes

/**
 * @swagger
 * /api/v1/home:
 *   get:
 *     summary: Home route
 *     description: The home route for v1
 *     responses:
 *       200:
 *         description: Hello World
 */


router.get('/vapi', function (req, res) {
    res.status(200).send({vapiPublicKey: vapidKeys.publicKey})
  })



export default router;