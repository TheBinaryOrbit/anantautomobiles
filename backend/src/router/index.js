const express = require('express');
const userRouter = require('./userRouter');
const bikeModelRouter = require('./bikeModelRouter');
const bikeRouter = require('./bikeRouter');
const accessoriesRouter = require('./accessoriesRouter');
const customerRouter = require('./customerRouter');
const supplierRouter = require('./supplierRouter');
const salesRouter = require('./salesRouter');
const purchaseRouter = require('./purchaseRouter');
const roleRouter = require('./roleRouter');
const permissionRouter = require('./permissionRouter');
const discountRouter = require('./discountRouter');
const exchangeBikeRouter = require('./exchangeBikeRoutes');
const inquiryRouter = require('./inquiryRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

router.use('/users', userRouter);
router.use('/bike-models', bikeModelRouter);
router.use('/bikes', bikeRouter);
router.use('/accessories', accessoriesRouter);
router.use('/customers', customerRouter);
router.use('/suppliers', supplierRouter);
router.use('/sales', salesRouter);
router.use('/purchases', purchaseRouter);
router.use('/roles', roleRouter);
router.use('/permissions', permissionRouter);
router.use('/discounts', discountRouter);
router.use('/exchange-bikes', exchangeBikeRouter);
router.use('/inquiries', inquiryRouter);

module.exports = router;
