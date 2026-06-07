import nodemailer from 'nodemailer';

// Helper to send email fallback in simulated mode
async function sendEmailFallback(studentName, studentEmail, amount, messageText) {
  if (!studentEmail) {
    console.log(`[SMS-Simulation] No email provided for ${studentName}. Email fallback skipped.`);
    return;
  }

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log('[SMS-Simulation] EMAIL_USER or EMAIL_PASS not configured in .env. Email fallback skipped.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  const mailOptions = {
    from: `"EduFees Notifications" <${user}>`,
    to: studentEmail,
    subject: `🔔 EduFees Reminder: Pending Dues ₹${amount}`,
    text: `Hi ${studentName},\n\nThis is a notification that you have a pending amount of ₹${amount}.\n\nMessage detail:\n${messageText}\n\nBest regards,\nEduFees Team`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:#e11d48;padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px">Pending Fees Reminder</h1>
        </div>
        <div style="padding:24px">
          <p style="font-size:16px;color:#334155">Hi <strong>${studentName}</strong>,</p>
          <p style="color:#475569">You have outstanding dues for your enrolled courses.</p>
          
          <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:20px;text-align:center;margin:24px 0">
            <span style="display:block;color:#9f1239;font-size:14px;font-weight:600;text-transform:uppercase">Total Pending Amount</span>
            <span style="font-size:36px;font-weight:900;color:#e11d48;display:block;margin-top:4px">₹${amount}</span>
          </div>

          <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="margin:0;color:#475569;font-size:13px;line-height:1.5"><strong>SMS Message Text:</strong><br/>"${messageText}"</p>
          </div>

          <p style="color:#475569;font-size:14px">Please make the payment as soon as possible to keep your account up to date. If you have already paid, please contact your teacher.</p>
          
          <p style="margin-top:32px;color:#94a3b8;font-size:13px;border-top:1px solid #f1f5f9;padding-top:16px">Best regards,<br/><strong>EduFees Team</strong></p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[SMS-Simulation] Dual-channel Email sent successfully to ${studentEmail}`);
  } catch (error) {
    console.error(`[SMS-Simulation] Failed to send email fallback: ${error.message}`);
  }
}

/**
 * Sends SMS using the configured provider.
 * Supports: 'twilio', 'fast2sms', and 'simulated'.
 */
export async function sendSMS({ to, studentName, amount, email }) {
  const provider = (process.env.SMS_PROVIDER || 'simulated').toLowerCase();
  const cleanedNumber = String(to || '').replace(/[^0-9+]/g, '');
  const message = `Dear ${studentName}, this is a gentle reminder from EduFees. Your total pending balance is INR ${amount}. Please clear your dues as soon as possible. Thank you!`;

  if (!cleanedNumber || cleanedNumber.length < 10) {
    const errorMsg = `Invalid phone number for ${studentName}: ${to}`;
    console.error(`[SMS Service] ${errorMsg}`);
    if (email) sendEmailFallback(studentName, email, amount, message).catch(console.error);
    return { success: false, provider, error: errorMsg };
  }

  const twilioNumber = cleanedNumber.startsWith('+') ? cleanedNumber : `+${cleanedNumber}`;
  const fast2smsNumber = cleanedNumber.replace(/\D/g, '').slice(-10);

  console.log(`[SMS Service] Dispatching message to ${to} (${studentName}) via [${provider.toUpperCase()}]`);

  if (provider === 'twilio') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      const errorMsg = 'Twilio credentials missing in backend environment variables.';
      console.error(`[SMS Service] Twilio Error: ${errorMsg}`);
      if (email) sendEmailFallback(studentName, email, amount, message).catch(console.error);
      return { success: false, provider, error: errorMsg };
    }

    try {
      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: twilioNumber,
          Body: message
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      console.log(`[SMS Service] Twilio SMS sent successfully! SID: ${data.sid}`);
      return { success: true, provider, sid: data.sid };
    } catch (err) {
      console.error(`[SMS Service] Twilio sending failed: ${err.message}`);
      if (email) sendEmailFallback(studentName, email, amount, message).catch(console.error);
      return { success: false, provider, error: err.message };
    }
  }

  if (provider === 'fast2sms') {
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      const errorMsg = 'Fast2SMS API Key missing in backend environment variables.';
      console.error(`[SMS Service] Fast2SMS Error: ${errorMsg}`);
      return { success: false, provider, error: errorMsg };
    }

    if (fast2smsNumber.length !== 10) {
      const errorMsg = `Invalid Fast2SMS mobile number for ${studentName}: ${to}`;
      console.error(`[SMS Service] ${errorMsg}`);
      if (email) sendEmailFallback(studentName, email, amount, message).catch(console.error);
      return { success: false, provider, error: errorMsg };
    }

    try {
      const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=q&message=${encodeURIComponent(message)}&flash=0&numbers=${fast2smsNumber}`, {
        method: 'GET'
      });

      const data = await response.json();
      
      if (!response.ok || !data.return) {
        throw new Error(data.message || (data.return === false ? data.message : `HTTP ${response.status}`));
      }

      console.log(`[SMS Service] Fast2SMS sent successfully!`);
      return { success: true, provider, data };
    } catch (err) {
      console.error(`[SMS Service] Fast2SMS sending failed: ${err.message}`);
      if (email) sendEmailFallback(studentName, email, amount, message).catch(console.error);
      return { success: false, provider, error: err.message };
    }
  }

  // Simulated Mode (Default Fallback)
  console.log(`========================================`);
  console.log(`[SIMULATED SMS REMINDER]`);
  console.log(`TO:      ${to} (${studentName})`);
  console.log(`AMOUNT:  ₹${amount}`);
  console.log(`MESSAGE: "${message}"`);
  console.log(`========================================`);

  // Fire email fallback asynchronously so it doesn't block the API response
  sendEmailFallback(studentName, email, amount, message).catch(console.error);

  return { 
    success: true, 
    provider: 'simulated', 
    simulated: true, 
    message: 'SMS simulation successful. Printed to terminal.' 
  };
}
