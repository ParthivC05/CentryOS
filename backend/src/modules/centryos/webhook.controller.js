export async function centryOsWebhook(req, res) {
  // Log the webhook payload for debugging
  console.log('CentryOS Webhook received:', req.body)

  // Process the webhook here as needed
  // For now, just acknowledge receipt

  res.status(200).json({ message: 'Webhook received successfully' })
}
