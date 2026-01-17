'use client'

import { FileSpreadsheet } from 'lucide-react'
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

export default function ImportExportHelp() {
  return (
    <HelpArticleLayout
      title="Bulk Import & Export"
      description="Move data in and out of StockZip"
      icon={FileSpreadsheet}
      iconColor="bg-emerald-50 text-emerald-600"
      prevArticle={{ href: '/help/settings', title: 'Settings' }}
      nextArticle={{ href: '/help/mobile', title: 'Mobile & Offline' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Have a lot of items to add? Don&apos;t want to enter them one by one? Use bulk import!
          You can upload a spreadsheet (CSV or Excel) with all your items and StockZip will
          add them automatically. You can also export your inventory to a spreadsheet for
          backup, analysis, or sharing.
        </HelpParagraph>
      </HelpSection>

      {/* Importing Items */}
      <HelpSection>
        <HelpHeading>Importing Items from a Spreadsheet</HelpHeading>

        <HelpSubheading>Step 1: Prepare Your File</HelpSubheading>
        <HelpParagraph>
          Create a spreadsheet (CSV or Excel) with your items. At minimum, you need:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>A column for <strong>Name</strong> (what the item is called)</HelpListItem>
          <HelpListItem>A column for <strong>Quantity</strong> (how many you have)</HelpListItem>
        </HelpList>
        <HelpParagraph>
          You can also include:
        </HelpParagraph>
        <HelpTable
          headers={['Column', 'Example']}
          rows={[
            ['Name', 'Red Widget'],
            ['Quantity', '50'],
            ['SKU', 'WID-001'],
            ['Barcode', '012345678905'],
            ['Description', 'Small red widget for testing'],
            ['Unit Cost', '5.00'],
            ['Selling Price', '8.00'],
            ['Min Quantity', '10'],
            ['Folder', 'Warehouse/Shelf A'],
            ['Tags', 'red, metal, small'],
          ]}
        />
        <HelpTip type="success">
          StockZip provides a template CSV! Download it from the import page to see exactly
          what format to use.
        </HelpTip>
      </HelpSection>

      {/* Import Process */}
      <HelpSection>
        <HelpSubheading>Step 2: Upload and Import</HelpSubheading>
        <HelpSteps
          steps={[
            {
              title: 'Go to Settings → Bulk Import',
              description: 'Navigate to the import page.',
            },
            {
              title: 'Upload your file',
              description: 'Drag and drop your CSV/Excel file, or click to browse. Up to 50,000 rows supported.',
            },
            {
              title: 'Map columns',
              description: 'StockZip tries to auto-detect which column is which. Verify it got it right, or manually adjust.',
            },
            {
              title: 'Preview the data',
              description: 'See the first 50 rows to make sure everything looks correct. Errors are highlighted.',
            },
            {
              title: 'Click Import',
              description: 'StockZip processes your file. Large imports may take a few minutes.',
            },
            {
              title: 'Review the summary',
              description: 'See how many items were imported, skipped, or failed.',
            },
          ]}
        />
      </HelpSection>

      {/* Column Mapping */}
      <HelpSection>
        <HelpSubheading>Understanding Column Mapping</HelpSubheading>
        <HelpParagraph>
          Column mapping tells StockZip which column in your spreadsheet goes to which field
          in StockZip. For example:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Your &quot;Product Name&quot; column → StockZip&apos;s &quot;Name&quot; field</HelpListItem>
          <HelpListItem>Your &quot;QTY&quot; column → StockZip&apos;s &quot;Quantity&quot; field</HelpListItem>
          <HelpListItem>Your &quot;Item Code&quot; column → StockZip&apos;s &quot;SKU&quot; field</HelpListItem>
        </HelpList>
        <HelpParagraph>
          StockZip auto-detects common column names, but you can adjust if needed.
        </HelpParagraph>
      </HelpSection>

      {/* Import Tips */}
      <HelpSection>
        <HelpHeading>Tips for Successful Imports</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Use the template:</strong> Download the template CSV for the correct format.
            This prevents most errors.
          </HelpListItem>
          <HelpListItem>
            <strong>SKU matching:</strong> If an item with the same SKU already exists, StockZip
            updates it instead of creating a duplicate. Great for updating prices or quantities.
          </HelpListItem>
          <HelpListItem>
            <strong>Folder paths:</strong> Use slashes for nested folders: &quot;Warehouse/Shelf A&quot;.
            StockZip automatically creates the folders if they don&apos;t exist.
          </HelpListItem>
          <HelpListItem>
            <strong>Tags with commas:</strong> Separate multiple tags with commas: &quot;red, metal, small&quot;.
          </HelpListItem>
          <HelpListItem>
            <strong>Check for errors:</strong> Review the preview carefully. Download the error
            report if items fail to understand why.
          </HelpListItem>
          <HelpListItem>
            <strong>Start small:</strong> Test with a few rows first before importing thousands.
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Common Import Errors */}
      <HelpSection>
        <HelpHeading>Common Import Errors</HelpHeading>
        <HelpTable
          headers={['Error', 'What It Means', 'How to Fix']}
          rows={[
            ['Missing required field', 'Name or Quantity is empty', 'Make sure every row has a name and quantity'],
            ['Invalid quantity', 'Quantity isn\'t a number', 'Remove text or special characters from quantity'],
            ['Duplicate SKU', 'SKU already exists (and matching is off)', 'Use a unique SKU or enable SKU matching'],
            ['Invalid file format', 'File isn\'t CSV or Excel', 'Save as CSV or .xlsx format'],
          ]}
        />
      </HelpSection>

      {/* Exporting Items */}
      <HelpSection>
        <HelpHeading>Exporting Your Inventory</HelpHeading>
        <HelpParagraph>
          Want to get your data out of StockZip? Export it to a spreadsheet:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Go to Inventory',
              description: 'View your inventory list.',
            },
            {
              title: 'Apply filters (optional)',
              description: 'Filter to export only specific items (e.g., one folder or tag).',
            },
            {
              title: 'Click Export',
              description: 'Look for the export button near the top of the list.',
            },
            {
              title: 'Choose format',
              description: 'Select CSV (works everywhere).',
            },
            {
              title: 'Select fields',
              description: 'Choose which columns to include in the export.',
            },
            {
              title: 'Download',
              description: 'Your file is ready!',
            },
          ]}
        />
      </HelpSection>

      {/* Export Uses */}
      <HelpSection>
        <HelpHeading>What Can You Do with Exported Data?</HelpHeading>
        <HelpList>
          <HelpListItem>
            <strong>Backup:</strong> Keep a copy of your inventory data safe
          </HelpListItem>
          <HelpListItem>
            <strong>Analysis:</strong> Use Excel pivot tables and charts for deeper analysis
          </HelpListItem>
          <HelpListItem>
            <strong>Sharing:</strong> Send inventory lists to partners or accountants
          </HelpListItem>
          <HelpListItem>
            <strong>Migration:</strong> Move data to another system if needed
          </HelpListItem>
          <HelpListItem>
            <strong>Bulk updates:</strong> Export, modify in Excel, then re-import to update many items
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
