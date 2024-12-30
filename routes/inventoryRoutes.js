import Router from 'express'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import Inventory from '../models/Inventory.js'
import path from 'path';
import { upload } from '../middleware/uploadImageMiddleware.js';
const router = Router();

// Derive the directory name using fileURLToPath and dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @swagger
 * /api/v1/inventory/:
 *   post:
 *     summary: Create a new inventory item
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Pizza"
 *               category:
 *                 type: string
 *                 example: "Food"
 *               price:
 *                 type: number
 *                 example: 9.99
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-28T12:00:00Z"
 *               itemId:
 *                 type: string
 *                 example: "item123"
 *               availability:
 *                 type: string
 *                 example: "true"
 *               preparationTime:
 *                 type: string
 *                 example: "15 minutes"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Item created successfully.
 *       500:
 *         description: Error saving item to the database.
 */
router.post('/', upload.single('image'), async (req, res) => {
    const { name, category, price, createdAt, itemId, availability, preparationTime, kitchenId } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : null;  // Store image path
    const newItem = new Inventory({
      name,
      category,
      price: Number(price),
      image: imagePath,
      createdAt: new Date(createdAt),
      itemId,
      availability: availability === 'true',
      updatedAt: new Date().toISOString(),
      preparationTime,
      kitchenId
    });
  
    try {
      await newItem.save();
      res.status(201).json({ message: 'Item created successfully', newItem });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error saving item to the database' });
    }
  })
  
  /**
 * @swagger
 * /api/v1/inventory/{itemId}:
 *   get:
 *     summary: Get an inventory item and its image
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image of the specified inventory item.
 *       404:
 *         description: Item or image not found.
 *       500:
 *         description: Error serving image.
 */

 router.get('/:itemId', async (req, res) => {
    const { itemId } = req.params;
  
    // Find the item by itemId
    const item = await Inventory.findOne({ itemId });
  
    if (!item || !item.image) {
      return res.status(404).json({ message: 'Item or image not found' });
    }
  
    // Resolve the absolute path to the image
    const imagePath = path.join(__dirname, '..', item.image);  
    // Send the image as a file from the server
    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ message: 'Error serving image' });
      }
    });
  });
  

  /**
 * @swagger
 * /api/v1/inventory/{itemId}:
 *   put:
 *     summary: Update an inventory item
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               availability:
 *                 type: boolean
 *               preparationTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory item updated successfully.
 *       404:
 *         description: Inventory item not found.
 *       500:
 *         description: Error updating inventory item.
 */

    
  // PUT /:itemId
 router.put('/:itemId', async (req, res) => {
    try {
      const { itemId } = req.params;
      const updates = req.body;
  
      const updatedItem = await Inventory.findOneAndUpdate(
        { itemId },
        { ...updates, updatedAt: new Date().toISOString() },
        { new: true }
      );
  
      if (!updatedItem) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
  
      res.status(200).json({ message: 'Inventory item updated successfully', item: updatedItem });
    } catch (error) {
      res.status(500).json({ error: 'Error updating inventory item', details: error.message });
    }
  });
  


  /**
 * @swagger
 * /api/v1/inventory/{itemId}:
 *   delete:
 *     summary: Delete an inventory item
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully.
 *       404:
 *         description: Inventory item not found.
 *       500:
 *         description: Error deleting inventory item.
 */

  
  // DELETE /:itemId
 router.delete('/:itemId', async (req, res) => {
    try {
      const { itemId } = req.params;
  
      const deletedItem = await Inventory.findOneAndDelete({ itemId });
  
      if (!deletedItem) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
  
      res.status(200).json({ message: 'Inventory item deleted successfully', item: deletedItem });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting inventory item', details: error.message });
    }
  });

  /**
 * @swagger
 * /api/v1/inventory/:
 *   get:
 *     summary: Get all inventory items
 *     responses:
 *       200:
 *         description: A list of inventory items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventory'
 *       500:
 *         description: Error fetching inventory items.
 */
  
  // get all inventory items  
  // GET 
  router.post('/kitchen', async (req, res) => {
    const { kitchenId } = req.body;
    console.log("Kitchen id:", kitchenId);
    
    try {
      // Query the database for items matching the kitchenId
      const items = await Inventory.find({ kitchenId });
      console.log("Fetched items:", items);
      
      // Add base URL to image paths so they can be accessed from the frontend
      const updatedItems = items.map(item => ({
        ...item.toObject(),
        imageUrl: `${item.image}`, // Update this as per your base URL
      }));
      
      res.status(200).json(updatedItems);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ error: 'Error fetching inventory items', details: error.message });
    }
  });
   

/**
 * @swagger
 * /api/v1/inventory/{itemId}:
 *   get:
 *     summary: Get a specific inventory item
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item found.
 *       404:
 *         description: Inventory item not found.
 *       500:
 *         description: Error fetching inventory item.
 */
  
  // GET /:itemId  
 router.get('/:itemId', async (req, res) => {
    try {
      const { itemId } = req.params;
  
      const item = await Inventory.findOne({ itemId });
  
      if (!item) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
  
      res.status(200).json({ item });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching inventory item', details: error.message });
    }
  });
  
/**
 * @swagger
 * inventorycomponents:
 *   schemas:
 *     Inventory:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         price:
 *           type: number
 *         image:
 *           type: string
 *           description: URL of the item's image
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         itemId:
 *           type: string
 *         availability:
 *           type: boolean
 *         preparationTime:
 *           type: string
 */



export default router;