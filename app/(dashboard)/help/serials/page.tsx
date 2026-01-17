'use client'

import { Hash } from 'lucide-react'
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

export default function SerialsHelp() {
  return (
    <HelpArticleLayout
      title="Serial Number Tracking"
      description="Track individual units by unique serial numbers"
      icon={Hash}
      iconColor="bg-violet-50 text-violet-600"
      prevArticle={{ href: '/help/lots', title: 'Lot & Batch Tracking' }}
      nextArticle={{ href: '/help/reminders', title: 'Reminders & Alerts' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Serial number tracking lets you track each individual unit separately. Unlike lot
          tracking (which tracks batches), serial tracking gives each unit its own unique
          identity. This is perfect for high-value items, equipment, electronics, or anything
          where you need to know the exact history of each specific unit.
        </HelpParagraph>
      </HelpSection>

      {/* When to Use */}
      <HelpSection>
        <HelpHeading>When Should You Use Serial Numbers?</HelpHeading>
        <HelpParagraph>
          Serial tracking is best for:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>High-value items:</strong> Electronics, machinery, vehicles
          </HelpListItem>
          <HelpListItem>
            <strong>Items with warranties:</strong> Need to know exactly which unit for warranty claims
          </HelpListItem>
          <HelpListItem>
            <strong>Equipment you lend out:</strong> Know exactly which laptop went to which employee
          </HelpListItem>
          <HelpListItem>
            <strong>Items needing service:</strong> Track maintenance history per unit
          </HelpListItem>
          <HelpListItem>
            <strong>Theft-prone items:</strong> If something goes missing, you know exactly which one
          </HelpListItem>
        </HelpList>
        <HelpTip type="warning">
          Serial tracking requires more work - you need to enter a serial number for each unit.
          Only use it when you really need to track individual units.
        </HelpTip>
      </HelpSection>

      {/* Enabling Serial Tracking */}
      <HelpSection>
        <HelpHeading>How to Enable Serial Number Tracking</HelpHeading>
        <HelpSteps
          steps={[
            {
              title: 'Open the item you want to track by serial',
              description: 'Go to Inventory and click on the item.',
            },
            {
              title: 'Click Edit',
              description: 'Open the edit form.',
            },
            {
              title: 'Find "Tracking Mode"',
              description: 'This setting controls how the item is tracked.',
            },
            {
              title: 'Select "Serial Number"',
              description: 'This enables serial tracking for this item.',
            },
            {
              title: 'Save',
              description: 'Done! This item will now require serial numbers.',
            },
          ]}
        />
      </HelpSection>

      {/* Adding Serial Numbers */}
      <HelpSection>
        <HelpHeading>Adding Serial Numbers</HelpHeading>

        <HelpSubheading>When Receiving Goods</HelpSubheading>
        <HelpParagraph>
          The easiest way to add serials is during the receive process:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Start receiving a purchase order',
              description: 'Go to the PO and click "Receive Items".',
            },
            {
              title: 'For serial-tracked items, click the serial icon',
              description: 'You\'ll see a small icon next to the item.',
            },
            {
              title: 'Choose your entry method',
              description: 'Scan, type one at a time, or paste many at once.',
            },
            {
              title: 'Enter the serial numbers',
              description: 'Watch the progress bar show "X of Y serials entered".',
            },
            {
              title: 'Complete the receive',
              description: 'All serials are now in your inventory!',
            },
          ]}
        />

        <HelpSubheading>Entry Methods</HelpSubheading>
        <HelpTable
          headers={['Method', 'How It Works', 'Best For']}
          rows={[
            ['Scan', 'Scan each serial\'s barcode - field auto-focuses for continuous scanning', 'Fast entry when items have barcode labels'],
            ['Manual', 'Type serials one at a time, pressing Enter after each', 'When you don\'t have barcodes'],
            ['Bulk Paste', 'Paste a list of serials (comma or newline separated)', 'When you have a digital list from the vendor'],
          ]}
        />

        <HelpSubheading>Adding Serials Manually (Later)</HelpSubheading>
        <HelpParagraph>
          You can also add serials directly on the item page:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Open the item detail page',
              description: 'Click on the item.',
            },
            {
              title: 'Go to the "Serials" tab',
              description: 'This shows all serial numbers for this item.',
            },
            {
              title: 'Click "Add Serial"',
              description: 'Open the form to add a new serial.',
            },
            {
              title: 'Enter the serial number',
              description: 'Type the unique serial.',
            },
            {
              title: 'Add extra info (optional)',
              description: 'Condition, location, notes.',
            },
            {
              title: 'Save',
              description: 'The serial is now tracked!',
            },
          ]}
        />
      </HelpSection>

      {/* Serial Features */}
      <HelpSection>
        <HelpHeading>What You Can Track Per Serial</HelpHeading>
        <HelpParagraph>
          Each serial number can have its own:
        </HelpParagraph>
        <HelpTable
          headers={['Information', 'What It Means']}
          rows={[
            ['Serial Number', 'The unique identifier for this unit'],
            ['Condition', 'Is it good, damaged, or needs repair?'],
            ['Location', 'Where is this specific unit stored?'],
            ['Notes', 'Any notes specific to this unit'],
            ['Checkout Status', 'Is this unit checked out to someone?'],
            ['Full History', 'Every change, checkout, and return for this unit'],
          ]}
        />
      </HelpSection>

      {/* Duplicate Detection */}
      <HelpSection>
        <HelpHeading>Duplicate Detection</HelpHeading>
        <HelpParagraph>
          Serial numbers must be unique. If you try to enter a serial that already exists,
          StockZip will warn you. This prevents accidentally entering the same serial twice.
        </HelpParagraph>
        <HelpTip type="info">
          If you see a duplicate warning but the serial is new, check for typos. Or maybe
          the item was already received in a different shipment?
        </HelpTip>
      </HelpSection>

      {/* Checkout with Serials */}
      <HelpSection>
        <HelpHeading>Checking Out Serialized Items</HelpHeading>
        <HelpParagraph>
          When you check out a serial-tracked item, you pick which specific serials are
          going out:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            Open the item and click &quot;Check Out&quot;
          </HelpListItem>
          <HelpListItem>
            Select which serial numbers are being checked out
          </HelpListItem>
          <HelpListItem>
            When they return, those exact serials are checked back in
          </HelpListItem>
        </HelpList>
        <HelpParagraph>
          This way you know exactly which laptop John has, not just &quot;one of the laptops.&quot;
        </HelpParagraph>
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Tips for Serial Number Tracking</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Scan when possible:</strong> Scanning serials is much faster and more
            accurate than typing them manually.
          </HelpListItem>
          <HelpListItem>
            <strong>Enter serials at receiving:</strong> Don&apos;t let items sit around without
            serial numbers. Enter them right when they arrive.
          </HelpListItem>
          <HelpListItem>
            <strong>Keep condition updated:</strong> When an item gets damaged, update its
            condition. This helps track which units are usable.
          </HelpListItem>
          <HelpListItem>
            <strong>Use notes for unique issues:</strong> &quot;Battery replaced Jan 2024&quot; or
            &quot;Missing power cord&quot; - things specific to this unit.
          </HelpListItem>
          <HelpListItem>
            <strong>Check history when troubleshooting:</strong> If a unit has problems,
            look at its history. Has it been damaged? Who&apos;s had it?
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
