'use client'

import { ArrowLeftRight } from 'lucide-react'
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

export default function CheckoutsHelp() {
  return (
    <HelpArticleLayout
      title="Check-In / Check-Out (Asset Tracking)"
      description="Track items assigned to people, jobs, or locations"
      icon={ArrowLeftRight}
      iconColor="bg-pink-50 text-pink-600"
      prevArticle={{ href: '/help/stock-counts', title: 'Stock Counts' }}
      nextArticle={{ href: '/help/lots', title: 'Lot & Batch Tracking' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Check-out and check-in help you track items that are temporarily assigned to someone
          or something. Think of it like a library - you check out a book, use it, then return
          it. This works great for tools, equipment, laptops, keys, or anything that needs to
          come back.
        </HelpParagraph>
      </HelpSection>

      {/* Checking Out */}
      <HelpSection>
        <HelpHeading>Checking Out Items</HelpHeading>
        <HelpParagraph>
          When someone needs to take an item (like an employee borrowing a tool), here&apos;s how
          to check it out:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Open the item\'s detail page',
              description: 'Find the item in inventory and click on it.',
            },
            {
              title: 'Click "Check Out"',
              description: 'You\'ll find this button in the quick actions area.',
            },
            {
              title: 'Choose who or what it\'s assigned to',
              description: 'A person? A job/project? A location?',
            },
            {
              title: 'Set a due date (optional but recommended)',
              description: 'When should it be returned?',
            },
            {
              title: 'For serialized items, select which serial numbers',
              description: 'If the item has serial numbers, pick which specific units are going out.',
            },
            {
              title: 'Add notes (optional)',
              description: 'Any special information about this checkout.',
            },
            {
              title: 'Click "Confirm"',
              description: 'Done! The item is now checked out.',
            },
          ]}
        />
      </HelpSection>

      {/* Checkout Details */}
      <HelpSection>
        <HelpHeading>What to Enter When Checking Out</HelpHeading>
        <HelpTable
          headers={['Field', 'What It Means', 'Example']}
          rows={[
            ['Assign To', 'Who or what gets the item', 'John Smith, Project Alpha, Van #3'],
            ['Due Date', 'When it should come back', 'Next Friday, End of month'],
            ['Serial Numbers', 'Which specific units (for serialized items)', 'SN12345, SN12346'],
            ['Notes', 'Any extra information', 'Handle with care, needs calibration on return'],
          ]}
        />
      </HelpSection>

      {/* What Happens */}
      <HelpSection>
        <HelpHeading>What Happens When You Check Out</HelpHeading>
        <HelpParagraph>
          When an item is checked out:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>Item status changes to &quot;Checked Out&quot;</strong> - You can see at a glance
            that it&apos;s not available
          </HelpListItem>
          <HelpListItem>
            <strong>Assignment is visible</strong> - The item detail page shows who has it
          </HelpListItem>
          <HelpListItem>
            <strong>It appears in the checkout list</strong> - You can see all checked-out
            items in one place
          </HelpListItem>
          <HelpListItem>
            <strong>Reminder set (if due date given)</strong> - You&apos;ll get a notification
            24 hours before the due date
          </HelpListItem>
        </HelpList>
        <HelpTip type="info">
          Checked out items are still in your inventory - they&apos;re just marked as &quot;out.&quot;
          You can always see them by filtering by status.
        </HelpTip>
      </HelpSection>

      {/* Checking In */}
      <HelpSection>
        <HelpHeading>Checking In Items (Returns)</HelpHeading>
        <HelpParagraph>
          When an item comes back:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Find the item',
              description: 'Either open the item detail page, or go to your Checkouts list.',
            },
            {
              title: 'Click "Check In"',
              description: 'Mark that the item is being returned.',
            },
            {
              title: 'Record the return condition',
              description: 'Is the item in good shape?',
            },
            {
              title: 'Add return notes (optional)',
              description: 'Any observations about the item.',
            },
            {
              title: 'Click "Confirm"',
              description: 'The item is now back and available!',
            },
          ]}
        />
      </HelpSection>

      {/* Return Conditions */}
      <HelpSection>
        <HelpHeading>Recording Return Condition</HelpHeading>
        <HelpParagraph>
          When checking in, note the item&apos;s condition:
        </HelpParagraph>
        <HelpTable
          headers={['Condition', 'What It Means', 'What Happens']}
          rows={[
            ['Good', 'Item is fine, ready for use', 'Item returns to normal inventory'],
            ['Damaged', 'Item has damage but might be usable', 'Item flagged for attention'],
            ['Needs Repair', 'Item requires service before use', 'Item marked for repair'],
            ['Lost', 'Item was not returned', 'Quantity may be adjusted'],
          ]}
        />
      </HelpSection>

      {/* Overdue Items */}
      <HelpSection>
        <HelpHeading>Handling Overdue Items</HelpHeading>
        <HelpParagraph>
          When items are not returned by their due date:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>Items are flagged as &quot;Overdue&quot;</strong> - Easy to spot in the system
          </HelpListItem>
          <HelpListItem>
            <strong>Dashboard shows overdue count</strong> - You&apos;ll see it every time you log in
          </HelpListItem>
          <HelpListItem>
            <strong>Notifications are sent</strong> - Both you and the person who has the item
            get reminders
          </HelpListItem>
        </HelpList>
        <HelpTip>
          Set realistic due dates! If something is typically needed for a week, don&apos;t set
          a one-day due date. You&apos;ll just get unnecessary overdue alerts.
        </HelpTip>
      </HelpSection>

      {/* Checkout History */}
      <HelpSection>
        <HelpHeading>Viewing Checkout History</HelpHeading>
        <HelpParagraph>
          Every item keeps a complete history of all its checkouts:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Who had it and when</HelpListItem>
          <HelpListItem>How long they had it</HelpListItem>
          <HelpListItem>What condition it was returned in</HelpListItem>
          <HelpListItem>Any notes recorded at checkout or return</HelpListItem>
        </HelpList>
        <HelpParagraph>
          This is useful for:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Seeing who last had an item</HelpListItem>
          <HelpListItem>Understanding usage patterns</HelpListItem>
          <HelpListItem>Tracking when damage occurred</HelpListItem>
          <HelpListItem>Accountability</HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Tips for Effective Checkouts</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Always set due dates:</strong> Without a due date, StockZip can&apos;t remind
            anyone to return items.
          </HelpListItem>
          <HelpListItem>
            <strong>Check condition on return:</strong> This helps catch damage early and
            know who was responsible.
          </HelpListItem>
          <HelpListItem>
            <strong>Use serial numbers for valuable items:</strong> Track exactly which unit
            is checked out, not just &quot;one of the laptops.&quot;
          </HelpListItem>
          <HelpListItem>
            <strong>Follow up on overdue items:</strong> Don&apos;t let things stay overdue. Reach
            out and get them back!
          </HelpListItem>
          <HelpListItem>
            <strong>Use notes:</strong> &quot;Charger included&quot; or &quot;Missing battery cover&quot; helps
            prevent disputes later.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
