'use client'

import { Search } from 'lucide-react'
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

export default function SearchHelp() {
  return (
    <HelpArticleLayout
      title="Search & Filtering"
      description="Find any item in seconds"
      icon={Search}
      iconColor="bg-indigo-50 text-indigo-600"
      prevArticle={{ href: '/help/labels', title: 'Printing Labels' }}
      nextArticle={{ href: '/help/purchase-orders', title: 'Purchase Orders' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          StockZip&apos;s powerful search helps you find any item instantly. Whether you have
          100 items or 100,000, you can find what you need in seconds. You can search by name,
          code, description, or even tags - and use filters to narrow down results.
        </HelpParagraph>
      </HelpSection>

      {/* Global Search */}
      <HelpSection>
        <HelpHeading>Quick Search (The Fastest Way)</HelpHeading>
        <HelpParagraph>
          The quickest way to find something is the global search. Here&apos;s how:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Press ⌘K (Mac) or Ctrl+K (Windows)',
              description: 'This keyboard shortcut works from anywhere in StockZip. Or click the search icon in the top navigation.',
            },
            {
              title: 'Start typing',
              description: 'Type part of the item name, SKU, barcode, or any keyword.',
            },
            {
              title: 'See results instantly',
              description: 'Matching items appear as you type. Click one to open it.',
            },
          ]}
        />
        <HelpTip type="success">
          You don&apos;t need to type the whole name. Typing &quot;wid&quot; will find &quot;Widget&quot;, &quot;Blue Widget&quot;,
          and &quot;Widget Pro&quot;.
        </HelpTip>
      </HelpSection>

      {/* What You Can Search */}
      <HelpSection>
        <HelpHeading>What Can You Search For?</HelpHeading>
        <HelpParagraph>
          The search looks at many parts of each item:
        </HelpParagraph>
        <HelpTable
          headers={['Search By', 'Example']}
          rows={[
            ['Item Name', 'Search "widget" finds items named Widget, Blue Widget, Widget Pro'],
            ['SKU / Item ID', 'Search "WID-001" finds that exact SKU'],
            ['Barcode Number', 'Search "012345" finds items with that barcode'],
            ['Description', 'Search "stainless" finds items with "stainless" in the description'],
            ['Notes', 'Search "fragile" finds items with "fragile" in the notes'],
            ['Tags', 'Search "bestseller" finds items tagged as bestseller'],
          ]}
        />
      </HelpSection>

      {/* Using Filters */}
      <HelpSection>
        <HelpHeading>Using Filters to Narrow Results</HelpHeading>
        <HelpParagraph>
          Sometimes you need more than just search. Filters help you narrow down your inventory
          based on specific criteria.
        </HelpParagraph>

        <HelpSubheading>How to Use Filters</HelpSubheading>
        <HelpSteps
          steps={[
            {
              title: 'Go to the Inventory page',
              description: 'Click "Inventory" in the navigation.',
            },
            {
              title: 'Click the "Filters" button',
              description: 'You\'ll find it near the search box.',
            },
            {
              title: 'Select your filter options',
              description: 'Choose what you want to filter by (see options below).',
            },
            {
              title: 'See filtered results',
              description: 'Only items matching your filters are shown.',
            },
          ]}
        />

        <HelpSubheading>Available Filters</HelpSubheading>
        <HelpTable
          headers={['Filter', 'What It Does', 'Options']}
          rows={[
            ['Status', 'Filter by stock level', 'In Stock, Low Stock, Out of Stock'],
            ['Folder', 'Show items from a specific location', 'Any folder you\'ve created'],
            ['Tags', 'Show items with specific tags', 'Any tags you\'ve used'],
            ['Date Range', 'Show items created or changed within a time period', 'Last week, Last month, Custom dates'],
            ['Quantity Range', 'Show items with quantity between min and max', 'Set minimum and/or maximum'],
          ]}
        />
      </HelpSection>

      {/* Combining Filters */}
      <HelpSection>
        <HelpHeading>Combining Filters</HelpHeading>
        <HelpParagraph>
          You can use multiple filters at once. They work together using &quot;AND&quot; logic, meaning
          items must match ALL your filters to show up.
        </HelpParagraph>
        <HelpParagraph>
          <strong>Example:</strong> If you set:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Status = &quot;Low Stock&quot;</HelpListItem>
          <HelpListItem>Folder = &quot;Warehouse A&quot;</HelpListItem>
        </HelpList>
        <HelpParagraph>
          You&apos;ll see only items that are BOTH low stock AND in Warehouse A.
        </HelpParagraph>
        <HelpTip>
          This is super useful for tasks like &quot;Show me all the out-of-stock electronics in
          the main warehouse&quot; - just set the right combination of filters!
        </HelpTip>
      </HelpSection>

      {/* Saving Searches */}
      <HelpSection>
        <HelpHeading>Saving Your Favorite Searches</HelpHeading>
        <HelpParagraph>
          Do you run the same search often? Save it! Here&apos;s how:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Set up your search and filters',
              description: 'Get the results exactly how you want them.',
            },
            {
              title: 'Click "Save Search"',
              description: 'You\'ll find this option near the filters.',
            },
            {
              title: 'Give it a name',
              description: 'Something descriptive like "Low Stock - Main Warehouse" or "Electronics to Reorder".',
            },
            {
              title: 'Click Save',
              description: 'Done! Your search is saved.',
            },
          ]}
        />

        <HelpSubheading>Using Saved Searches</HelpSubheading>
        <HelpParagraph>
          Your saved searches appear in a dropdown menu. Just click one to instantly apply
          that search and all its filters. It&apos;s like having a bookmark for your inventory!
        </HelpParagraph>
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Search Tips</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Use the keyboard shortcut:</strong> ⌘K or Ctrl+K is the fastest way to search.
            Try to remember it - it saves clicks!
          </HelpListItem>
          <HelpListItem>
            <strong>Search partial words:</strong> You don&apos;t need to type everything. &quot;wid&quot; finds
            &quot;Widget&quot;.
          </HelpListItem>
          <HelpListItem>
            <strong>Use tags wisely:</strong> Tags are great for grouping items in ways that don&apos;t
            fit into folders. Tag items as &quot;seasonal&quot;, &quot;bestseller&quot;, or &quot;clearance&quot; then filter by tag.
          </HelpListItem>
          <HelpListItem>
            <strong>Save frequent searches:</strong> If you run the same search every day, save it!
            One click instead of setting up filters every time.
          </HelpListItem>
          <HelpListItem>
            <strong>Clear filters when done:</strong> Remember to clear your filters when you want
            to see everything again. There&apos;s usually a &quot;Clear All&quot; button.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
