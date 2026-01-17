'use client'

import { ClipboardList } from 'lucide-react'
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

export default function PickListsHelp() {
  return (
    <HelpArticleLayout
      title="Pick Lists & Fulfillment"
      description="Gather items to fulfill orders"
      icon={ClipboardList}
      iconColor="bg-orange-50 text-orange-600"
      prevArticle={{ href: '/help/purchase-orders', title: 'Purchase Orders' }}
      nextArticle={{ href: '/help/stock-counts', title: 'Stock Counts' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          A pick list is like a shopping list for your warehouse. When you need to gather items
          for an order, project, or shipment, create a pick list. It tells you (or your team)
          exactly what to grab and from where. When items are picked, your inventory is
          automatically updated.
        </HelpParagraph>
      </HelpSection>

      {/* Creating a Pick List */}
      <HelpSection>
        <HelpHeading>Creating a Pick List</HelpHeading>
        <HelpSteps
          steps={[
            {
              title: 'Go to Tasks → Pick Lists',
              description: 'Click "Tasks" in the sidebar, then "Pick Lists".',
            },
            {
              title: 'Click "+ New Pick List"',
              description: 'Start a new pick list.',
            },
            {
              title: 'Add items and quantities',
              description: 'Search for items and enter how many you need to pick.',
            },
            {
              title: 'Set what happens after picking',
              description: 'Choose the "item outcome" - what should happen to items after they\'re picked?',
            },
            {
              title: 'Assign to someone (optional)',
              description: 'Choose who will do the picking.',
            },
            {
              title: 'Set a due date (optional)',
              description: 'When should picking be completed?',
            },
            {
              title: 'Save the pick list',
              description: 'It\'s ready to be worked on!',
            },
          ]}
        />
      </HelpSection>

      {/* Pick List Fields */}
      <HelpSection>
        <HelpHeading>Pick List Details</HelpHeading>
        <HelpTable
          headers={['Field', 'What It Means']}
          rows={[
            ['Items', 'The items and quantities that need to be picked'],
            ['Ship To', 'Where are these items going? (Customer address)'],
            ['Item Outcome', 'What happens to inventory after picking? (See below)'],
            ['Assign To', 'Which team member will do the picking?'],
            ['Due Date', 'When should picking be finished?'],
            ['Notes', 'Special instructions for the picker'],
          ]}
        />
      </HelpSection>

      {/* Item Outcomes */}
      <HelpSection>
        <HelpHeading>What Happens to Items After Picking?</HelpHeading>
        <HelpParagraph>
          The &quot;Item Outcome&quot; tells StockZip what to do with items once they&apos;re picked:
        </HelpParagraph>
        <HelpTable
          headers={['Outcome', 'What It Does', 'Example Use']}
          rows={[
            ['Decrement', 'Subtracts the picked quantity from inventory', 'Shipping orders to customers - items leave your warehouse'],
            ['Checkout', 'Marks items as checked out to someone/something', 'Lending equipment to an employee or job site'],
            ['Transfer', 'Moves items to a different location', 'Restocking shelves from back storage'],
          ]}
        />
        <HelpTip>
          Most of the time, you&apos;ll use &quot;Decrement&quot; for customer orders. Use &quot;Checkout&quot; when items
          will come back (like tools). Use &quot;Transfer&quot; when items stay in your inventory but move locations.
        </HelpTip>
      </HelpSection>

      {/* Picking Process */}
      <HelpSection>
        <HelpHeading>How to Pick Items</HelpHeading>
        <HelpParagraph>
          Once a pick list is created, here&apos;s how to work through it:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Open the pick list',
              description: 'Find it in Tasks → Pick Lists and click to open.',
            },
            {
              title: 'See what needs picking',
              description: 'Each item shows: name, location (where to find it), and quantity needed.',
            },
            {
              title: 'Go get the items',
              description: 'Walk to the location shown and find the items.',
            },
            {
              title: 'Mark items as picked',
              description: 'Click on the item (or scan its barcode) and enter how many you picked.',
            },
            {
              title: 'Watch the progress bar',
              description: 'It shows how much of the pick list is complete.',
            },
            {
              title: 'Click "Complete" when done',
              description: 'This finishes the pick list and updates inventory.',
            },
          ]}
        />
      </HelpSection>

      {/* Partial Picking */}
      <HelpSection>
        <HelpHeading>What If You Can&apos;t Pick Everything?</HelpHeading>
        <HelpParagraph>
          Sometimes you can&apos;t find all the items, or there aren&apos;t enough in stock. No problem:
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>
            Pick what you can find
          </HelpListItem>
          <HelpListItem>
            Enter the actual quantity you picked (even if it&apos;s less than requested)
          </HelpListItem>
          <HelpListItem>
            The remaining items stay on the list
          </HelpListItem>
          <HelpListItem>
            Click &quot;Complete Partial&quot; to finish with what you have
          </HelpListItem>
        </HelpList>
        <HelpTip type="info">
          The system will note that this was a partial fulfillment. You can create another
          pick list later for the remaining items.
        </HelpTip>
      </HelpSection>

      {/* Pick List Status */}
      <HelpSection>
        <HelpHeading>Pick List Status</HelpHeading>
        <HelpTable
          headers={['Status', 'What It Means']}
          rows={[
            ['Draft', 'Pick list is being created, not ready yet'],
            ['Assigned', 'Ready to pick, assigned to someone'],
            ['In Progress', 'Picking has started'],
            ['Completed', 'All items have been picked'],
            ['Cancelled', 'Pick list was cancelled'],
          ]}
        />
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Tips for Efficient Picking</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Organize items by location:</strong> Pick lists show where each item is.
            Group your picks by location to avoid walking back and forth.
          </HelpListItem>
          <HelpListItem>
            <strong>Use barcode scanning:</strong> Scanning is faster and more accurate than
            typing. Scan each item as you pick it.
          </HelpListItem>
          <HelpListItem>
            <strong>Assign picks to the right person:</strong> If someone works in a specific
            area, give them picks from that area.
          </HelpListItem>
          <HelpListItem>
            <strong>Set realistic due dates:</strong> This helps prioritize work when there
            are multiple pick lists waiting.
          </HelpListItem>
          <HelpListItem>
            <strong>Add notes for special handling:</strong> If items need to be wrapped
            carefully or have other special needs, put it in the notes.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
