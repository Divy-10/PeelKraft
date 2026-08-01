import PopupAdvertisement from '../models/PopupAdvertisement.js';
import ApiError from '../utils/ApiError.js';

// Get Active Popup (Client-facing)
// Returns the active popup matching dates and status, sorted by priority (highest first)
export const getActivePopup = async (req, res, next) => {
  try {
    const now = new Date();
    const activePopup = await PopupAdvertisement.findOne({
      status: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ priority: -1, createdAt: -1 })
      .select('-views -clicks -copies -closeCount');

    res.json({
      success: true,
      data: activePopup || null,
    });
  } catch (error) {
    next(error);
  }
};

// Increment counters (Public APIs)
export const incrementView = async (req, res, next) => {
  try {
    const popup = await PopupAdvertisement.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!popup) throw ApiError.notFound('Popup advertisement not found');
    res.json({ success: true, message: 'View count incremented' });
  } catch (error) {
    next(error);
  }
};

export const incrementClick = async (req, res, next) => {
  try {
    const popup = await PopupAdvertisement.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );
    if (!popup) throw ApiError.notFound('Popup advertisement not found');
    res.json({ success: true, message: 'Click count incremented' });
  } catch (error) {
    next(error);
  }
};

export const incrementCopy = async (req, res, next) => {
  try {
    const popup = await PopupAdvertisement.findByIdAndUpdate(
      req.params.id,
      { $inc: { copies: 1 } },
      { new: true }
    );
    if (!popup) throw ApiError.notFound('Popup advertisement not found');
    res.json({ success: true, message: 'Copy count incremented' });
  } catch (error) {
    next(error);
  }
};

export const incrementClose = async (req, res, next) => {
  try {
    const popup = await PopupAdvertisement.findByIdAndUpdate(
      req.params.id,
      { $inc: { closeCount: 1 } },
      { new: true }
    );
    if (!popup) throw ApiError.notFound('Popup advertisement not found');
    res.json({ success: true, message: 'Close count incremented' });
  } catch (error) {
    next(error);
  }
};

// ========== ADMIN CRUD ==========

// Get All Popups with search & filter
export const getAllPopups = async (req, res, next) => {
  try {
    const { keyword, status, offerType, deviceTarget, targetAudience, priority } = req.query;

    const query = {};

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { shortDescription: { $regex: keyword, $options: 'i' } },
        { couponCode: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (status !== undefined && status !== '') {
      query.status = status === 'true';
    }

    if (offerType) {
      query.offerType = offerType;
    }

    if (deviceTarget) {
      query.deviceTarget = deviceTarget;
    }

    if (targetAudience) {
      query.targetAudience = targetAudience;
    }

    if (priority !== undefined && priority !== '') {
      query.priority = parseInt(priority, 10);
    }

    const popups = await PopupAdvertisement.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: popups,
    });
  } catch (error) {
    next(error);
  }
};

// Create Popup
export const createPopup = async (req, res, next) => {
  try {
    const popupData = {
      ...req.body,
      createdBy: req.admin?._id || req.user?._id, // Set by admin authentication middleware (req.admin)
    };

    const popup = await PopupAdvertisement.create(popupData);
    res.status(201).json({
      success: true,
      data: popup,
      message: 'Popup advertisement created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update Popup
export const updatePopup = async (req, res, next) => {
  try {
    const popup = await PopupAdvertisement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!popup) throw ApiError.notFound('Popup advertisement not found');

    res.json({
      success: true,
      data: popup,
      message: 'Popup advertisement updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete Popup
export const deletePopup = async (req, res, next) => {
  try {
    const popup = await PopupAdvertisement.findByIdAndDelete(req.params.id);
    if (!popup) throw ApiError.notFound('Popup advertisement not found');

    res.json({
      success: true,
      message: 'Popup advertisement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Duplicate Popup
export const duplicatePopup = async (req, res, next) => {
  try {
    const popup = await PopupAdvertisement.findById(req.params.id);
    if (!popup) throw ApiError.notFound('Popup advertisement not found');

    const duplicateData = popup.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    
    // Reset stats
    duplicateData.views = 0;
    duplicateData.clicks = 0;
    duplicateData.copies = 0;
    duplicateData.closeCount = 0;
    
    duplicateData.title = `Copy of ${duplicateData.title}`;
    duplicateData.status = false; // Duplicated is disabled by default
    duplicateData.createdBy = req.admin?._id || req.user?._id;

    const duplicatedPopup = await PopupAdvertisement.create(duplicateData);
    res.status(201).json({
      success: true,
      data: duplicatedPopup,
      message: 'Popup advertisement duplicated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Toggle Popup Status
export const toggleStatus = async (req, res, next) => {
  try {
    const popup = await PopupAdvertisement.findById(req.params.id);
    if (!popup) throw ApiError.notFound('Popup advertisement not found');

    popup.status = !popup.status;
    await popup.save();

    res.json({
      success: true,
      data: popup,
      message: `Popup advertisement ${popup.status ? 'enabled' : 'disabled'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Get Analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await PopupAdvertisement.aggregate([
      {
        $group: {
          _id: null,
          totalPopups: { $sum: 1 },
          activePopups: { $sum: { $cond: [{ $eq: ['$status', true] }, 1, 0] } },
          totalViews: { $sum: '$views' },
          totalClicks: { $sum: '$clicks' },
          totalCopies: { $sum: '$copies' },
          totalCloseCount: { $sum: '$closeCount' },
        },
      },
    ]);

    const performance = await PopupAdvertisement.find()
      .select('title offerType views clicks copies closeCount status')
      .sort({ views: -1 })
      .limit(10);

    const defaultStats = {
      totalPopups: 0,
      activePopups: 0,
      totalViews: 0,
      totalClicks: 0,
      totalCopies: 0,
      totalCloseCount: 0,
      ctr: 0,
    };

    const stats = analytics[0]
      ? {
          totalPopups: analytics[0].totalPopups,
          activePopups: analytics[0].activePopups,
          totalViews: analytics[0].totalViews,
          totalClicks: analytics[0].totalClicks,
          totalCopies: analytics[0].totalCopies,
          totalCloseCount: analytics[0].totalCloseCount,
          ctr: analytics[0].totalViews > 0 
            ? ((analytics[0].totalClicks / analytics[0].totalViews) * 100).toFixed(2) 
            : 0,
          copyRate: analytics[0].totalViews > 0 
            ? ((analytics[0].totalCopies / analytics[0].totalViews) * 100).toFixed(2) 
            : 0,
        }
      : defaultStats;

    res.json({
      success: true,
      data: {
        stats,
        topPerformance: performance,
      },
    });
  } catch (error) {
    next(error);
  }
};
