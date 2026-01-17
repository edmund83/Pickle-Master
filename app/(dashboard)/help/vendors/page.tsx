'use client'

import { Users } from 'lucide-react'
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

export default function VendorsHelp() {
  return (
    <HelpArticleLayout
      title="Vendors & Partners"
      description="Manage your suppliers and customers"
      icon={Users}
      iconColor="bg-fuchsia-50 text-fuchsia-600"
      prevArticle={{ href: '/help/reorder', title: 'Auto-Reorder' }}
      nextArticle={{ href: '/help/reports', title: 'Reports & Analytics' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Vendors (suppliers) and customers are important partners in your business. StockZip
          helps you keep track of them, store their contact information, and link them to your
          inventory and orders. This makes creating purchase orders faster and powers features
          like auto-reorder suggestions.
        </HelpParagraph>
      </HelpSection>

      {/* Adding a Vendor */}
      <HelpSection>
        <HelpHeading>Adding a Vendor (Supplier)</HelpHeading>
        <HelpSteps
          steps={[
            {
              title: 'Go to Partners → Vendors',
              description: 'Click "Partners" in the sidebar, then "Vendors".',
            },
            {
              title: 'Click "+ New Vendor"',
              description: 'Start adding a new vendor.',
            },
            {
              title: 'Enter the vendor details',
              description: 'Fill in the information about this supplier.',
            },
            {
              title: 'Click Save',
              description: 'The vendor is now in your system!',
            },
          ]}
        />
      </HelpSection>

      {/* Vendor Fields */}
      <HelpSection>
        <HelpHeading>Vendor Information</HelpHeading>
        <HelpTable
          headers={['Field', 'What It Means', 'Required?']}
          rows={[
            ['Name', 'The vendor/company name', 'Yes'],
            ['Contact', 'Primary contact person at this vendor', 'Optional'],
            ['Email', 'Email address for orders and communication', 'Optional'],
            ['Phone', 'Phone number', 'Optional'],
            ['Address', 'Full business address', 'Optional'],
            ['Notes', 'Internal notes about this vendor (terms, payment info, etc.)', 'Optional'],
          ]}
        />
        <HelpTip type="success">
          At minimum, enter the vendor name and email. This lets you quickly find them when
          creating purchase orders.
        </HelpTip>
      </HelpSection>

      {/* Linking Items to Vendors */}
      <HelpSection>
        <HelpHeading>Linking Items to Vendors</HelpHeading>
        <HelpParagraph>
          Connecting items to their vendors unlocks powerful features. Here&apos;s how to set it up:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Edit an item',
              description: 'Open the item and click Edit.',
            },
            {
              title: 'Find the "Vendors" section',
              description: 'Look for vendor-related fields.',
            },
            {
              title: 'Click "Add Vendor"',
              description: 'Link this item to a vendor.',
            },
            {
              title: 'Select the vendor',
              description: 'Choose from your vendor list.',
            },
            {
              title: 'Enter additional details',
              description: 'Vendor SKU, cost, lead time, etc.',
            },
            {
              title: 'Mark as Preferred (optional)',
              description: 'If this is your go-to vendor for this item.',
            },
            {
              title: 'Save',
              description: 'The link is established!',
            },
          ]}
        />
      </HelpSection>

      {/* Item-Vendor Details */}
      <HelpSection>
        <HelpHeading>Item-Vendor Relationship Details</HelpHeading>
        <HelpParagraph>
          When linking an item to a vendor, you can specify:
        </HelpParagraph>
        <HelpTable
          headers={['Field', 'What It Means', 'Why It\'s Useful']}
          rows={[
            ['Vendor', 'Which supplier sells this item', 'Basic link'],
            ['Vendor SKU/Part Number', 'The vendor\'s code for this item (may be different from yours)', 'Goes on purchase orders so the vendor knows what you want'],
            ['Unit Cost', 'How much you pay this vendor per unit', 'Auto-fills on purchase orders, tracks costs'],
            ['Lead Time', 'How many days from order to delivery', 'Helps plan when to reorder'],
            ['Preferred', 'Is this your main supplier for this item?', 'Used for auto-reorder suggestions'],
          ]}
        />
        <HelpTip>
          An item can be linked to multiple vendors! Maybe Vendor A is cheaper but slower,
          while Vendor B is faster but costs more. Link both and choose when ordering.
        </HelpTip>
      </HelpSection>

      {/* Benefits of Linking */}
      <HelpSection>
        <HelpHeading>Benefits of Linking Items to Vendors</HelpHeading>
        <HelpParagraph>
          Why take the time to set this up? Because it saves time and prevents mistakes:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>Faster purchase orders:</strong> When creating a PO, item costs and vendor
            SKUs auto-fill
          </HelpListItem>
          <HelpListItem>
            <strong>Smart reorder suggestions:</strong> Items are grouped by vendor so you can
            place one order per supplier
          </HelpListItem>
          <HelpListItem>
            <strong>Cost tracking:</strong> See what you&apos;re paying each vendor for each item
          </HelpListItem>
          <HelpListItem>
            <strong>Lead time awareness:</strong> Know how long orders take from each vendor
          </HelpListItem>
          <HelpListItem>
            <strong>One-click PO creation:</strong> From reorder suggestions, create a PO with
            everything pre-filled
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Managing Customers */}
      <HelpSection>
        <HelpHeading>Managing Customers</HelpHeading>
        <HelpParagraph>
          In addition to vendors, you can also keep track of customers:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Go to Partners → Customers',
              description: 'Click "Partners" in the sidebar, then "Customers".',
            },
            {
              title: 'Add customer records',
              description: 'Similar to vendors - name, contact, address, etc.',
            },
            {
              title: 'Link to orders',
              description: 'Use customers when creating pick lists or shipments.',
            },
          ]}
        />
        <HelpParagraph>
          Customer records are useful for:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            Storing ship-to addresses for easy selection
          </HelpListItem>
          <HelpListItem>
            Tracking which customer received which items
          </HelpListItem>
          <HelpListItem>
            Assigning checked-out items to customers or their jobs
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Tips for Managing Partners</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Add vendors early:</strong> Set up your main vendors before you start
            creating purchase orders. It&apos;s faster when they&apos;re already in the system.
          </HelpListItem>
          <HelpListItem>
            <strong>Link all items to vendors:</strong> Even if it takes time upfront, the
            payoff comes with every order you create.
          </HelpListItem>
          <HelpListItem>
            <strong>Keep contact info current:</strong> When your vendor changes their email
            or phone, update it in StockZip.
          </HelpListItem>
          <HelpListItem>
            <strong>Use notes for important details:</strong> Payment terms, account numbers,
            special instructions - put them in notes so anyone can see them.
          </HelpListItem>
          <HelpListItem>
            <strong>Set one vendor as preferred:</strong> For items with multiple vendors,
            mark your usual supplier as &quot;preferred&quot; to power auto-reorder suggestions.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
