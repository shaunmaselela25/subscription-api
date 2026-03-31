import dayjs from 'dayjs';
import Subscription from '../models/subscription.model.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requirePayload;
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription) {
    console.warn(`Subscription ${subscriptionId} not found; stopping workflow.`);
    return;
  }

  if (subscription.status !== 'active') {
    console.info(`Subscription ${subscriptionId} has status '${subscription.status}', no reminders needed.`);
    return;
  }

  const renewalDate = dayjs(subscription.renewalDate);
  if (!renewalDate.isValid()) {
    console.error(`Invalid renewalDate for subscription ${subscriptionId}`);
    return;
  }

  if (renewalDate.isBefore(dayjs())) {
    console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, 'day');
    const label = `Reminder ${daysBefore} days before`;

    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(context, label, reminderDate);
    }

    await triggerReminder(context, label, subscription);
  }
});

const fetchSubscription = async (_context, subscriptionId) => {
  return await Subscription.findById(subscriptionId).populate('user', 'name email');
};

const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleeping until ${label} reminder at ${date.toISOString()}`);
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder for subscription ${subscription._id}`);
    // TODO: Add actual notification dispatch (email/SMS/push)
    return { status: 'sent', label };
  });
};
