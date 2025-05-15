const ProductVisibility = require('../models/ProductVisibility');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Get product visibility settings for a provider and country
exports.getProductVisibilitySettings = catchAsync(async (req, res, next) => {
  const { providerId, countryId } = req.query;
  
  if (!providerId && !countryId) {
    return next(new AppError('يجب توفير معرف المزود أو معرف الدولة', 400));
  }
  
  const filter = {};
  if (providerId) filter.providerId = providerId;
  if (countryId) filter.countryId = countryId;
  
  const productVisibility = await ProductVisibility.find(filter);
  
  res.status(200).json({
    status: 'success',
    results: productVisibility.length,
    data: productVisibility
  });
});

// Get visible products for users
exports.getVisibleProducts = catchAsync(async (req, res, next) => {
  const { countryId } = req.query;
  
  if (!countryId) {
    return next(new AppError('يجب توفير معرف الدولة', 400));
  }
  
  const visibleProducts = await ProductVisibility.find({
    countryId,
    isVisible: true
  });
  
  res.status(200).json({
    status: 'success',
    results: visibleProducts.length,
    data: visibleProducts
  });
});

// Create a new product visibility setting
exports.createProductVisibility = catchAsync(async (req, res, next) => {
  const { productId, countryId, providerId, displayPrice, isVisible } = req.body;
  
  if (!productId || !countryId || !providerId) {
    return next(new AppError('جميع الحقول مطلوبة: productId, countryId, providerId', 400));
  }
  
  // Check if there's already a setting for this product
  const existingSetting = await ProductVisibility.findOne({ productId, countryId, providerId });
  
  if (existingSetting) {
    return next(new AppError('يوجد بالفعل إعداد لهذا المنتج', 400));
  }
  
  const newProductVisibility = await ProductVisibility.create({
    productId,
    productName: req.body.productName || '',
    countryId,
    countryName: req.body.countryName || '',
    providerId,
    providerName: req.body.providerName || '',
    originalPrice: req.body.originalPrice || 0,
    displayPrice: displayPrice || 0,
    isVisible: isVisible !== undefined ? isVisible : false,
  });
  
  res.status(201).json({
    status: 'success',
    data: newProductVisibility
  });
});

// Update a product visibility setting
exports.updateProductVisibility = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const productVisibility = await ProductVisibility.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!productVisibility) {
    return next(new AppError('لم يتم العثور على إعداد بهذا المعرف', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: productVisibility
  });
});

// Delete a product visibility setting
exports.deleteProductVisibility = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const productVisibility = await ProductVisibility.findByIdAndDelete(id);
  
  if (!productVisibility) {
    return next(new AppError('لم يتم العثور على إعداد بهذا المعرف', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Bulk update product visibility settings
exports.bulkUpdateProductVisibility = catchAsync(async (req, res, next) => {
  const { products } = req.body;
  
  if (!products || !Array.isArray(products)) {
    return next(new AppError('يجب توفير مصفوفة من المنتجات', 400));
  }
  
  const results = [];
  
  for (const product of products) {
    const { productId, countryId, providerId, displayPrice, isVisible } = product;
    
    if (!productId || !countryId || !providerId) {
      continue; // Skip invalid entries
    }
    
    // Try to find an existing setting
    let productVisibility = await ProductVisibility.findOne({ 
      productId, 
      countryId, 
      providerId 
    });
    
    // If it exists, update it
    if (productVisibility) {
      productVisibility.displayPrice = displayPrice !== undefined ? displayPrice : productVisibility.displayPrice;
      productVisibility.isVisible = isVisible !== undefined ? isVisible : productVisibility.isVisible;
      await productVisibility.save();
    } else {
      // Otherwise create a new one
      productVisibility = await ProductVisibility.create({
        productId,
        countryId,
        providerId,
        displayPrice: displayPrice || 0,
        isVisible: isVisible !== undefined ? isVisible : false
      });
    }
    
    results.push(productVisibility);
  }
  
  res.status(200).json({
    status: 'success',
    results: results.length,
    data: results
  });
});
