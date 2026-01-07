// EmailJS Configuration
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/
// 2. Create an account
// 3. Create an email service (Gmail, Outlook, etc.)
// 4. Create an email template
// 5. Replace the values below with your actual credentials

export const EMAIL_CONFIG = {
  // Replace with your actual EmailJS service ID
  SERVICE_ID: "your_service_id",

  // Replace with your actual template ID
  TEMPLATE_ID: "your_template_id",

  // Replace with your actual public key
  PUBLIC_KEY: "your_public_key",

  // Email template variables (these will be replaced in your EmailJS template)
  TEMPLATE_VARS: {
    to_email: "{{to_email}}",
    client_name: "{{client_name}}",
    client_firm: "{{client_firm}}",
    billing_date: "{{billing_date}}",
    items: "{{items}}",
    total_amount: "{{total_amount}}",
    from_name: "{{from_name}}",
    message: "{{message}}",
  },
};

// Sample EmailJS Template:
/*
Subject: Invoice from Guruji Engineering Works

Dear {{client_name}},

Please find your billing details below:

Company: {{client_firm}}
Date: {{billing_date}}

Items:
{{items}}

Total Amount: ₹{{total_amount}}

{{message}}

Best regards,
{{from_name}}
Guruji Engineering Works
*/

export default EMAIL_CONFIG;
