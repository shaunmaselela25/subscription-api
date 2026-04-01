import dayjs from 'dayjs';
import Subscription from '../models/subscription.model.js';
import { createRequire } from 'module';
import { sendReminderEmail } from '../utilities/send-email.js';

const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');

const REMINDER_INTERVALS = [7, 5, 2, 1];

const getReminderLabel = (daysBefore) => `${daysBefore} days before reminder`;

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requirePayload;

  if (!subscriptionId) {
    console.error('sendReminders: missing subscriptionId in payload');
    return;
  }

  const subscription = await fetchSubscription(subscriptionId);

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

  const now = dayjs();
  if (renewalDate.isBefore(now)) {
    console.info(`Subscription ${subscriptionId} renewal date ${renewalDate.toISOString()} is in the past. No reminders.`);
    return;
  }

  if (!subscription.user?.email) {
    console.error(`Subscription ${subscriptionId} has no user email: cannot send reminders.`);
    return;
  }

  for (const daysBefore of REMINDER_INTERVALS) {
    const reminderDate = renewalDate.subtract(daysBefore, 'day');
    const reminderType = getReminderLabel(daysBefore);
    const workflowTask = `subscription-${subscriptionId}-${daysBefore}-days`; 

    if (reminderDate.isAfter(now)) {
      console.log(`Waiting for ${reminderType} on ${reminderDate.toISOString()}`);
      await context.sleepUntil(workflowTask, reminderDate.toDate());
    } else {
      console.log(`Reminder date passed for ${reminderType}, sending immediately.`);
    }

    if(dayjs().isSame(reminderDate, 'day')) {
         await triggerReminder(context, workflowTask, reminderType, subscription);
    }
  }
});

const fetchSubscription = async (subscriptionId) => {
  return Subscription.findById(subscriptionId).populate('user', 'name email');
};

const triggerReminder = async (context, taskName, reminderType, subscription) => {
  return context.run(taskName, async () => {
    const recipient = subscription.user?.email;
    if (!recipient) {
      throw new Error(`No recipient email for subscription ${subscription._id}`);
    }

    console.log(`Triggering ${reminderType} for subscription ${subscription._id} (${recipient})`);

    const result = await sendReminderEmail({
      to: recipient,
      type: reminderType,
      subscription,
    });

    return {
      status: 'sent',
      reminderType,
      sentAt: new Date().toISOString(),
      emailResponse: result?.response,
    };
  });
};
