'use client'

import { Printer } from 'lucide-react'
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

export default function LabelsHelp() {
  return (
    <HelpArticleLayout
      title="Printing Labels"
      description="Create professional labels with QR codes and barcodes"
      icon={Printer}
      iconColor="bg-rose-50 text-rose-600"
      prevArticle={{ href: '/help/scanning', title: 'Barcode Scanning' }}
      nextArticle={{ href: '/help/search', title: 'Search & Filtering' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Labels make your inventory easier to manage. Stick a label on a shelf, bin, or product
          and anyone can scan it to instantly see what belongs there and how many you have.
          StockZip creates professional labels with QR codes or barcodes that you can print on
          regular paper or special label sheets.
        </HelpParagraph>
      </HelpSection>

      {/* Getting Started with Labels */}
      <HelpSection>
        <HelpHeading>Creating Labels</HelpHeading>

        <HelpSubheading>For a Single Item</HelpSubheading>
        <HelpSteps
          steps={[
            {
              title: 'Open the item\'s detail page',
              description: 'Click on any item in your inventory.',
            },
            {
              title: 'Click "Print Label"',
              description: 'You\'ll find this button in the quick actions area.',
            },
            {
              title: 'Choose your options',
              description: 'Pick the label size and what information to include.',
            },
            {
              title: 'Click Print',
              description: 'A PDF will be created that you can print.',
            },
          ]}
        />

        <HelpSubheading>For Multiple Items</HelpSubheading>
        <HelpSteps
          steps={[
            {
              title: 'Go to the Inventory page',
              description: 'View your list of items.',
            },
            {
              title: 'Select items with checkboxes',
              description: 'Click the checkbox next to each item you want labels for.',
            },
            {
              title: 'Click "Print Labels" from the actions bar',
              description: 'The bar appears at the bottom when you have items selected.',
            },
            {
              title: 'Choose your options and print',
              description: 'All selected items will be included in one print job.',
            },
          ]}
        />
      </HelpSection>

      {/* Label Sizes */}
      <HelpSection>
        <HelpHeading>Label Sizes</HelpHeading>
        <HelpParagraph>
          StockZip supports many common label sizes. Choose based on what information you need
          to show and what kind of printer you&apos;re using.
        </HelpParagraph>

        <HelpSubheading>For Regular Printers (Avery Sheets)</HelpSubheading>
        <HelpParagraph>
          These work with standard desktop printers. You buy sheets of pre-cut sticky labels
          from office supply stores (Avery is a popular brand).
        </HelpParagraph>
        <HelpTable
          headers={['Size', 'Dimensions', 'Labels Per Sheet', 'Best For']}
          rows={[
            ['Extra Large', '5.5" × 8.5"', '2', 'Big bins, detailed info, photos'],
            ['Large', '3.33" × 4"', '6', 'Shelves, bins with moderate detail'],
            ['Medium', '2" × 4"', '10', 'Most common - good balance of size and detail'],
            ['Small', '1.33" × 4"', '14', 'Narrow shelves, basic info'],
            ['Extra Small', '1" × 2.625"', '30', 'Small items, just name and code'],
          ]}
        />

        <HelpSubheading>For Label Printers (Thermal Printers)</HelpSubheading>
        <HelpParagraph>
          If you have a thermal label printer (like a DYMO, Zebra, or Rollo), StockZip supports
          19 different sizes from 1&quot; × 3&quot; up to 4&quot; × 6&quot;. These printers are faster for printing
          lots of labels and don&apos;t need ink.
        </HelpParagraph>
      </HelpSection>

      {/* What Goes on a Label */}
      <HelpSection>
        <HelpHeading>What Can You Put on a Label?</HelpHeading>
        <HelpParagraph>
          The amount of information depends on the label size. Bigger labels can show more:
        </HelpParagraph>
        <HelpTable
          headers={['Information', 'Extra Large/Large', 'Medium', 'Small']}
          rows={[
            ['Item Name', 'Yes', 'Yes', 'Yes'],
            ['QR Code or Barcode', 'Yes', 'Yes', 'Yes'],
            ['Photo', 'Yes', 'Yes', 'No'],
            ['Company Logo', 'Yes', 'No', 'No'],
            ['Details (SKU, Price)', 'Up to 3', '1-2', 'No'],
            ['Notes', 'Yes', 'No', 'No'],
          ]}
        />
        <HelpTip type="success">
          For most uses, a medium label (2&quot; × 4&quot;) with the item name, QR code, and SKU works great.
          It&apos;s big enough to scan easily but small enough to fit on shelves.
        </HelpTip>
      </HelpSection>

      {/* Barcode vs QR Code */}
      <HelpSection>
        <HelpHeading>Barcode or QR Code?</HelpHeading>
        <HelpParagraph>
          You can choose what type of code appears on your labels:
        </HelpParagraph>

        <HelpSubheading>QR Codes (Recommended)</HelpSubheading>
        <HelpList>
          <HelpListItem>Work great with phone cameras</HelpListItem>
          <HelpListItem>Can be scanned at any angle</HelpListItem>
          <HelpListItem>Still work even if slightly damaged</HelpListItem>
          <HelpListItem>Perfect for internal use</HelpListItem>
        </HelpList>

        <HelpSubheading>Traditional Barcodes</HelpSubheading>
        <HelpList>
          <HelpListItem>Work with handheld barcode scanners</HelpListItem>
          <HelpListItem>Use the same format as products you buy (UPC, EAN)</HelpListItem>
          <HelpListItem>Better if you need to match existing barcodes</HelpListItem>
        </HelpList>

        <HelpTip type="info">
          If you&apos;re creating your own labels for internal tracking, QR codes are usually the
          best choice. If you need to match product barcodes that already exist (like UPC codes
          on items you sell), use traditional barcodes.
        </HelpTip>
      </HelpSection>

      {/* Barcode Formats */}
      <HelpSection>
        <HelpHeading>Barcode Format Options</HelpHeading>
        <HelpParagraph>
          If you choose traditional barcodes, you can pick the format:
        </HelpParagraph>
        <HelpTable
          headers={['Format', 'When to Use']}
          rows={[
            ['Auto-Detect', 'Let StockZip figure it out (good for most cases)'],
            ['Code 128', 'For custom codes with letters and numbers'],
            ['Code 39', 'For compatibility with older systems'],
            ['UPC-A', 'For retail products with 12-digit UPC codes'],
            ['EAN-13', 'For international products with 13-digit codes'],
          ]}
        />
        <HelpTip type="warning">
          Some formats like UPC-A and EAN-13 require specific number patterns. If your item
          doesn&apos;t have a real UPC/EAN code, StockZip&apos;s auto-generated codes might not work
          with these formats. Use Code 128 or QR codes instead.
        </HelpTip>
      </HelpSection>

      {/* Printing Tips */}
      <HelpSection>
        <HelpHeading>Tips for Better Labels</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Test first:</strong> Print a test page on regular paper before using expensive
            label sheets. Make sure everything lines up.
          </HelpListItem>
          <HelpListItem>
            <strong>Match the label size:</strong> Make sure you select the same size in StockZip
            that matches your actual label sheets.
          </HelpListItem>
          <HelpListItem>
            <strong>Keep it simple:</strong> Don&apos;t try to cram too much on a small label. The QR
            code and name are often enough.
          </HelpListItem>
          <HelpListItem>
            <strong>Position matters:</strong> Place labels where they&apos;re easy to scan - at eye
            level, with good lighting, not behind things.
          </HelpListItem>
          <HelpListItem>
            <strong>Protect labels:</strong> For tough environments (outdoors, warehouses), consider
            labels with protective coatings or laminate your labels.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
