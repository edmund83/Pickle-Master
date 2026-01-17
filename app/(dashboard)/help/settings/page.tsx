'use client'

import { Settings } from 'lucide-react'
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
} from '../components/HelpArticleLayout'

export default function SettingsHelp() {
  return (
    <HelpArticleLayout
      title="Settings & Configuration"
      description="Customize StockZip for your business"
      icon={Settings}
      iconColor="bg-neutral-100 text-neutral-600"
      prevArticle={{ href: '/help/team', title: 'Team Management' }}
      nextArticle={{ href: '/help/import-export', title: 'Import & Export' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Settings let you customize StockZip to work the way you want. From your company name
          and logo to how dates display and when you get notifications - it&apos;s all configurable.
          Let&apos;s walk through each settings area.
        </HelpParagraph>
      </HelpSection>

      {/* Company Settings */}
      <HelpSection>
        <HelpHeading>Company Settings</HelpHeading>
        <HelpParagraph>
          Go to <strong>Settings → Company</strong> to configure your business information:
        </HelpParagraph>
        <HelpTable
          headers={['Setting', 'What It Does']}
          rows={[
            ['Organization Name', 'Your business name. Shows on labels and reports.'],
            ['Logo', 'Upload your company logo. Appears on large labels and printed documents.'],
            ['Primary Color', 'Your brand accent color. Customizes buttons and highlights throughout StockZip.'],
            ['Tax ID', 'Your business tax identification number. Used on invoices if needed.'],
          ]}
        />
        <HelpTip type="success">
          Adding your logo makes labels look professional and helps customers and team members
          identify your inventory at a glance.
        </HelpTip>
      </HelpSection>

      {/* Profile Settings */}
      <HelpSection>
        <HelpHeading>Profile Settings</HelpHeading>
        <HelpParagraph>
          Go to <strong>Settings → Profile</strong> to configure your personal information:
        </HelpParagraph>
        <HelpTable
          headers={['Setting', 'What It Does']}
          rows={[
            ['Display Name', 'How your name appears in activity logs and to other team members.'],
            ['Email', 'The email you use to log in. Also where notifications are sent.'],
            ['Avatar', 'Your profile picture. Helps team members identify you.'],
            ['Timezone', 'Ensures timestamps show in your local time.'],
            ['Date Format', 'How dates display (MM/DD/YYYY, DD/MM/YYYY, etc.).'],
          ]}
        />
        <HelpTip>
          Make sure your timezone is correct! Otherwise, activity times will look wrong.
        </HelpTip>
      </HelpSection>

      {/* Preferences */}
      <HelpSection>
        <HelpHeading>Preferences</HelpHeading>
        <HelpParagraph>
          Go to <strong>Settings → Preferences</strong> for personal display preferences:
        </HelpParagraph>
        <HelpTable
          headers={['Setting', 'What It Does']}
          rows={[
            ['Theme', 'Light mode or Dark mode - pick what\'s easier on your eyes.'],
            ['Date/Time Format', 'Regional preferences for how dates and times display.'],
            ['Currency', 'Default currency symbol for prices and values (e.g., $, €, £).'],
            ['Notifications', 'What notifications you receive via email and push.'],
          ]}
        />
      </HelpSection>

      {/* Label Settings */}
      <HelpSection>
        <HelpHeading>Label Settings</HelpHeading>
        <HelpParagraph>
          Go to <strong>Settings → Labels</strong> to configure label printing defaults:
        </HelpParagraph>
        <HelpTable
          headers={['Setting', 'What It Does']}
          rows={[
            ['Default Label Size', 'The size that\'s pre-selected when you print labels.'],
            ['Default Barcode Format', 'QR Code, Code 128, etc. - what\'s pre-selected.'],
            ['Company Logo on Labels', 'Whether to include your logo on large labels.'],
          ]}
        />
        <HelpParagraph>
          Setting defaults saves time - you won&apos;t have to pick the same options every time
          you print.
        </HelpParagraph>
      </HelpSection>

      {/* Tax Settings */}
      <HelpSection>
        <HelpHeading>Tax Settings</HelpHeading>
        <HelpParagraph>
          Go to <strong>Settings → Taxes</strong> to configure sales tax:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>Define tax rates:</strong> Create different rates (e.g., 8% state tax, 0% for exempt items)
          </HelpListItem>
          <HelpListItem>
            <strong>Assign to categories:</strong> Apply different rates to different types of items
          </HelpListItem>
          <HelpListItem>
            <strong>Inclusive vs exclusive:</strong> Choose whether prices include tax or tax is added on top
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Feature Toggles */}
      <HelpSection>
        <HelpHeading>Feature Toggles</HelpHeading>
        <HelpParagraph>
          Go to <strong>Settings → Features</strong> to enable or disable features:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>Experimental features:</strong> Try new features before they&apos;re officially released
          </HelpListItem>
          <HelpListItem>
            <strong>Beta functionality:</strong> Access to features still being tested
          </HelpListItem>
        </HelpList>
        <HelpTip type="warning">
          Experimental features might have bugs or change without notice. Use them at your
          own discretion!
        </HelpTip>
      </HelpSection>

      {/* Settings Areas Summary */}
      <HelpSection>
        <HelpHeading>All Settings Areas</HelpHeading>
        <HelpParagraph>
          Here&apos;s a quick reference of all settings areas in StockZip:
        </HelpParagraph>
        <HelpTable
          headers={['Area', 'What You\'ll Find']}
          rows={[
            ['Company', 'Business name, logo, brand color, tax ID'],
            ['Profile', 'Your name, email, avatar, timezone'],
            ['Preferences', 'Theme, date format, currency, notifications'],
            ['Team', 'View and invite team members'],
            ['Labels', 'Default label sizes and formats'],
            ['Taxes', 'Tax rates and categories'],
            ['Features', 'Enable/disable experimental features'],
            ['Bulk Import', 'Import items from CSV/Excel'],
            ['Custom Fields', 'Create additional fields for items'],
            ['Integrations', 'Connect to other apps and services'],
            ['Billing', 'Subscription and payment information'],
          ]}
        />
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Settings Tips</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Set up early:</strong> Configure settings when you first start using StockZip.
            It&apos;s easier than changing things later.
          </HelpListItem>
          <HelpListItem>
            <strong>Use your logo:</strong> A professional touch that makes your labels look great.
          </HelpListItem>
          <HelpListItem>
            <strong>Set correct timezone:</strong> Important for accurate activity timestamps.
          </HelpListItem>
          <HelpListItem>
            <strong>Configure notifications:</strong> Turn on what you need, turn off what&apos;s noise.
            Don&apos;t let important alerts get lost.
          </HelpListItem>
          <HelpListItem>
            <strong>Review periodically:</strong> As your business changes, your settings might
            need updating too.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
