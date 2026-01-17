'use client'

import { BarChart3 } from 'lucide-react'
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

export default function ReportsHelp() {
  return (
    <HelpArticleLayout
      title="Reports & Analytics"
      description="Get insights about your inventory"
      icon={BarChart3}
      iconColor="bg-yellow-50 text-yellow-600"
      prevArticle={{ href: '/help/vendors', title: 'Vendors & Partners' }}
      nextArticle={{ href: '/help/team', title: 'Team Management' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Reports help you understand your inventory better. Instead of just knowing what you
          have, reports show you trends, values, problems, and opportunities. Whether you need
          to know your total inventory value, which items are running low, or what&apos;s been
          happening over time - reports give you answers.
        </HelpParagraph>
      </HelpSection>

      {/* Available Reports */}
      <HelpSection>
        <HelpHeading>Available Reports</HelpHeading>
        <HelpTable
          headers={['Report', 'What It Shows', 'Good For']}
          rows={[
            ['Inventory Summary', 'Overview of items by category or folder', 'Getting the big picture of what you have'],
            ['Inventory Value', 'Total value of stock by location or category', 'Knowing how much money is tied up in inventory'],
            ['Low Stock Alert', 'Items below their minimum threshold', 'Finding what needs to be reordered'],
            ['Stock Movement', 'Items going in and out over time', 'Understanding usage patterns'],
            ['Activity Log', 'All changes made by users', 'Auditing who did what and when'],
            ['Expiring Items', 'Items approaching their expiration date', 'Avoiding waste from expired goods'],
            ['Profit Margin', 'Margin analysis by item or category', 'Understanding profitability'],
            ['Inventory Trends', 'Historical quantity changes over time', 'Spotting patterns and forecasting needs'],
          ]}
        />
      </HelpSection>

      {/* Running a Report */}
      <HelpSection>
        <HelpHeading>Running a Report</HelpHeading>
        <HelpSteps
          steps={[
            {
              title: 'Go to Reports',
              description: 'Click "Reports" in the sidebar.',
            },
            {
              title: 'Choose a report type',
              description: 'Click on the report you want to run.',
            },
            {
              title: 'Set filters (optional)',
              description: 'Narrow down by date range, category, location, etc.',
            },
            {
              title: 'Click Generate',
              description: 'The report is created.',
            },
            {
              title: 'View results',
              description: 'See charts, tables, and key numbers on screen.',
            },
            {
              title: 'Export if needed',
              description: 'Download as CSV for Excel or further analysis.',
            },
          ]}
        />
      </HelpSection>

      {/* Report Filters */}
      <HelpSection>
        <HelpHeading>Common Report Filters</HelpHeading>
        <HelpParagraph>
          Most reports let you filter the data to see exactly what you need:
        </HelpParagraph>
        <HelpTable
          headers={['Filter', 'What It Does']}
          rows={[
            ['Date Range', 'Show only data from a specific time period (last week, last month, custom dates)'],
            ['Category/Folder', 'Show only items from specific locations or categories'],
            ['Location', 'For multi-location businesses, focus on one warehouse or store'],
            ['Tags', 'Filter by item tags you\'ve created'],
          ]}
        />
      </HelpSection>

      {/* Understanding Key Reports */}
      <HelpSection>
        <HelpHeading>Understanding Key Reports</HelpHeading>

        <HelpSubheading>Inventory Value Report</HelpSubheading>
        <HelpParagraph>
          This shows how much money is sitting on your shelves. StockZip multiplies each
          item&apos;s quantity by its cost to calculate value. You can see:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Total value of all inventory</HelpListItem>
          <HelpListItem>Value broken down by location/category</HelpListItem>
          <HelpListItem>Which items represent the most value</HelpListItem>
        </HelpList>
        <HelpTip>
          High-value items deserve more attention! Consider counting them more often and
          setting up better security or tracking.
        </HelpTip>

        <HelpSubheading>Low Stock Alert Report</HelpSubheading>
        <HelpParagraph>
          This is your reordering checklist. It shows every item that&apos;s below its minimum
          stock level, sorted by urgency:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Out of stock items (most urgent)</HelpListItem>
          <HelpListItem>Below minimum but not zero</HelpListItem>
          <HelpListItem>Suggested reorder quantities if set up</HelpListItem>
        </HelpList>

        <HelpSubheading>Stock Movement Report</HelpSubheading>
        <HelpParagraph>
          This shows inventory flow over time - what came in and what went out. Use it to:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>See how fast items are selling/being used</HelpListItem>
          <HelpListItem>Spot seasonal patterns</HelpListItem>
          <HelpListItem>Identify slow-moving inventory</HelpListItem>
          <HelpListItem>Verify that receipts and shipments are being recorded</HelpListItem>
        </HelpList>

        <HelpSubheading>Activity Log</HelpSubheading>
        <HelpParagraph>
          This is your audit trail - every action taken in StockZip:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Who made changes (user name)</HelpListItem>
          <HelpListItem>What was changed (item, quantity, etc.)</HelpListItem>
          <HelpListItem>When it happened (date and time)</HelpListItem>
        </HelpList>
        <HelpParagraph>
          Great for accountability and troubleshooting discrepancies!
        </HelpParagraph>
      </HelpSection>

      {/* Dashboard Metrics */}
      <HelpSection>
        <HelpHeading>Quick Metrics on the Dashboard</HelpHeading>
        <HelpParagraph>
          Don&apos;t forget - the Dashboard also provides quick metrics without running full reports:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Total item count and inventory value</HelpListItem>
          <HelpListItem>Low stock and out of stock counts</HelpListItem>
          <HelpListItem>Recent activity feed</HelpListItem>
        </HelpList>
        <HelpParagraph>
          For a quick status check, the Dashboard is often enough. Use full reports when you
          need more detail or want to export data.
        </HelpParagraph>
      </HelpSection>

      {/* Exporting */}
      <HelpSection>
        <HelpHeading>Exporting Report Data</HelpHeading>
        <HelpParagraph>
          Need to work with the data in Excel or share it with someone? Export it:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Run the report you want',
              description: 'Generate the report with your desired filters.',
            },
            {
              title: 'Click "Export to CSV"',
              description: 'Usually found at the top right of the report.',
            },
            {
              title: 'Open in Excel',
              description: 'The CSV file works in Excel, Google Sheets, or any spreadsheet app.',
            },
          ]}
        />
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Tips for Getting the Most from Reports</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Check reports regularly:</strong> Make it a habit. Weekly low-stock reviews
            prevent stockouts. Monthly value reports help with planning.
          </HelpListItem>
          <HelpListItem>
            <strong>Use filters to focus:</strong> Reports are more useful when narrowed down.
            Looking at everything at once can be overwhelming.
          </HelpListItem>
          <HelpListItem>
            <strong>Compare periods:</strong> Run the same report for different time periods to
            spot trends. Is value going up? Are stockouts increasing?
          </HelpListItem>
          <HelpListItem>
            <strong>Share with your team:</strong> Export reports and share them in team meetings.
            Everyone benefits from understanding the data.
          </HelpListItem>
          <HelpListItem>
            <strong>Act on what you learn:</strong> Reports are just information. The value comes
            from taking action based on what you discover.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
