import express from 'express';
import controller from '../controllers/pools';
const router = express.Router();

router.get('/pools/:amount', controller.getPrice);


export = router;