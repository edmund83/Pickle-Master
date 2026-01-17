'use client'

import { Layers } from 'lucide-react'
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

export default function LotsHelp() {
  return (
    <HelpArticleLayout
      title="Lot & Batch Tracking"
      description="Track items by batch, expiry date, and production date"
      icon={Layers}
      iconColor="bg-lime-50 text-lime-600"
      prevArticle={{ href: '/help/checkouts', title: 'Check-In / Check-Out' }}
      nextArticle={{ href: '/help/serials', title: 'Serial Numbers' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Lot tracking (also called batch tracking) helps you track groups of items that were
          made or received together. This is especially important for items that expire - like
          food, medicine, or chemicals. With lot tracking, you know exactly which batch to use
          first and can trace problems back to specific batches if something goes wrong.
        </HelpParagraph>
      </HelpSection>

      {/* When to Use */}
      <HelpSection>
        <HelpHeading>When Should You Use Lot Tracking?</HelpHeading>
        <HelpParagraph>
          Lot tracking is helpful when:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>Items have expiry dates:</strong> Food, medicine, cosmetics, chemicals
          </HelpListItem>
          <HelpListItem>
            <strong>You need to recall products:</strong> If a batch has a problem, you can
            find exactly which customers got it
          </HelpListItem>
          <HelpListItem>
            <strong>Quality varies by batch:</strong> You want to track which batch performed
            well or poorly
          </HelpListItem>
          <HelpListItem>
            <strong>Regulations require it:</strong> Many industries (food, pharma) must
            track by lot for legal reasons
          </HelpListItem>
        </HelpList>
        <HelpTip>
          If your items don&apos;t expire and you don&apos;t need to trace back to specific batches,
          you probably don&apos;t need lot tracking. Keep it simple!
        </HelpTip>
      </HelpSection>

      {/* Enabling Lot Tracking */}
      <HelpSection>
        <HelpHeading>How to Enable Lot Tracking</HelpHeading>
        <HelpParagraph>
          Lot tracking is set up per item (not for your whole inventory). Here&apos;s how:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Open the item you want to track by lot',
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
              title: 'Select "Lot/Batch"',
              description: 'This enables lot tracking for this item.',
            },
            {
              title: 'Save',
              description: 'Done! This item will now be tracked by lot.',
            },
          ]}
        />
      </HelpSection>

      {/* Creating Lots */}
      <HelpSection>
        <HelpHeading>Creating Lots</HelpHeading>
        <HelpParagraph>
          Lots are typically created when you receive inventory. Here&apos;s what you enter:
        </HelpParagraph>
        <HelpTable
          headers={['Field', 'What It Means', 'Example']}
          rows={[
            ['Lot Number', 'Your reference code for this batch', 'LOT-2024-001'],
            ['Batch Code', 'The manufacturer\'s batch code (from their label)', 'MFG-ABC123'],
            ['Expiry Date', 'When this batch expires', 'December 31, 2024'],
            ['Manufactured Date', 'When it was made (optional)', 'January 15, 2024'],
            ['Quantity', 'How many units in this lot', '100'],
          ]}
        />
        <HelpTip type="success">
          You create lots when receiving items. During the &quot;Receive&quot; process for a purchase
          order, you&apos;ll be asked for lot information for lot-tracked items.
        </HelpTip>
      </HelpSection>

      {/* Viewing Lots */}
      <HelpSection>
        <HelpHeading>Viewing Lots for an Item</HelpHeading>
        <HelpParagraph>
          To see all lots for an item:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Open the item\'s detail page',
              description: 'Click on the item in inventory.',
            },
            {
              title: 'Find the "Lots" tab',
              description: 'This shows all lots for this item.',
            },
            {
              title: 'Review the lot information',
              description: 'You\'ll see each lot\'s quantity, expiry date, and status.',
            },
          ]}
        />
      </HelpSection>

      {/* Lot Status */}
      <HelpSection>
        <HelpHeading>Lot Status</HelpHeading>
        <HelpParagraph>
          Each lot has a status that tells you if it can be used:
        </HelpParagraph>
        <HelpTable
          headers={['Status', 'What It Means', 'Can You Use It?']}
          rows={[
            ['Active', 'Lot is available for normal use', 'Yes'],
            ['Expired', 'Past the expiry date', 'No - should not be used'],
            ['Depleted', 'Quantity reached zero (all used up)', 'No - empty'],
            ['Blocked', 'Manually blocked (maybe for quality check)', 'No - until unblocked'],
          ]}
        />
      </HelpSection>

      {/* FEFO */}
      <HelpSection>
        <HelpHeading>FEFO: First Expired, First Out</HelpHeading>
        <HelpParagraph>
          FEFO means using items with the earliest expiry date first. Think about milk at
          the grocery store - the older milk is in front so it sells first.
        </HelpParagraph>
        <HelpParagraph>
          StockZip helps with FEFO automatically:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>Suggests the oldest lot first</strong> when you pick items
          </HelpListItem>
          <HelpListItem>
            <strong>Alerts you about lots expiring soon</strong> so you can use them
          </HelpListItem>
          <HelpListItem>
            <strong>Tracks which lot was used</strong> for each transaction
          </HelpListItem>
        </HelpList>
        <HelpTip>
          FEFO prevents waste! Use items before they expire instead of letting them go bad
          while newer items get used first.
        </HelpTip>
      </HelpSection>

      {/* Expiry Alerts */}
      <HelpSection>
        <HelpHeading>Getting Alerts About Expiring Lots</HelpHeading>
        <HelpParagraph>
          StockZip can warn you when lots are about to expire:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            Set up expiry reminders (see the Reminders & Alerts help page)
          </HelpListItem>
          <HelpListItem>
            Check the &quot;Expiring Items&quot; report in Reports
          </HelpListItem>
          <HelpListItem>
            Lots approaching expiry are highlighted in the lot list
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Tips for Lot Tracking</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Enter lot info when receiving:</strong> Don&apos;t skip this! It&apos;s much harder
            to add lot information later.
          </HelpListItem>
          <HelpListItem>
            <strong>Use consistent lot number formats:</strong> Something like &quot;LOT-2024-001&quot;
            makes lots easy to find and sort.
          </HelpListItem>
          <HelpListItem>
            <strong>Check expiry dates regularly:</strong> Run the expiring items report
            weekly to catch things before they go bad.
          </HelpListItem>
          <HelpListItem>
            <strong>Use FEFO:</strong> Always pick from the oldest lots first. StockZip
            helps by suggesting the right lot.
          </HelpListItem>
          <HelpListItem>
            <strong>Block problem lots:</strong> If you suspect a quality issue, block the
            lot while you investigate. This prevents it from being used.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
