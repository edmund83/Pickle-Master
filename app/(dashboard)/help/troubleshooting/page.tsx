'use client'

import { LifeBuoy } from 'lucide-react'
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

export default function TroubleshootingHelp() {
  return (
    <HelpArticleLayout
      title="Troubleshooting & FAQ"
      description="Fix common problems and find answers"
      icon={LifeBuoy}
      iconColor="bg-red-50 text-red-600"
      prevArticle={{ href: '/help/shortcuts', title: 'Keyboard Shortcuts' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Having trouble with something? You&apos;re in the right place! This guide covers the most
          common issues people run into and how to fix them. If you can&apos;t find your answer here,
          contact our support team - we&apos;re happy to help!
        </HelpParagraph>
      </HelpSection>

      {/* Syncing Issues */}
      <HelpSection>
        <HelpHeading>Items Aren&apos;t Syncing</HelpHeading>
        <HelpParagraph>
          <strong>What&apos;s happening:</strong> Changes you make don&apos;t seem to be saving, or you
          don&apos;t see changes made by others.
        </HelpParagraph>
        <HelpParagraph>
          <strong>Try these fixes:</strong>
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>
            <strong>Check if you&apos;re offline:</strong> Look for an &quot;Offline&quot; banner at the top.
            If you see it, wait for your internet to reconnect.
          </HelpListItem>
          <HelpListItem>
            <strong>Pull to refresh:</strong> On mobile, swipe down on any list. On desktop,
            click the refresh button or press F5.
          </HelpListItem>
          <HelpListItem>
            <strong>Check your internet:</strong> Can you load other websites? If not, the
            problem is your connection, not StockZip.
          </HelpListItem>
          <HelpListItem>
            <strong>Log out and back in:</strong> If all else fails, sign out and sign back in.
            This forces a fresh sync.
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Scanner Issues */}
      <HelpSection>
        <HelpHeading>Barcode Scanner Isn&apos;t Working</HelpHeading>
        <HelpParagraph>
          <strong>What&apos;s happening:</strong> The camera won&apos;t open, or it doesn&apos;t read barcodes.
        </HelpParagraph>
        <HelpParagraph>
          <strong>Try these fixes:</strong>
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>
            <strong>Check camera permission:</strong> Your browser or phone might have blocked
            camera access. Go to settings and allow StockZip to use your camera.
          </HelpListItem>
          <HelpListItem>
            <strong>Improve the lighting:</strong> Scanning works best in good light. Move to
            a brighter area or turn on lights.
          </HelpListItem>
          <HelpListItem>
            <strong>Hold steady:</strong> Keep your phone still. Shaky hands make it hard to
            read barcodes.
          </HelpListItem>
          <HelpListItem>
            <strong>Find the right distance:</strong> Too close or too far won&apos;t work. Try
            6-12 inches (15-30 cm) away.
          </HelpListItem>
          <HelpListItem>
            <strong>Clean your camera:</strong> A smudged lens can cause problems. Wipe it clean.
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Import Issues */}
      <HelpSection>
        <HelpHeading>Import Is Failing</HelpHeading>
        <HelpParagraph>
          <strong>What&apos;s happening:</strong> You&apos;re trying to import a CSV but it&apos;s not working.
        </HelpParagraph>
        <HelpParagraph>
          <strong>Try these fixes:</strong>
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>
            <strong>Check required fields:</strong> Every row needs at least a Name and Quantity.
            Make sure no rows are missing these.
          </HelpListItem>
          <HelpListItem>
            <strong>Use the template:</strong> Download StockZip&apos;s template CSV to see the
            exact format needed.
          </HelpListItem>
          <HelpListItem>
            <strong>Check for special characters:</strong> Strange characters in column headers
            can cause issues. Keep headers simple.
          </HelpListItem>
          <HelpListItem>
            <strong>Check file size:</strong> Maximum is 50,000 rows. Split larger files.
          </HelpListItem>
          <HelpListItem>
            <strong>Download the error report:</strong> After a failed import, download the
            error report to see exactly which rows failed and why.
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Alert Issues */}
      <HelpSection>
        <HelpHeading>Low Stock Alerts Not Triggering</HelpHeading>
        <HelpParagraph>
          <strong>What&apos;s happening:</strong> Items are low but you&apos;re not getting alerts.
        </HelpParagraph>
        <HelpParagraph>
          <strong>Try these fixes:</strong>
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>
            <strong>Check min_quantity:</strong> Make sure you&apos;ve set a minimum stock level
            on the item. Without this, StockZip doesn&apos;t know what &quot;low&quot; means.
          </HelpListItem>
          <HelpListItem>
            <strong>Create a reminder:</strong> Have you set up a Low Stock reminder for this
            item? Just having a min_quantity isn&apos;t enough - you also need a reminder.
          </HelpListItem>
          <HelpListItem>
            <strong>Check notification settings:</strong> Make sure notifications are enabled
            in your profile settings.
          </HelpListItem>
          <HelpListItem>
            <strong>Check email spam:</strong> Email notifications might be going to your spam
            folder.
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Team Changes */}
      <HelpSection>
        <HelpHeading>Can&apos;t See Other Team Members&apos; Changes</HelpHeading>
        <HelpParagraph>
          <strong>What&apos;s happening:</strong> A colleague made changes but you don&apos;t see them.
        </HelpParagraph>
        <HelpParagraph>
          <strong>Try these fixes:</strong>
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>
            <strong>Wait a moment:</strong> Changes sync in real-time but might take 2-3 seconds
            to appear.
          </HelpListItem>
          <HelpListItem>
            <strong>Pull to refresh:</strong> Swipe down on mobile or click refresh on desktop.
          </HelpListItem>
          <HelpListItem>
            <strong>Check your internet:</strong> Both you and your colleague need to be online
            for changes to sync.
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Checked Out Items */}
      <HelpSection>
        <HelpHeading>Checked Out Items Missing from Inventory</HelpHeading>
        <HelpParagraph>
          <strong>What&apos;s happening:</strong> Items you checked out aren&apos;t showing in inventory.
        </HelpParagraph>
        <HelpParagraph>
          <strong>What&apos;s actually going on:</strong> They&apos;re not missing! Checked out items are
          still in your inventory - they&apos;re just filtered out by default.
        </HelpParagraph>
        <HelpParagraph>
          <strong>How to see them:</strong> Use the Status filter and select &quot;Checked Out&quot; to
          view all checked out items.
        </HelpParagraph>
      </HelpSection>

      {/* PO Status */}
      <HelpSection>
        <HelpHeading>Purchase Order Stuck in Wrong Status</HelpHeading>
        <HelpParagraph>
          <strong>What&apos;s happening:</strong> A purchase order is in a status you can&apos;t change.
        </HelpParagraph>
        <HelpParagraph>
          <strong>Understanding PO status:</strong> Only draft orders can be freely edited. Once
          submitted, orders follow a specific workflow. This is intentional - it prevents
          accidental changes to orders that have been sent to vendors.
        </HelpParagraph>
        <HelpParagraph>
          <strong>What to do:</strong> If you need to make changes to a submitted order, ask
          an admin to cancel it. Then create a new order with the correct information.
        </HelpParagraph>
      </HelpSection>

      {/* Getting Help */}
      <HelpSection>
        <HelpHeading>Getting More Help</HelpHeading>
        <HelpParagraph>
          If you can&apos;t solve your problem with the tips above, here&apos;s how to get help:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>In-App Help:</strong> Click the Help icon in the navigation to access these
            guides anytime
          </HelpListItem>
          <HelpListItem>
            <strong>Ask Zoe:</strong> Our AI assistant can answer quick questions. Look for the
            chat bubble.
          </HelpListItem>
          <HelpListItem>
            <strong>Email Support:</strong> Contact support@stockzip.com - we typically respond
            within 24 hours
          </HelpListItem>
          <HelpListItem>
            <strong>Report Issues:</strong> Found a bug? Report it at our GitHub repository
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Performance Tips */}
      <HelpSection>
        <HelpHeading>Tips for Best Performance</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Use barcode scanning:</strong> It&apos;s the fastest way to enter data accurately
          </HelpListItem>
          <HelpListItem>
            <strong>Set up reminders:</strong> Let StockZip watch stock levels for you instead
            of checking manually
          </HelpListItem>
          <HelpListItem>
            <strong>Use bulk operations:</strong> When making many changes, use bulk import or
            bulk edit features
          </HelpListItem>
          <HelpListItem>
            <strong>Save frequent searches:</strong> One click is better than setting up filters
            every time
          </HelpListItem>
          <HelpListItem>
            <strong>Assign checkouts:</strong> Always track who has what - it prevents confusion
          </HelpListItem>
          <HelpListItem>
            <strong>Link items to vendors:</strong> This powers smart reordering and saves time
            on purchase orders
          </HelpListItem>
          <HelpListItem>
            <strong>Use folders:</strong> Good organization makes everything easier, especially
            with large inventories
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
