'use client'

import { FolderTree } from 'lucide-react'
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

export default function FoldersHelp() {
  return (
    <HelpArticleLayout
      title="Organizing with Folders"
      description="Create locations and categories to organize your inventory"
      icon={FolderTree}
      iconColor="bg-amber-50 text-amber-600"
      prevArticle={{ href: '/help/items', title: 'Managing Items' }}
      nextArticle={{ href: '/help/scanning', title: 'Barcode Scanning' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Folders help you organize your items into groups. Think of them like physical locations
          (warehouses, shelves, bins) or categories (electronics, tools, supplies). You can nest
          folders inside each other to create a structure that matches how you actually store things.
        </HelpParagraph>
      </HelpSection>

      {/* Creating Folders */}
      <HelpSection>
        <HelpHeading>Creating Folders</HelpHeading>
        <HelpSteps
          steps={[
            {
              title: 'Go to the Inventory page',
              description: 'Click "Inventory" in the navigation menu.',
            },
            {
              title: 'Click "+ New Folder"',
              description: 'You\'ll find this button near the top of the page.',
            },
            {
              title: 'Enter a name for your folder',
              description: 'Call it something descriptive like "Warehouse A" or "Electronics".',
            },
            {
              title: 'Choose a parent folder (optional)',
              description: 'Want to put this folder inside another folder? Select the parent here. Leave empty for a top-level folder.',
            },
            {
              title: 'Pick a color (optional)',
              description: 'Colors help you visually identify folders quickly. Pick your favorite!',
            },
            {
              title: 'Click Create',
              description: 'Your new folder is ready to use!',
            },
          ]}
        />
      </HelpSection>

      {/* Folder Examples */}
      <HelpSection>
        <HelpHeading>How to Organize Your Folders</HelpHeading>
        <HelpParagraph>
          There&apos;s no single &quot;right&quot; way to organize folders. It depends on your business.
          Here are some common examples:
        </HelpParagraph>

        <HelpSubheading>By Physical Location</HelpSubheading>
        <HelpParagraph>
          If you have items in different places, organize by where they are:
        </HelpParagraph>
        <div className="mb-4 rounded-lg bg-neutral-50 p-4 font-mono text-sm text-neutral-700">
          <div>📁 Main Warehouse</div>
          <div className="ml-4">📁 Aisle A</div>
          <div className="ml-8">📁 Shelf 1</div>
          <div className="ml-8">📁 Shelf 2</div>
          <div className="ml-4">📁 Aisle B</div>
          <div>📁 Retail Store</div>
          <div className="ml-4">📁 Display Cases</div>
          <div className="ml-4">📁 Back Stock</div>
          <div>📁 Service Vans</div>
          <div className="ml-4">📁 Van 1</div>
          <div className="ml-4">📁 Van 2</div>
        </div>

        <HelpSubheading>By Category</HelpSubheading>
        <HelpParagraph>
          If location doesn&apos;t matter as much, organize by what things are:
        </HelpParagraph>
        <div className="mb-4 rounded-lg bg-neutral-50 p-4 font-mono text-sm text-neutral-700">
          <div>📁 Electronics</div>
          <div className="ml-4">📁 Cables</div>
          <div className="ml-4">📁 Adapters</div>
          <div>📁 Office Supplies</div>
          <div>📁 Cleaning Supplies</div>
          <div>📁 Tools</div>
        </div>

        <HelpSubheading>Combination (Most Common)</HelpSubheading>
        <HelpParagraph>
          Most businesses use a mix - locations at the top level, then categories inside:
        </HelpParagraph>
        <div className="mb-4 rounded-lg bg-neutral-50 p-4 font-mono text-sm text-neutral-700">
          <div>📁 New York Office</div>
          <div className="ml-4">📁 IT Closet</div>
          <div className="ml-4">📁 Supply Room</div>
          <div>📁 Chicago Office</div>
          <div className="ml-4">📁 IT Closet</div>
          <div className="ml-4">📁 Supply Room</div>
        </div>

        <HelpTip>
          Start simple! You can always add more folders later. It&apos;s easier to start with a few
          folders and expand than to reorganize a complex structure.
        </HelpTip>
      </HelpSection>

      {/* Moving Items */}
      <HelpSection>
        <HelpHeading>Moving Items Between Folders</HelpHeading>
        <HelpParagraph>
          There are several ways to move items from one folder to another:
        </HelpParagraph>

        <HelpSubheading>Drag and Drop (Desktop)</HelpSubheading>
        <HelpParagraph>
          On a computer, you can drag an item and drop it onto a folder in the sidebar.
          Just like moving files on your computer!
        </HelpParagraph>

        <HelpSubheading>Manual Move (Any Device)</HelpSubheading>
        <HelpSteps
          steps={[
            {
              title: 'Open the item\'s detail page',
              description: 'Click on the item name.',
            },
            {
              title: 'Click Edit',
              description: 'Look for the edit button.',
            },
            {
              title: 'Change the Folder field',
              description: 'Select the new folder from the dropdown.',
            },
            {
              title: 'Save your changes',
              description: 'The item is now in the new folder!',
            },
          ]}
        />

        <HelpSubheading>Moving Multiple Items at Once</HelpSubheading>
        <HelpParagraph>
          Need to move many items? Use bulk actions:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Select items using the checkboxes',
              description: 'Click the checkbox next to each item you want to move. Or click the top checkbox to select all visible items.',
            },
            {
              title: 'Click "Move" from the actions bar',
              description: 'A bar appears at the bottom when you have items selected.',
            },
            {
              title: 'Choose the destination folder',
              description: 'Pick where you want all these items to go.',
            },
            {
              title: 'Confirm the move',
              description: 'All selected items are moved at once!',
            },
          ]}
        />
      </HelpSection>

      {/* Folder Summary */}
      <HelpSection>
        <HelpHeading>Folder Information</HelpHeading>
        <HelpParagraph>
          Each folder shows you helpful summary information:
        </HelpParagraph>
        <HelpTable
          headers={['Information', 'What It Shows']}
          rows={[
            ['Total Items', 'How many items are in this folder (including items in subfolders)'],
            ['Total Value', 'The combined value of all items in the folder'],
          ]}
        />
        <HelpTip type="success">
          Click on a folder to see only the items inside it. Click the folder again (or click
          &quot;All Items&quot;) to see everything.
        </HelpTip>
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Tips for Organizing Folders</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Match your physical layout:</strong> If items are on Shelf 3 in Aisle A,
            create folders that match. This makes it easy to find things in real life.
          </HelpListItem>
          <HelpListItem>
            <strong>Don&apos;t go too deep:</strong> 3-4 levels of nesting is usually enough.
            Too many levels makes navigation confusing.
          </HelpListItem>
          <HelpListItem>
            <strong>Use colors wisely:</strong> Pick different colors for different types of
            folders. For example, green for warehouses, blue for offices, red for vehicles.
          </HelpListItem>
          <HelpListItem>
            <strong>Keep names short but clear:</strong> &quot;Shelf 1&quot; is better than
            &quot;The first shelf on the left side of aisle A&quot;.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
