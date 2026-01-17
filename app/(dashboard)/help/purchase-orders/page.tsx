'use client'

import { ShoppingCart } from 'lucide-react'
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

export default function PurchaseOrdersHelp() {
  return (
    <HelpArticleLayout
      title="Purchase Orders & Receiving"
      description="Order stock from vendors and receive shipments"
      icon={ShoppingCart}
      iconColor="bg-emerald-50 text-emerald-600"
      prevArticle={{ href: '/help/search', title: 'Search & Filtering' }}
      nextArticle={{ href: '/help/pick-lists', title: 'Pick Lists' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Purchase Orders (POs) help you track what you&apos;re ordering from your vendors (suppliers).
          When the shipment arrives, you &quot;receive&quot; it in StockZip, which automatically updates
          your inventory. This keeps everything organized and gives you a history of all your orders.
        </HelpParagraph>
      </HelpSection>

      {/* Creating a PO */}
      <HelpSection>
        <HelpHeading>Creating a Purchase Order</HelpHeading>
        <HelpSteps
          steps={[
            {
              title: 'Go to Tasks → Purchase Orders',
              description: 'Click "Tasks" in the sidebar, then "Purchase Orders".',
            },
            {
              title: 'Click "+ New Order"',
              description: 'Start a new purchase order.',
            },
            {
              title: 'Select the vendor',
              description: 'Choose who you\'re ordering from. If they\'re not in the list, you can add them.',
            },
            {
              title: 'Add items to the order',
              description: 'Search your inventory and add items you need. Enter the quantity and price for each.',
            },
            {
              title: 'Fill in other details (optional)',
              description: 'Expected delivery date, shipping address, notes, etc.',
            },
            {
              title: 'Save or Submit',
              description: 'Save as draft to edit later, or submit when you\'re ready to send.',
            },
          ]}
        />
      </HelpSection>

      {/* PO Fields */}
      <HelpSection>
        <HelpHeading>What Goes in a Purchase Order</HelpHeading>
        <HelpTable
          headers={['Field', 'What It Means', 'Required?']}
          rows={[
            ['Vendor', 'Who are you ordering from?', 'Yes'],
            ['Order Items', 'What are you ordering and how many?', 'Yes'],
            ['Unit Price', 'How much per item?', 'Recommended'],
            ['Expected Delivery', 'When do you think it will arrive?', 'Optional'],
            ['Vendor Part Number', 'The vendor\'s code for this item (their SKU)', 'Optional'],
            ['Ship To', 'Where should it be delivered?', 'Optional'],
            ['Bill To', 'Where should the invoice go?', 'Optional'],
            ['Notes', 'Any special instructions?', 'Optional'],
          ]}
        />
        <HelpTip type="success">
          When adding items, check the box &quot;Show low stock items only&quot; to quickly see what
          needs reordering!
        </HelpTip>
      </HelpSection>

      {/* PO Status */}
      <HelpSection>
        <HelpHeading>Purchase Order Status</HelpHeading>
        <HelpParagraph>
          A purchase order goes through different stages from creation to completion:
        </HelpParagraph>
        <HelpTable
          headers={['Status', 'What It Means', 'What You Can Do']}
          rows={[
            ['Draft', 'Order is being created - not sent yet', 'Edit anything, add/remove items'],
            ['Submitted', 'Order has been sent to the vendor', 'Wait for confirmation'],
            ['Confirmed', 'Vendor has confirmed they will fulfill it', 'Wait for delivery'],
            ['Partial', 'Some items have arrived, more expected', 'Receive remaining items'],
            ['Received', 'Everything has arrived', 'All done!'],
            ['Cancelled', 'Order was cancelled', 'Create a new order if needed'],
          ]}
        />
      </HelpSection>

      {/* Receiving Items */}
      <HelpSection>
        <HelpHeading>Receiving Items (When Your Order Arrives)</HelpHeading>
        <HelpParagraph>
          When a shipment arrives at your door, you need to &quot;receive&quot; it in StockZip. This
          updates your inventory with the new stock. Here&apos;s how:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Open the Purchase Order',
              description: 'Go to Tasks → Purchase Orders and find the order.',
            },
            {
              title: 'Click "Receive Items"',
              description: 'This creates a new receive document.',
            },
            {
              title: 'Check what arrived',
              description: 'For each item, enter how many you actually received.',
            },
            {
              title: 'Choose where to put them',
              description: 'Select the location (folder) where you\'ll store these items.',
            },
            {
              title: 'Note any issues',
              description: 'Mark items as damaged or rejected if there are problems.',
            },
            {
              title: 'Click "Complete Receive"',
              description: 'Your inventory is automatically updated!',
            },
          ]}
        />
      </HelpSection>

      {/* Receiving Details */}
      <HelpSection>
        <HelpHeading>What to Enter When Receiving</HelpHeading>
        <HelpTable
          headers={['Field', 'What It Means']}
          rows={[
            ['Quantity Received', 'How many actually arrived? (May be different from what you ordered)'],
            ['Location', 'Where are you putting these items?'],
            ['Condition', 'Are they good, damaged, or rejected?'],
            ['Lot/Batch', 'For items you track by lot - enter the lot number and expiry date'],
            ['Serial Numbers', 'For items you track individually - enter each serial number'],
          ]}
        />
        <HelpTip type="info">
          If you ordered 100 items but only 80 arrived, just enter 80 as received. The order
          will show as &quot;Partial&quot; and you can receive the remaining 20 when they arrive.
        </HelpTip>
      </HelpSection>

      {/* Partial Shipments */}
      <HelpSection>
        <HelpHeading>When Orders Arrive in Multiple Shipments</HelpHeading>
        <HelpParagraph>
          Sometimes vendors send your order in parts. No problem! StockZip handles this:
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>
            When the first shipment arrives, receive what you got
          </HelpListItem>
          <HelpListItem>
            The order status changes to &quot;Partial&quot;
          </HelpListItem>
          <HelpListItem>
            When the next shipment arrives, open the same order and receive again
          </HelpListItem>
          <HelpListItem>
            Each receive updates your inventory
          </HelpListItem>
          <HelpListItem>
            Once everything is received, the order becomes &quot;Received&quot;
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Receive Numbers */}
      <HelpSection>
        <HelpHeading>Receive Document Numbers</HelpHeading>
        <HelpParagraph>
          Each time you receive items, StockZip creates a receive document with a number like
          &quot;RCV-ACM01-00001&quot;. This makes it easy to find and reference specific receipts later.
        </HelpParagraph>
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Tips for Better Purchasing</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Link items to vendors:</strong> When you set up items, link them to their vendors.
            This pre-fills information in purchase orders and powers the auto-reorder suggestions.
          </HelpListItem>
          <HelpListItem>
            <strong>Set reorder points:</strong> Tell StockZip when to alert you. This way you
            never run out unexpectedly.
          </HelpListItem>
          <HelpListItem>
            <strong>Receive promptly:</strong> Receive items as soon as they arrive. This keeps
            your inventory accurate.
          </HelpListItem>
          <HelpListItem>
            <strong>Check quantities:</strong> Always verify what you received matches what
            the packing slip says. Note any discrepancies.
          </HelpListItem>
          <HelpListItem>
            <strong>Use notes:</strong> Add notes about delivery problems, quality issues,
            or anything else worth remembering for next time.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
