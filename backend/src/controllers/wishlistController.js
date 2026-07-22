import Wishlist from '../models/Wishlist.js';
import ApiError from '../utils/ApiError.js';

// Get Wishlist
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products.product', 'name slug thumbnail sellingPrice mrp stock status gallery');

    if (!wishlist) {
      wishlist = { products: [] };
    }

    // Filter out null products (deleted)
    const validProducts = wishlist.products
      ? wishlist.products.filter((p) => p.product !== null)
      : [];

    res.json({ success: true, data: validProducts });
  } catch (error) {
    next(error);
  }
};

// Add to Wishlist
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [{ product: productId }],
      });
    } else {
      const exists = wishlist.products.some((p) => p.product.toString() === productId);
      if (exists) {
        return res.json({ success: true, message: 'Product already in wishlist.' });
      }
      wishlist.products.push({ product: productId });
      await wishlist.save();
    }

    res.json({ success: true, message: 'Added to wishlist.' });
  } catch (error) {
    next(error);
  }
};

// Remove from Wishlist
export const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      throw ApiError.notFound('Wishlist not found.');
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.product.toString() !== req.params.productId
    );
    await wishlist.save();

    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (error) {
    next(error);
  }
};
