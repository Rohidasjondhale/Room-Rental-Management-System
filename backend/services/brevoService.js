const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY
});

async function sendEmail(toEmail, toName, subject, htmlContent) {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      sender: {
        name: process.env.SENDER_NAME || "Room Rental",
        email: process.env.SENDER_EMAIL
      },
      to: [
        {
          email: toEmail,
          name: toName || "User"
        }
      ]
    });

    return result;
  } catch (error) {
    console.log("Brevo email error:", error.message);
  }
}

module.exports = {
  sendEmail
};