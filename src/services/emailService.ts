import nodemailer from 'nodemailer';

// Support both Gmail and Hostinger (or any SMTP provider)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export interface BookingDetails {
    name: string;
    phone: string;
    email?: string;
    service: string;
    date: string;
    time_slot: string;
    zip_code?: string;
}

export interface QuoteDetails {
    customer_name: string;
    email?: string;
    phone?: string;
    service: string;
    sqft?: number;
    estimated_price?: number;
    notes?: string;
}

export interface ChatbotLead {
    name?: string;
    phone?: string;
    email?: string;
    message: string;
    conversation: string[];
}

/**
 * Sends an email notification when a customer requests a quote
 */
export async function sendQuoteNotification(quote: QuoteDetails) {
    const businessEmail = process.env.SMTP_USER;
    const businessName = 'Broom & Box Cleaning Services';

    if (!businessEmail) {
        console.log('📧 Quote request received (email not configured):', quote);
        return false;
    }

    try {
        // ----- Email to business owner -----
        await transporter.sendMail({
            from: `"${businessName} Quotes" <${businessEmail}>`,
            to: businessEmail,
            subject: `💰 New Quote Request – ${quote.service}${quote.estimated_price ? ` ($${quote.estimated_price})` : ''}`,
            html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <div style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:20px">💰 New Quote Request!</h1>
          </div>
          <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:16px">
              <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#6b7280">Customer Info</h3>
              <table style="width:100%;border-collapse:collapse;font-size:15px">
                <tr><td style="padding:6px 0;color:#6b7280;width:100px">Name</td><td style="font-weight:600">${quote.customer_name}</td></tr>
                ${quote.phone ? `<tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="font-weight:600"><a href="tel:${quote.phone}" style="color:#16a34a">${quote.phone}</a></td></tr>` : ''}
                ${quote.email ? `<tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="font-weight:600"><a href="mailto:${quote.email}" style="color:#16a34a">${quote.email}</a></td></tr>` : ''}
              </table>
            </div>
            
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
              <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#6b7280">Quote Details</h3>
              <table style="width:100%;border-collapse:collapse;font-size:15px">
                <tr><td style="padding:6px 0;color:#6b7280;width:100px">Service</td><td style="font-weight:600">${quote.service}</td></tr>
                ${quote.sqft ? `<tr><td style="padding:6px 0;color:#6b7280">Square Feet</td><td style="font-weight:600">${quote.sqft.toLocaleString()} sq ft</td></tr>` : ''}
                ${quote.estimated_price ? `<tr><td style="padding:6px 0;color:#6b7280">Estimate</td><td style="font-weight:600;color:#16a34a;font-size:18px">$${quote.estimated_price}</td></tr>` : ''}
                ${quote.notes ? `<tr><td style="padding:6px 0;color:#6b7280">Notes</td><td>${quote.notes}</td></tr>` : ''}
              </table>
            </div>
            
            <div style="margin-top:20px;padding:16px;background:#dcfce7;border-radius:8px;text-align:center">
              <strong style="color:#166534">🎯 Hot Lead!</strong>
              <p style="margin:8px 0 0;font-size:13px;color:#166534">Customer already received an estimate. Follow up to close the deal!</p>
            </div>
          </div>
        </div>
      `,
        });

        // ----- Confirmation email to customer (if email provided) -----
        if (quote.email) {
            await transporter.sendMail({
                from: `"${businessName}" <${businessEmail}>`,
                to: quote.email,
                subject: `Your Cleaning Estimate – $${quote.estimated_price || 'TBD'}`,
                html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
            <div style="background:#16a34a;padding:32px 24px;border-radius:12px 12px 0 0;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:24px">Your Cleaning Estimate 🧹</h1>
            </div>
            <div style="background:#f9fafb;padding:32px 24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
              <p style="font-size:16px">Hi <strong>${quote.customer_name}</strong>,</p>
              <p style="color:#4b5563">
                Thank you for requesting a quote from <strong>${businessName}</strong>! 
                Based on the information you provided, here's your estimate:
              </p>
              <div style="background:#fff;border:2px solid #16a34a;border-radius:12px;padding:24px;margin:24px 0;text-align:center">
                <p style="margin:0;color:#6b7280;font-size:14px;text-transform:uppercase;letter-spacing:1px">Estimated Price</p>
                <p style="margin:8px 0 0;font-size:36px;font-weight:bold;color:#16a34a">$${quote.estimated_price || 'Contact Us'}</p>
                <p style="margin:8px 0 0;color:#6b7280;font-size:14px">${quote.service}${quote.sqft ? ` • ${quote.sqft.toLocaleString()} sq ft` : ''}</p>
                ${quote.notes ? `<p style="margin:8px 0 0;color:#6b7280;font-size:13px">${quote.notes}</p>` : ''}
              </div>
              <p style="color:#4b5563;font-size:14px">
                Ready to book? We'll be in touch shortly, or you can call us at 
                <a href="tel:2144332703" style="color:#16a34a;font-weight:600">(214) 433-2703</a> 
                to schedule your cleaning today!
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
              <p style="font-size:12px;color:#9ca3af;text-align:center">
                ${businessName} · Dallas Metroplex · Insured &amp; Bonded
              </p>
            </div>
          </div>
        `,
            });
        }

        console.log('✅ Quote notification email sent');
        return true;
    } catch (error) {
        console.error('❌ Failed to send quote notification:', error);
        return false;
    }
}

/**
 * Sends a notification when chatbot captures a lead
 */
