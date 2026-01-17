'use client'

import { Bell } from 'lucide-react'
import {
  HelpArticleLayout,
  HelpSection,
  HelpHeading,
  HelpSubheading,
  HelpParagraph,
  HelpList,
  HelpListItem,
  HelpTable,
  HelpTip,
  HelpSteps,
} from '../components/HelpArticleLayout'

export default function RemindersHelp() {
  return (
    <HelpArticleLayout
      title="Reminders & Alerts"
      description="Never miss a restock or important event"
      icon={Bell}
      iconColor="bg-red-50 text-red-600"
      prevArticle={{ href: '/help/serials', title: 'Serial Numbers' }}
      nextArticle={{ href: '/help/reorder', title: 'Auto-Reorder' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Reminders help you stay on top of important inventory events. Whether it&apos;s an item
          running low, products about to expire, or a scheduled restock date, StockZip can
          notify you so nothing slips through the cracks.
        </HelpParagraph>
      </HelpSection>

      {/* Types of Reminders */}
      <HelpSection>
        <HelpHeading>Types of Reminders</HelpHeading>
        <HelpParagraph>
          StockZip supports three types of reminders:
        </HelpParagraph>
        <HelpTable
          headers={['Type', 'When It Triggers', 'Example Use']}
          rows={[
            ['Low Stock', 'When quantity falls below a number you set', '"Remind me when we have fewer than 10 widgets"'],
            ['Expiry', 'A certain number of days before expiry date', '"Remind me 30 days before this batch expires"'],
            ['Restock', 'On a specific date or recurring schedule', '"Remind me to check supplies every Monday"'],
          ]}
        />
      </HelpSection>

      {/* Creating Reminders */}
      <HelpSection>
        <HelpHeading>Creating a Reminder</HelpHeading>

        <HelpSubheading>From an Item&apos;s Page</HelpSubheading>
        <HelpSteps
          steps={[
            {
              title: 'Open the item\'s detail page',
              description: 'Click on the item in your inventory.',
            },
            {
              title: 'Find the "Reminders" section',
              description: 'Look for the bell icon or "Reminders" heading.',
            },
            {
              title: 'Click "Add Reminder"',
              description: 'Start creating a new reminder.',
            },
            {
              title: 'Choose the reminder type',
              description: 'Low Stock, Expiry, or Restock.',
            },
            {
              title: 'Set the trigger',
              description: 'The threshold, days before, or date (depends on type).',
            },
            {
              title: 'Choose how often',
              description: 'Once, Daily, Weekly, or Monthly.',
            },
            {
              title: 'Pick notification method',
              description: 'In-app, Email, or both.',
            },
            {
              title: 'Save',
              description: 'Your reminder is active!',
            },
          ]}
        />
      </HelpSection>

      {/* Reminder Settings */}
      <HelpSection>
        <HelpHeading>Reminder Settings Explained</HelpHeading>

        <HelpSubheading>For Low Stock Reminders</HelpSubheading>
        <HelpTable
          headers={['Setting', 'What It Means']}
          rows={[
            ['Threshold', 'Remind when quantity drops to this number or below. Example: Set to 10, get alerted when you have 10 or fewer.'],
          ]}
        />

        <HelpSubheading>For Expiry Reminders</HelpSubheading>
        <HelpTable
          headers={['Setting', 'What It Means']}
          rows={[
            ['Days Before', 'How many days before expiry to remind you. Example: Set to 30, get alerted 30 days before expiry.'],
          ]}
        />

        <HelpSubheading>For Restock Reminders</HelpSubheading>
        <HelpTable
          headers={['Setting', 'What It Means']}
          rows={[
            ['Date/Time', 'When to send the reminder'],
            ['Recurrence', 'Once (just this time), Daily, Weekly, or Monthly'],
          ]}
        />
      </HelpSection>

      {/* Managing Reminders */}
      <HelpSection>
        <HelpHeading>Managing Your Reminders</HelpHeading>
        <HelpParagraph>
          To see and manage all your reminders:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Go to Reminders in the sidebar',
              description: 'Click "Reminders" in the navigation.',
            },
            {
              title: 'Browse by tab',
              description: 'See All reminders, or filter by Low Stock, Expiry, or Restock.',
            },
            {
              title: 'Check status',
              description: 'See which are Active, Paused, Triggered, or Expired.',
            },
            {
              title: 'Take action',
              description: 'Edit, Pause, or Delete reminders as needed.',
            },
          ]}
        />

        <HelpSubheading>Reminder Status</HelpSubheading>
        <HelpTable
          headers={['Status', 'What It Means']}
          rows={[
            ['Active', 'Reminder is watching for its trigger condition'],
            ['Paused', 'Temporarily stopped - won\'t send notifications'],
            ['Triggered', 'Condition was met, notification was sent'],
            ['Expired', 'One-time reminder that already fired'],
          ]}
        />
      </HelpSection>

      {/* How Notifications Work */}
      <HelpSection>
        <HelpHeading>How Notifications Work</HelpHeading>
        <HelpParagraph>
          When a reminder triggers, you get notified. Here&apos;s how each method works:
        </HelpParagraph>
        <HelpTable
          headers={['Method', 'How It Works']}
          rows={[
            ['In-App', 'A red badge appears on the bell icon in the navigation. Click it to see your notifications.'],
            ['Email', 'An email is sent to the email address you signed up with. Check your inbox (and spam folder).'],
            ['Push (Mobile)', 'If you\'ve installed StockZip on your phone, you\'ll get a push notification like a text message.'],
          ]}
        />
        <HelpTip type="success">
          We recommend using both In-App and Email. That way you&apos;ll see it even if you&apos;re not
          in StockZip at the moment.
        </HelpTip>
      </HelpSection>

      {/* Best Practices */}
      <HelpSection>
        <HelpHeading>Tips for Effective Reminders</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Set meaningful thresholds:</strong> Think about how long it takes to get
            more stock. If it takes 2 weeks to reorder, set the threshold high enough to
            give you time.
          </HelpListItem>
          <HelpListItem>
            <strong>Don&apos;t over-remind:</strong> Too many reminders leads to &quot;reminder fatigue&quot;
            where you ignore them all. Focus on items that really matter.
          </HelpListItem>
          <HelpListItem>
            <strong>Use expiry reminders for perishables:</strong> Set them early enough to
            use items before they expire or plan a sale.
          </HelpListItem>
          <HelpListItem>
            <strong>Use restock reminders for regular checks:</strong> Set a weekly reminder
            to review low stock items and place orders.
          </HelpListItem>
          <HelpListItem>
            <strong>Act on reminders!</strong> A reminder doesn&apos;t help if you ignore it.
            When notified, take action or snooze if you need more time.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
