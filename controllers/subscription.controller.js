import { workflowClient } from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";

const ensureOwner = (documentUserId, currentUserId) => {
  if (!documentUserId || !currentUserId || String(documentUserId) !== String(currentUserId)) {
    const error = new Error("You are not authorized to access this resource");
    error.status = 401;
    throw error;
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      user: req.user._id,
    };

    const newSubscription = await Subscription.create(payload);

    // Optional: trigger workflow event to send welcome email / notification
    // Ensure workflowClient API is correctly configured if used.
    if (workflowClient && typeof workflowClient.trigger === 'function') {
      await workflowClient.trigger({
        url: process.env.SERVER_URL || 'http://localhost:3000',
        payload: { subscriptionId: newSubscription._id.toString() },
      });
    }

    res.status(201).json({
      success: true,
      data: newSubscription,
      message: "Subscription created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscription = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      const error = new Error("You are not the owner of this account");
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id }).sort({ renewalDate: 1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }

    ensureOwner(subscription.user, req.user._id);

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }

    ensureOwner(subscription.user, req.user._id);

    if (subscription.status === "canceled") {
      const error = new Error("Canceled subscriptions cannot be updated");
      error.status = 400;
      throw error;
    }

    Object.assign(subscription, req.body);
    const updatedSubscription = await subscription.save();

    res.status(200).json({
      success: true,
      data: updatedSubscription,
      message: "Subscription updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }

    ensureOwner(subscription.user, req.user._id);

    if (subscription.status === "canceled") {
      return res.status(200).json({
        success: true,
        data: subscription,
        message: "Subscription is already canceled",
      });
    }

    subscription.status = "canceled";
    await subscription.save();

    res.status(200).json({
      success: true,
      data: subscription,
      message: "Subscription canceled successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }

    ensureOwner(subscription.user, req.user._id);

    await subscription.deleteOne();

    res.status(204).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 30);

    const renewals = await Subscription.find({
      user: req.user._id,
      status: "active",
      renewalDate: { $gte: start, $lte: end },
    }).sort({ renewalDate: 1 });

    res.status(200).json({
      success: true,
      count: renewals.length,
      data: renewals,
    });
  } catch (error) {
    next(error);
  }
};
