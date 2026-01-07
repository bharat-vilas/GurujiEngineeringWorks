# EmailJS Setup Guide for Guruji Engineering Works

This guide will help you set up EmailJS to send emails directly from your React application.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Create Email Service

1. Go to your EmailJS dashboard
2. Click "Email Services" in the left sidebar
3. Click "Add New Service"
4. Choose your email provider (Gmail, Outlook, Yahoo, etc.)
5. For Gmail:
   - Enter your Gmail address
   - Enter your Gmail password or App Password (recommended)
   - Click "Create Service"
6. Note down your **Service ID** (e.g., `service_xxxxxxx`)

## Step 3: Create Email Template

1. Go to "Email Templates" in your EmailJS dashboard
2. Click "Create New Template"
3. Use this template for quotations/billing:

### Template Subject:
```
{{subject}} - Guruji Engineering Works
```

### Template Body:
```
Dear {{client_name}},

{{message}}

Company: {{client_firm}}
Date: {{billing_date}}

Items:
{{items}}

Total Amount: ₹{{total_amount}}

Best regards,
{{from_name}}

---
Guruji Engineering Works
51, Ambedkar Market, Maharajpur, Sahibabad, Ghaziabad, UP(201010)
Contact: 9990260536, 7838738789
Email: ramv60074@gmail.com
```

4. Save the template and note down your **Template ID** (e.g., `template_xxxxxxx`)

## Step 4: Get Public Key

1. Go to "Account" in your EmailJS dashboard
2. Find your **Public Key** (e.g., `user_xxxxxxxxxxxxxxx`)

## Step 5: Update Configuration

Open `src/config/emailConfig.ts` and replace the placeholder values:

```typescript
export const EMAIL_CONFIG = {
  SERVICE_ID: 'service_xxxxxxx',     // Replace with your Service ID
  TEMPLATE_ID: 'template_xxxxxxx',   // Replace with your Template ID
  PUBLIC_KEY: 'user_xxxxxxxxxxxxxxx', // Replace with your Public Key
  
  TEMPLATE_VARS: {
    to_email: '{{to_email}}',
    client_name: '{{client_name}}',
    client_firm: '{{client_firm}}',
    billing_date: '{{billing_date}}',
    items: '{{items}}',
    total_amount: '{{total_amount}}',
    from_name: '{{from_name}}',
    message: '{{message}}',
    subject: '{{subject}}'
  }
};
```

## Step 6: Test Email Functionality

1. Start your React application: `npm run dev`
2. Go to either Quotation or Billing tab
3. Fill in client details and email address
4. Add some items
5. Click "Send Email" button
6. Check if the email is sent successfully

## Security Notes

- Keep your EmailJS credentials secure
- Don't commit real credentials to version control
- Consider using environment variables for production:

```typescript
export const EMAIL_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id',
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'your_template_id',
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key',
};
```

## Troubleshooting

- **Email not sending**: Check your service configuration and credentials
- **Template not found**: Verify your template ID is correct
- **Permission denied**: Ensure your email service is properly authenticated
- **Rate limiting**: EmailJS free plan has sending limits (200 emails/month)

## Production Considerations

- Upgrade to EmailJS Pro for higher limits
- Set up proper error handling
- Add email validation
- Consider using a backend service for sensitive operations