export async function sendChatbotLeadNotification(lead: ChatbotLead) {
    const businessEmail = process.env.SMTP_USER;
    const businessName = 'Broom & Box Cleaning Services';

    if (!businessEmail) {
        console.log('📧 Chatbot Lead captured (email not configured):', lead);
        return false;
    }

    try {
        await transporter.sendMail({
            from: `"Sparkle Bot 🤖" <${businessEmail}>`,
            to: businessEmail,
            subject: `💬 New Chat Lead${lead.name ? ` - ${lead.name}` : ''}`,
            html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <div style="background:linear-gradient(135deg,#7c3aed,#6366f1);padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:20px">💬 New Chatbot Lead!</h1>
          </div>
          <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:16px">
              <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#6b7280">Contact Info</h3>
              <table style="width:100%;border-collapse:collapse;font-size:15px">
                ${lead.name ? `<tr><td style="padding:6px 0;color:#6b7280;width:80px">Name</td><td style="font-weight:600">${lead.name}</td></tr>` : ''}
                ${lead.phone ? `<tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="font-weight:600"><a href="tel:${lead.phone}" style="color:#16a34a">${lead.phone}</a></td></tr>` : ''}
                ${lead.email ? `<tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="font-weight:600"><a href="mailto:${lead.email}" style="color:#16a34a">${lead.email}</a></td></tr>` : ''}
              </table>
            </div>
            
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
              <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#6b7280">Conversation</h3>
              ${lead.conversation.map((msg, i) => `
                <div style="margin:8px 0;padding:8px 12px;border-radius:8px;${i % 2 === 0 ? 'background:#e0f2fe;text-align:right' : 'background:#f3f4f6'}">
                  <span style="font-size:10px;color:#6b7280">${i % 2 === 0 ? 'Customer' : 'Sparkle'}</span><br>
                  <span style="font-size:14px">${msg}</span>
                </div>
              `).join('')}
            </div>
            
            <div style="margin-top:20px;padding:16px;background:#fef3c7;border-radius:8px;text-align:center">
              <strong style="color:#92400e">⚡ Follow up soon!</strong>
              <p style="margin:8px 0 0;font-size:13px;color:#92400e">Respond within 5 minutes for best conversion</p>
            </div>
          </div>
        </div>
      `,
        });
        console.log('✅ Lead notification email sent');
        return true;
    } catch (error) {
        console.error('❌ Failed to send lead notification:', error);
        return false;
    }
}

/**
 * Sends a confirmation email to the customer (if email provided)
 * and a notification email to the business owner.
 */
export async function sendBookingConfirmation(booking: BookingDetails) {
    const businessEmail = process.env.SMTP_USER;
    const businessName = 'Broom & Box Cleaning Services';

    const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    // ----- Email to customer -----
    if (booking.email) {
        await transporter.sendMail({
            from: `"${businessName}" <${businessEmail}>`,
            to: booking.email,
            subject: `✅ Booking Confirmed – ${booking.service} on ${formattedDate}`,
            html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <div style="background:#16a34a;padding:32px 24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:24px">Booking Confirmed! 🎉</h1>
          </div>
          <div style="background:#f9fafb;padding:32px 24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <p style="font-size:16px">Hi <strong>${booking.name}</strong>,</p>
            <p style="color:#4b5563">
              Thank you for booking with <strong>${businessName}</strong>. 
              Your appointment is confirmed and we look forward to serving you!
            </p>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:24px 0">
              <h3 style="margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#6b7280">Booking Details</h3>
              <table style="width:100%;border-collapse:collapse;font-size:15px">
                <tr><td style="padding:6px 0;color:#6b7280;width:120px">Service</td><td style="padding:6px 0;font-weight:600">${booking.service}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280">Date</td><td style="padding:6px 0;font-weight:600">${formattedDate}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280">Time</td><td style="padding:6px 0;font-weight:600">${booking.time_slot}</td></tr>
                ${booking.zip_code ? `<tr><td style="padding:6px 0;color:#6b7280">Zip Code</td><td style="padding:6px 0;font-weight:600">${booking.zip_code}</td></tr>` : ''}
                <tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0;font-weight:600">${booking.phone}</td></tr>
              </table>
            </div>
            <p style="color:#4b5563;font-size:14px">
              Need to make changes? Call us at <a href="tel:+19724000000" style="color:#16a34a">(972) 400-0000</a> 
              or reply to this email.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
            <p style="font-size:12px;color:#9ca3af;text-align:center">
              ${businessName} · Dallas Metroplex · Insured &amp; Bonded
            </p>
          </div>
        </div>
      `,
        });
    }

    // ----- Notification to business owner -----
    await transporter.sendMail({
        from: `"${businessName} Bookings" <${businessEmail}>`,
        to: businessEmail,
        subject: `📅 New Booking – ${booking.service} on ${formattedDate}`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;color:#1a1a1a">
        <h2 style="color:#16a34a">New Booking Received</h2>
        <table style="width:100%;border-collapse:collapse;font-size:15px">
          <tr><td style="padding:8px 0;color:#6b7280;width:120px">Customer</td><td style="font-weight:600">${booking.name}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Phone</td><td>${booking.phone}</td></tr>
          ${booking.email ? `<tr><td style="padding:8px 0;color:#6b7280">Email</td><td>${booking.email}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#6b7280">Service</td><td style="font-weight:600">${booking.service}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Date</td><td style="font-weight:600">${formattedDate}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Time</td><td style="font-weight:600">${booking.time_slot}</td></tr>
          ${booking.zip_code ? `<tr><td style="padding:8px 0;color:#6b7280">Zip Code</td><td>${booking.zip_code}</td></tr>` : ''}
        </table>
      </div>
    `,
    });
}
