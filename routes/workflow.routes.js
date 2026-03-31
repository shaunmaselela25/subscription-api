import { Router } from 'express';
import { sendReminders } from '../controllers/workflow.controller.js';


const workflowRouter = Router();

// Health check endpoint for workflow subsystem
workflowRouter.post('/subscription/reminder', sendReminders);

// Trigger reminder workflow manually (optional)
workflowRouter.post('/reminders', async (req, res, next) => {
  try {
    const { subscriptionId } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ success: false, message: 'subscriptionId is required' });
    }

    // Leverage sendReminders only if this app architecture supports it.
    await sendReminders({ requirePayload: { subscriptionId } });

    res.status(200).json({ success: true, message: 'Reminder workflow triggered' });
  } catch (error) {
    next(error);
  }
});

export default workflowRouter;