'use client'

import { Package } from 'lucide-react'
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

export default function ItemsHelp() {
  return (
    <HelpArticleLayout
      title="Managing Inventory Items"
      description="Add, edit, and organize the things you track"
      icon={Package}
      iconColor="bg-purple-50 text-purple-600"
      prevArticle={{ href: '/help/dashboard', title: 'Dashboard Overview' }}
      nextArticle={{ href: '/help/folders', title: 'Organizing with Folders' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Items are the heart of StockZip - they&apos;re the things you&apos;re tracking. An item could be
          anything: a product you sell, a tool you lend out, supplies you use, parts you keep in
          stock, or equipment you manage. This guide shows you how to add, edit, and manage your items.
        </HelpParagraph>
      </HelpSection>

      {/* Adding a New Item - Quick Add */}
      <HelpSection>
        <HelpHeading>Adding a New Item</HelpHeading>

        <HelpSubheading>The Quick Way (Less Than 10 Seconds)</HelpSubheading>
        <HelpParagraph>
          Need to add an item fast? Here&apos;s the quickest way:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Click the "+ New Item" button',
              description: 'You\'ll find this button at the top of the Inventory page. You can also use the keyboard shortcut Ctrl+N (or ⌘N on Mac).',
            },
            {
              title: 'Type the item name',
              description: 'What do you call this item? For example: "Red Widget" or "10mm Bolt"',
            },
            {
              title: 'Enter the quantity',
              description: 'How many do you have right now? Type a number like 50 or 100.',
            },
            {
              title: 'Click Save',
              description: 'That\'s it! Your item is now in the system.',
            },
          ]}
        />
        <HelpTip type="success">
          You can always add more details later. Don&apos;t let the form slow you down - get the basics in first!
        </HelpTip>
      </HelpSection>

      {/* Full Item Details */}
      <HelpSection>
        <HelpSubheading>Adding All the Details</HelpSubheading>
        <HelpParagraph>
          Want to add more information? Here are all the fields you can fill in:
        </HelpParagraph>
        <HelpTable
          headers={['Field', 'What It Means', 'Example']}
          rows={[
            ['Name', 'What you call this item (required)', 'Red Widget'],
            ['Quantity', 'How many you have (required)', '50'],
            ['SKU/ID', 'A unique code for this item. StockZip can create one for you automatically, or you can type your own.', 'WID-001'],
            ['Barcode', 'The barcode number if the item has one (like a UPC code on products you buy)', '012345678905'],
            ['Category/Folder', 'Where does this item belong? Pick a folder to organize it.', 'Warehouse A / Shelf 3'],
            ['Photo', 'Take a picture or upload one. Photos help you identify items quickly!', '(upload an image)'],
            ['Description', 'More details about the item - size, color, specifications, etc.', 'Red painted steel widget, 50mm diameter'],
            ['Notes', 'Private notes for your team - these don\'t show on labels or reports', 'Reorder from Acme Co, takes 2 weeks'],
            ['Min Stock Level', 'When the quantity drops below this number, StockZip will warn you', '10'],
            ['Unit Cost', 'How much you pay for each one', '$5.00'],
            ['Selling Price', 'How much you charge customers', '$8.00'],
            ['Tags', 'Keywords to help you find things. Separate multiple tags with commas.', 'red, metal, outdoor'],
          ]}
        />
      </HelpSection>

      {/* Editing Items */}
      <HelpSection>
        <HelpHeading>Editing Items</HelpHeading>
        <HelpParagraph>
          Need to change something? There are two ways to edit:
        </HelpParagraph>

        <HelpSubheading>Quick Edits (Right from the List)</HelpSubheading>
        <HelpParagraph>
          For fast quantity changes:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>Click the quantity number</strong> in the list view. You can type a new number directly.
          </HelpListItem>
          <HelpListItem>
            <strong>Use the +1 and -1 buttons</strong> to quickly add or remove one unit. Great for quick counts!
          </HelpListItem>
        </HelpList>

        <HelpSubheading>Full Edit (Change Anything)</HelpSubheading>
        <HelpParagraph>
          To change any field:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Click on the item name',
              description: 'This opens the item\'s detail page where you can see everything about it.',
            },
            {
              title: 'Click the Edit button',
              description: 'You\'ll find it near the top of the page.',
            },
            {
              title: 'Make your changes',
              description: 'Change any field you want - name, quantity, price, etc.',
            },
            {
              title: 'Changes save automatically',
              description: 'As soon as you move to another field, your change is saved. No need to click a save button!',
            },
          ]}
        />
      </HelpSection>

      {/* Quick Actions */}
      <HelpSection>
        <HelpHeading>Quick Actions on the Item Page</HelpHeading>
        <HelpParagraph>
          When you open an item&apos;s detail page, you&apos;ll see some quick action buttons. Here&apos;s what they do:
        </HelpParagraph>
        <HelpTable
          headers={['Button', 'What It Does']}
          rows={[
            ['+1 / -1 Buttons', 'Instantly add or remove one unit. Click multiple times to adjust by more.'],
            ['Set Quantity', 'Opens a box where you can type an exact number. Use this when the quantity changed significantly.'],
            ['Print Label', 'Create a label with a QR code or barcode for this item. Stick it on a shelf or the item itself!'],
            ['Check Out', 'Assign this item to a person, job, or location. Useful for tracking who has what.'],
            ['View History', 'See every change ever made to this item - who changed it, when, and what they changed.'],
          ]}
        />
      </HelpSection>

      {/* Deleting Items */}
      <HelpSection>
        <HelpHeading>Deleting Items</HelpHeading>
        <HelpParagraph>
          Don&apos;t need an item anymore? Here&apos;s how to remove it:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Open the item\'s detail page',
              description: 'Click on the item name in the list.',
            },
            {
              title: 'Click the Delete button',
              description: 'Look for the trash can icon.',
            },
            {
              title: 'Confirm the deletion',
              description: 'StockZip will ask "Are you sure?" Click yes to delete.',
            },
          ]}
        />
        <HelpTip>
          Made a mistake? You have <strong>30 seconds to undo</strong> after deleting. Look for the
          &quot;Undo&quot; button that appears at the bottom of the screen.
        </HelpTip>
        <HelpTip type="info">
          Deleted items aren&apos;t gone forever. They&apos;re &quot;soft-deleted&quot; which means an administrator
          can recover them if needed. This is a safety feature!
        </HelpTip>
      </HelpSection>

      {/* Best Practices */}
      <HelpSection>
        <HelpHeading>Tips for Managing Items Well</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Use clear, consistent names:</strong> Instead of &quot;widget&quot; and &quot;Widget&quot; and &quot;WIDGET&quot;,
            pick one style and stick with it. This makes searching easier.
          </HelpListItem>
          <HelpListItem>
            <strong>Add photos:</strong> A picture is worth a thousand words. When your team needs to find
            something, photos help them identify items quickly.
          </HelpListItem>
          <HelpListItem>
            <strong>Set minimum stock levels:</strong> This is how StockZip knows when to warn you. Think about
            how much of each item you need to have on hand.
          </HelpListItem>
          <HelpListItem>
            <strong>Use tags for flexible grouping:</strong> Tags are like sticky notes. An item can have many tags.
            Use them for things like &quot;seasonal&quot;, &quot;fragile&quot;, &quot;bestseller&quot;, or any other way you want to group items.
          </HelpListItem>
          <HelpListItem>
            <strong>Keep notes for your team:</strong> Use the Notes field for information that helps your team.
            Things like &quot;Handle with care&quot; or &quot;Reorder from Acme Co - takes 2 weeks.&quot;
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
