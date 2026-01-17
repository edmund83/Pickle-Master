'use client'

import { Calculator } from 'lucide-react'
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

export default function StockCountsHelp() {
  return (
    <HelpArticleLayout
      title="Stock Counts (Cycle Counting)"
      description="Verify your inventory is accurate"
      icon={Calculator}
      iconColor="bg-teal-50 text-teal-600"
      prevArticle={{ href: '/help/pick-lists', title: 'Pick Lists' }}
      nextArticle={{ href: '/help/checkouts', title: 'Check-In / Check-Out' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          A stock count (also called &quot;cycle counting&quot;) is when you physically count your
          inventory and compare it to what StockZip says you have. This helps catch mistakes,
          find missing items, and keep your records accurate. Regular counts are important -
          they&apos;re how you make sure your computer numbers match reality!
        </HelpParagraph>
      </HelpSection>

      {/* Why Count */}
      <HelpSection>
        <HelpHeading>Why Do Stock Counts?</HelpHeading>
        <HelpParagraph>
          Even with the best systems, differences can happen:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Items get misplaced or put in the wrong spot</HelpListItem>
          <HelpListItem>Someone takes something without recording it</HelpListItem>
          <HelpListItem>Theft or loss</HelpListItem>
          <HelpListItem>Data entry mistakes</HelpListItem>
          <HelpListItem>Damaged items that weren&apos;t removed from inventory</HelpListItem>
        </HelpList>
        <HelpParagraph>
          Regular counts catch these issues before they become big problems.
        </HelpParagraph>
      </HelpSection>

      {/* Creating a Stock Count */}
      <HelpSection>
        <HelpHeading>Creating a Stock Count</HelpHeading>
        <HelpSteps
          steps={[
            {
              title: 'Go to Tasks → Stock Count',
              description: 'Click "Tasks" in the sidebar, then "Stock Count".',
            },
            {
              title: 'Click "+ New Count"',
              description: 'Start a new stock count.',
            },
            {
              title: 'Choose what to count',
              description: 'Count everything? Just one folder? Just one shelf? Pick the scope.',
            },
            {
              title: 'Assign someone (optional)',
              description: 'Who will do the counting?',
            },
            {
              title: 'Set a due date (optional)',
              description: 'When should the count be finished?',
            },
            {
              title: 'Click Create',
              description: 'The stock count is ready to start.',
            },
          ]}
        />
        <HelpTip type="success">
          Start small! If you&apos;ve never done a stock count, try counting just one shelf or
          folder first. Get comfortable with the process before counting everything.
        </HelpTip>
      </HelpSection>

      {/* Doing the Count */}
      <HelpSection>
        <HelpHeading>Performing the Count</HelpHeading>
        <HelpParagraph>
          Once you&apos;ve created a stock count, here&apos;s how to do the actual counting:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Open the stock count',
              description: 'Find it in Tasks → Stock Count and click to open.',
            },
            {
              title: 'Click "Start Count"',
              description: 'This begins the counting process.',
            },
            {
              title: 'Find each item physically',
              description: 'Go to where the item is stored.',
            },
            {
              title: 'Count the actual quantity',
              description: 'Physically count how many you really have.',
            },
            {
              title: 'Enter the number in StockZip',
              description: 'Type the actual quantity you counted.',
            },
            {
              title: 'Click "Mark Counted"',
              description: 'Move on to the next item.',
            },
            {
              title: 'Watch the progress bar',
              description: 'It shows how many items you\'ve counted out of the total.',
            },
          ]}
        />
      </HelpSection>

      {/* Understanding Variance */}
      <HelpSection>
        <HelpHeading>Understanding the Difference (Variance)</HelpHeading>
        <HelpParagraph>
          As you count, StockZip shows you the &quot;variance&quot; - the difference between what
          the computer says and what you actually counted:
        </HelpParagraph>
        <HelpTable
          headers={['Term', 'What It Means', 'Example']}
          rows={[
            ['Expected', 'What StockZip thinks you have', '50 units'],
            ['Actual', 'What you physically counted', '47 units'],
            ['Variance', 'The difference (actual - expected)', '-3 units'],
            ['Percentage', 'How big is the difference?', '-6%'],
          ]}
        />
        <HelpParagraph>
          <strong>Positive variance (+):</strong> You have MORE than expected. Maybe items
          weren&apos;t recorded when received, or data entry errors.
        </HelpParagraph>
        <HelpParagraph>
          <strong>Negative variance (-):</strong> You have LESS than expected. Could be loss,
          theft, damage, or unrecorded usage.
        </HelpParagraph>
      </HelpSection>

      {/* Completing the Count */}
      <HelpSection>
        <HelpHeading>Finishing the Count</HelpHeading>
        <HelpSteps
          steps={[
            {
              title: 'Count all items',
              description: 'Or as many as you plan to count today.',
            },
            {
              title: 'Click "Submit for Review"',
              description: 'This marks counting as complete and ready for review.',
            },
            {
              title: 'Review the variances',
              description: 'Look at items with differences. Do they make sense?',
            },
            {
              title: 'Decide what to do',
              description: 'You can investigate, recount suspicious items, or accept the counts.',
            },
            {
              title: 'Click "Apply Adjustments"',
              description: 'This updates your inventory to match what you counted.',
            },
            {
              title: 'Click "Complete"',
              description: 'The stock count is finished!',
            },
          ]}
        />
        <HelpTip type="warning">
          Before applying adjustments, double-check items with big differences. It&apos;s easier
          to recount now than to fix mistakes later!
        </HelpTip>
      </HelpSection>

      {/* Stock Count Status */}
      <HelpSection>
        <HelpHeading>Stock Count Status</HelpHeading>
        <HelpTable
          headers={['Status', 'What It Means']}
          rows={[
            ['Draft', 'Count created but not started yet'],
            ['In Progress', 'Counting is underway'],
            ['Review', 'Counting done, awaiting someone to review and approve'],
            ['Completed', 'Count finalized, adjustments have been made'],
          ]}
        />
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Tips for Accurate Counts</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Count when it&apos;s quiet:</strong> Do counts when there&apos;s less activity.
            Early morning or after hours works well.
          </HelpListItem>
          <HelpListItem>
            <strong>Stop inventory movement:</strong> If possible, pause picking and receiving
            during the count to avoid confusion.
          </HelpListItem>
          <HelpListItem>
            <strong>Use barcode scanning:</strong> Scanning is faster and prevents counting
            the wrong item.
          </HelpListItem>
          <HelpListItem>
            <strong>Count regularly:</strong> Small, frequent counts are better than one huge
            annual count. Weekly counts of different sections work well.
          </HelpListItem>
          <HelpListItem>
            <strong>Investigate variances:</strong> Big differences usually mean something.
            Find out what happened to prevent it in the future.
          </HelpListItem>
          <HelpListItem>
            <strong>Keep counting areas organized:</strong> Messy shelves lead to miscounts.
            Organize as you count!
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
