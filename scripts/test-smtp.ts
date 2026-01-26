/**
 * SMTP Test Script
 * Run with: npx tsx scripts/test-smtp.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import nodemailer from 'nodemailer'

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })
}

async function testSmtp() {
  console.log('🔧 Testing SMTP Configuration...\n')

  // Load env vars
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
    adminEmail: process.env.ADMIN_EMAIL,
  }

  console.log('📋 Configuration:')
  console.log(`   Host: ${config.host}`)
  console.log(`   Port: ${config.port}`)
  console.log(`   Secure: ${config.secure}`)
  console.log(`   User: ${config.user}`)
  console.log(`   From: ${config.from}`)
  console.log(`   Admin Email: ${config.adminEmail}\n`)

  if (!config.host || !config.user || !config.pass) {
    console.error('❌ Missing SMTP configuration. Check your .env.local file.')
    process.exit(1)
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })

  try {
    // Verify connection
    console.log('🔌 Verifying SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection successful!\n')

    // Send test email
    if (config.adminEmail) {
      console.log(`📧 Sending test email to ${config.adminEmail}...`)

      const info = await transporter.sendMail({
        from: config.from || config.user,
        to: config.adminEmail,
        subject: '🧪 StockZip SMTP Test',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #22c55e;">SMTP Test Successful!</h1>
            <p>Your StockZip email notifications are configured correctly.</p>
            <p style="color: #6b7280; font-size: 14px;">
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        `,
      })

      console.log(`✅ Test email sent! Message ID: ${info.messageId}`)
      console.log('\n🎉 All tests passed! Your SMTP is ready to use.')
    } else {
      console.log('⚠️  No ADMIN_EMAIL configured - skipping test email send')
    }
  } catch (err) {
    console.error('\n❌ SMTP Test Failed:')
    console.error(err)
    process.exit(1)
  }
}

testSmtp()
