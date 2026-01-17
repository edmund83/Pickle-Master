'use client'

import { RefreshCw } from 'lucide-react'
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

export default function ReorderHelp() {
  return (
    <HelpArticleLayout
      title="Auto-Reorder Suggestions"
      description="StockZip tells you what to order and when"
      icon={RefreshCw}
      iconColor="bg-sky-50 text-sky-600"
      prevArticle={{ href: '/help/reminders', title: 'Reminders & Alerts' }}
      nextArticle={{ href: '/help/vendors', title: 'Vendors & Partners' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Auto-reorder suggestions are like a smart assistant that watches your inventory and
          tells you what needs to be ordered. Instead of checking every item manually, StockZip
          automatically identifies items that are running low and even groups them by vendor
          so you can place orders efficiently.
        </HelpParagraph>
      </HelpSection>

      {/* How to Access */}
      <HelpSection>
        <HelpHeading>Finding Reorder Suggestions</HelpHeading>
        <HelpSteps
          steps={[
            {
              title: 'Go to Tasks → Reorder Suggestions',
              description: 'Click "Tasks" in the sidebar, then "Reorder Suggestions".',
            },
            {
              title: 'See items that need reordering',
              description: 'StockZip shows items grouped by urgency and vendor.',
            },
          ]}
        />
      </HelpSection>

      {/* How It Works */}
      <HelpSection>
        <HelpHeading>How Suggestions Are Generated</HelpHeading>
        <HelpParagraph>
          StockZip identifies items that need reordering by checking:
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>
            <strong>Below Reorder Point:</strong> If you set a &quot;reorder point&quot; on an item and
            the quantity hits that level, it appears in suggestions.
          </HelpListItem>
          <HelpListItem>
            <strong>Below Minimum Quantity:</strong> If no reorder point is set, StockZip uses
            the minimum stock level you defined.
          </HelpListItem>
          <HelpListItem>
            <strong>Out of Stock:</strong> Items with zero quantity are always shown as critical.
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Urgency Levels */}
      <HelpSection>
        <HelpHeading>Urgency Levels</HelpHeading>
        <HelpParagraph>
          Suggestions are color-coded by how urgent they are:
        </HelpParagraph>
        <HelpTable
          headers={['Level', 'Color', 'What It Means']}
          rows={[
            ['Critical', 'Red', 'OUT OF STOCK! You\'ve run out. Order immediately!'],
            ['Urgent', 'Orange', 'Below your minimum level. Order soon before you run out.'],
            ['Reorder', 'Yellow', 'At or below reorder point. Time to place an order.'],
          ]}
        />
        <HelpTip type="warning">
          Pay attention to red (Critical) items! These mean you&apos;re already out of stock and
          might be losing sales or disappointing customers.
        </HelpTip>
      </HelpSection>

      {/* Vendor Grouping */}
      <HelpSection>
        <HelpHeading>Suggestions Grouped by Vendor</HelpHeading>
        <HelpParagraph>
          One of the best features: suggestions are grouped by vendor! This helps you:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            See all items you need to order from each supplier in one place
          </HelpListItem>
          <HelpListItem>
            Know the estimated total for each vendor
          </HelpListItem>
          <HelpListItem>
            Create a purchase order with one click
          </HelpListItem>
        </HelpList>
        <HelpTip type="success">
          To make vendor grouping work, you need to link items to their vendors. See the
          &quot;Vendors &amp; Partners&quot; help page to learn how.
        </HelpTip>
      </HelpSection>

      {/* Creating PO from Suggestions */}
      <HelpSection>
        <HelpHeading>Creating a Purchase Order from Suggestions</HelpHeading>
        <HelpSteps
          steps={[
            {
              title: 'Review items grouped by vendor',
              description: 'See what needs to be ordered from each supplier.',
            },
            {
              title: 'Click "Create PO" for a vendor',
              description: 'Start a purchase order for that vendor\'s items.',
            },
            {
              title: 'Review the draft PO',
              description: 'StockZip fills in the vendor, items, suggested quantities, and costs.',
            },
            {
              title: 'Adjust if needed',
              description: 'Change quantities, add other items, or remove things you don\'t need.',
            },
            {
              title: 'Submit the order',
              description: 'Send it to your vendor!',
            },
          ]}
        />
      </HelpSection>

      {/* Setting Up Reorder Points */}
      <HelpSection>
        <HelpHeading>Setting Up Reorder Points</HelpHeading>
        <HelpParagraph>
          For the best suggestions, set up reorder information on each item:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Edit the item',
              description: 'Open the item and click Edit.',
            },
            {
              title: 'Set the Reorder Point',
              description: 'This is when StockZip suggests reordering. Think about lead time - if it takes 2 weeks to get more, set the point high enough.',
            },
            {
              title: 'Set the Reorder Quantity',
              description: 'How many to order when reordering. This shows as the suggested quantity.',
            },
            {
              title: 'Link to a Preferred Vendor',
              description: 'Which vendor do you usually buy this from? This enables vendor grouping.',
            },
            {
              title: 'Save',
              description: 'The item is now set up for smart reorder suggestions!',
            },
          ]}
        />
      </HelpSection>

      {/* Example */}
      <HelpSection>
        <HelpHeading>Example: Setting Up Widget Reorder</HelpHeading>
        <HelpParagraph>
          Let&apos;s say you sell widgets and want to make sure you never run out:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>Current quantity:</strong> 50 widgets
          </HelpListItem>
          <HelpListItem>
            <strong>You sell:</strong> About 10 widgets per week
          </HelpListItem>
          <HelpListItem>
            <strong>Vendor lead time:</strong> 2 weeks to receive an order
          </HelpListItem>
        </HelpList>
        <HelpParagraph>
          Good settings might be:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>Reorder Point: 25</strong> (enough to last 2.5 weeks while you wait for more)
          </HelpListItem>
          <HelpListItem>
            <strong>Reorder Quantity: 40</strong> (a month&apos;s supply)
          </HelpListItem>
        </HelpList>
        <HelpParagraph>
          When quantity drops to 25, StockZip suggests ordering 40 more from your preferred vendor!
        </HelpParagraph>
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Tips for Better Reorder Management</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Link items to vendors:</strong> This is key! Without vendor links, items
            show as &quot;unassigned&quot; and you lose the grouping benefits.
          </HelpListItem>
          <HelpListItem>
            <strong>Include lead time in reorder points:</strong> If it takes 2 weeks to get
            stock, your reorder point needs to cover 2+ weeks of sales.
          </HelpListItem>
          <HelpListItem>
            <strong>Check suggestions regularly:</strong> Make it a habit to review suggestions
            weekly (or daily if you have high-volume items).
          </HelpListItem>
          <HelpListItem>
            <strong>Don&apos;t ignore yellows:</strong> Yellow (Reorder) is when you should act.
            If you wait until red (Critical), you&apos;re already out of stock.
          </HelpListItem>
          <HelpListItem>
            <strong>Adjust based on experience:</strong> If you&apos;re always running out before
            the order arrives, increase your reorder point.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
