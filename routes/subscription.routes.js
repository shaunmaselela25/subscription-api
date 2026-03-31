import { Router } from 'express';
import authorize from '../middleware/auth.middleware.js';
import {
  createSubscription,
  getUserSubscription,
  getSubscriptionById,
  updateSubscription,
  cancelSubscription,
  deleteSubscription,
  getUpcomingRenewals,
} from '../controllers/subscription.controller.js';

const subscriptionRouter = Router();

subscriptionRouter.get('/', authorize, getUpcomingRenewals); // optional: list all for authorized user
subscriptionRouter.get('/user/:id', authorize, getUserSubscription);
subscriptionRouter.get('/upcoming-renewals', authorize, getUpcomingRenewals);
subscriptionRouter.get('/:id', authorize, getSubscriptionById);
subscriptionRouter.post('/', authorize, createSubscription);
subscriptionRouter.put('/:id', authorize, updateSubscription);
subscriptionRouter.patch('/:id/cancel', authorize, cancelSubscription);
subscriptionRouter.delete('/:id', authorize, deleteSubscription);

export default subscriptionRouter;
