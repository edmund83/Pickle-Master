'use client'

import { ScanBarcode } from 'lucide-react'
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

export default function ScanningHelp() {
  return (
    <HelpArticleLayout
      title="Barcode & QR Code Scanning"
      description="Use your camera or scanner to quickly find and update items"
      icon={ScanBarcode}
      iconColor="bg-cyan-50 text-cyan-600"
      prevArticle={{ href: '/help/folders', title: 'Organizing with Folders' }}
      nextArticle={{ href: '/help/labels', title: 'Printing Labels' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Scanning is the fastest way to work with your inventory. Instead of typing item names
          or searching, just point your camera at a barcode or QR code and StockZip instantly
          finds the item for you. You can use your phone&apos;s camera or a handheld barcode scanner.
        </HelpParagraph>
      </HelpSection>

      {/* How to Access the Scanner */}
      <HelpSection>
        <HelpHeading>How to Access the Scanner</HelpHeading>
        <HelpSteps
          steps={[
            {
              title: 'Click the "Scan" button',
              description: 'On mobile, it\'s in the bottom navigation bar. On desktop, look in the top navigation.',
            },
            {
              title: 'Allow camera access',
              description: 'The first time you scan, your browser will ask permission to use your camera. Click "Allow".',
            },
            {
              title: 'Point at the barcode',
              description: 'Hold your device steady and point the camera at the barcode or QR code. Keep it within the scanning area on screen.',
            },
          ]}
        />
        <HelpTip type="success">
          Once your camera finds the barcode, StockZip reads it instantly - you don&apos;t need to
          click anything!
        </HelpTip>
      </HelpSection>

      {/* Scanning Modes */}
      <HelpSection>
        <HelpHeading>Different Ways to Scan</HelpHeading>
        <HelpParagraph>
          StockZip offers different scanning modes depending on what you need to do:
        </HelpParagraph>
        <HelpTable
          headers={['Mode', 'Best For', 'How It Works']}
          rows={[
            ['Single Scan', 'Looking up one item', 'Scan once, see the item details, make changes if needed'],
            ['Quick Adjust', 'Fast inventory updates', 'Scan → adjust quantity → save → ready for next scan'],
            ['Batch Counting', 'Stock counts', 'Keep scanning items one after another. Great for counting everything on a shelf.'],
          ]}
        />
      </HelpSection>

      {/* What Happens When You Scan */}
      <HelpSection>
        <HelpHeading>What Happens When You Scan</HelpHeading>

        <HelpSubheading>If the Barcode Exists in Your Inventory</HelpSubheading>
        <HelpParagraph>
          Great news! StockZip found the item. You&apos;ll immediately see:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>The item name, photo, and current quantity</HelpListItem>
          <HelpListItem>Quick buttons to adjust quantity (+1, -1, or type a number)</HelpListItem>
          <HelpListItem>Option to view full details or check out the item</HelpListItem>
        </HelpList>

        <HelpSubheading>If the Barcode is NOT Found</HelpSubheading>
        <HelpParagraph>
          No problem! This just means the barcode isn&apos;t in your system yet. StockZip will:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Ask if you want to add a new item</HelpListItem>
          <HelpListItem>Pre-fill the barcode number in the form for you</HelpListItem>
          <HelpListItem>Let you add the rest of the details (name, quantity, etc.)</HelpListItem>
        </HelpList>
        <HelpTip>
          This is actually a great way to add new items! Just scan the product&apos;s barcode and fill
          in the rest. The barcode is already captured for you.
        </HelpTip>
      </HelpSection>

      {/* Supported Barcode Types */}
      <HelpSection>
        <HelpHeading>Barcode Types That Work</HelpHeading>
        <HelpParagraph>
          StockZip can read many different kinds of barcodes. Here are the most common:
        </HelpParagraph>
        <HelpTable
          headers={['Barcode Type', 'What It Looks Like', 'Common Use']}
          rows={[
            ['QR Code', 'Square with small squares inside', 'Custom labels, equipment tags, quick lookup'],
            ['UPC-A', '12-digit barcode (common in USA)', 'Products you buy at stores'],
            ['EAN-13', '13-digit barcode (international)', 'Products from around the world'],
            ['EAN-8', 'Short 8-digit barcode', 'Small products'],
            ['Code 128', 'Compact, can include letters and numbers', 'Shipping, internal tracking'],
            ['Code 39', 'Older format, letters and numbers', 'Warehouse labels, older systems'],
            ['ITF-14', '14-digit barcode', 'Shipping boxes and containers'],
          ]}
        />
        <HelpTip type="info">
          Don&apos;t worry about remembering these types! StockZip automatically figures out what
          kind of barcode you&apos;re scanning.
        </HelpTip>
      </HelpSection>

      {/* Using Hardware Scanners */}
      <HelpSection>
        <HelpHeading>Using a Handheld Barcode Scanner</HelpHeading>
        <HelpParagraph>
          While your phone&apos;s camera works great, some people prefer handheld scanners.
          They&apos;re faster and work better in tricky lighting. Here&apos;s how to use them:
        </HelpParagraph>

        <HelpSubheading>USB Barcode Scanners</HelpSubheading>
        <HelpParagraph>
          These plug directly into your computer:
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>Plug the scanner into your computer&apos;s USB port</HelpListItem>
          <HelpListItem>Click in any text field (like the search box)</HelpListItem>
          <HelpListItem>Scan the barcode - the scanner types it for you like a keyboard!</HelpListItem>
        </HelpList>

        <HelpSubheading>Bluetooth Scanners</HelpSubheading>
        <HelpParagraph>
          These connect wirelessly to your phone or tablet:
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>Pair the scanner with your device using Bluetooth settings</HelpListItem>
          <HelpListItem>Open StockZip and tap a text field</HelpListItem>
          <HelpListItem>Scan - works just like typing!</HelpListItem>
        </HelpList>
        <HelpTip type="success">
          Hardware scanners work in any text field - the search box, quantity fields, anywhere.
          Just make sure the field is selected (clicked on) before you scan.
        </HelpTip>
      </HelpSection>

      {/* Troubleshooting */}
      <HelpSection>
        <HelpHeading>Scanning Not Working? Try This</HelpHeading>
        <HelpList>
          <HelpListItem>
            <strong>Check camera permission:</strong> Make sure you allowed StockZip to use your camera.
            You can check this in your browser or phone settings.
          </HelpListItem>
          <HelpListItem>
            <strong>Improve the lighting:</strong> Scanning works best with good light. Move to a
            brighter area or turn on more lights.
          </HelpListItem>
          <HelpListItem>
            <strong>Hold steady:</strong> Keep your hand still while scanning. Moving too much makes
            it hard to read.
          </HelpListItem>
          <HelpListItem>
            <strong>Find the right distance:</strong> Not too close, not too far. Usually 6-12 inches
            (15-30 cm) works best.
          </HelpListItem>
          <HelpListItem>
            <strong>Clean the camera:</strong> Smudges on your camera lens can make scanning difficult.
            Give it a quick wipe!
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
