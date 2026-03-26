'use strict';

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const twilio    = require('twilio');

admin.initializeApp();

/**
 * notifyClientMessage
 *
 * Fires whenever a NEW message is written to the client portal.
 * Path: hwfs-os/messages/{jobId}/{msgId}
 *
 * Sends an SMS to both Nico and Rob via Twilio.
 *
 * Required Firebase config (set once, then deploy):
 *   firebase functions:config:set \
 *     twilio.account_sid="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
 *     twilio.auth_token="your_auth_token" \
 *     twilio.from_phone="+1XXXXXXXXXX" \
 *     twilio.nico_phone="+1XXXXXXXXXX" \
 *     twilio.rob_phone="+1XXXXXXXXXX"
 */
exports.notifyClientMessage = functions
  .database
  .ref('hwfs-os/messages/{jobId}/{msgId}')
  .onCreate(async (snapshot, context) => {
    const msg    = snapshot.val();
    const jobId  = context.params.jobId;

    // Skip empty or malformed messages
    if (!msg || !msg.text) return null;

    // Skip if this looks like an ERP-originated reply (has a `by` field = staff user)
    // Client messages come from portal.html and don't have a `by` field at the root
    if (msg.by) return null;

    const cfg = functions.config().twilio;
    if (!cfg || !cfg.account_sid) {
      console.error('Twilio config not set. Run: firebase functions:config:set twilio.account_sid=... etc.');
      return null;
    }

    const client = twilio(cfg.account_sid, cfg.auth_token);

    const preview = msg.text.length > 100
      ? msg.text.substring(0, 100) + '…'
      : msg.text;

    const body = [
      `🔔 HuronWest Portal — New client message`,
      `Job: ${jobId}`,
      `"${preview}"`,
      `Open the ERP to reply.`,
    ].join('\n');

    const recipients = [cfg.nico_phone, cfg.rob_phone].filter(Boolean);

    if (recipients.length === 0) {
      console.warn('No recipient phone numbers configured.');
      return null;
    }

    const results = await Promise.allSettled(
      recipients.map(to =>
        client.messages.create({ body, from: cfg.from_phone, to })
      )
    );

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`SMS to ${recipients[i]} failed:`, r.reason);
      } else {
        console.log(`SMS sent to ${recipients[i]} — SID: ${r.value.sid}`);
      }
    });

    return null;
  });
