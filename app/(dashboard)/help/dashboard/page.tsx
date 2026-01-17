'use client'

import { LayoutDashboard } from 'lucide-react'
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
} from '../components/HelpArticleLayout'

export default function DashboardHelp() {
  return (
    <HelpArticleLayout
      title="Dashboard Overview"
      description="Your inventory command center - see everything at a glance"
      icon={LayoutDashboard}
      iconColor="bg-blue-50 text-blue-600"
      prevArticle={{ href: '/help/getting-started', title: 'Getting Started' }}
      nextArticle={{ href: '/help/items', title: 'Managing Items' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          The Dashboard is like the control panel of your inventory. When you log in, this is the
          first thing you see. It shows you the most important information at a glance, so you
          can quickly understand what&apos;s happening with your stock.
        </HelpParagraph>
      </HelpSection>

      {/* Dashboard Widgets */}
      <HelpSection>
        <HelpHeading>What You&apos;ll See on the Dashboard</HelpHeading>
        <HelpParagraph>
          The Dashboard has several &quot;widgets&quot; (boxes with information). Each widget shows you
          something important about your inventory:
        </HelpParagraph>
        <HelpTable
          headers={['Widget', 'What It Shows']}
          rows={[
            ['Total Items', 'The total number of different items you have in your inventory. For example, if you have screws, nails, and bolts, that would be 3 items.'],
            ['Total Value', 'How much all your stock is worth combined. This is calculated by multiplying each item\'s quantity by its price.'],
            ['Low Stock', 'Items that are running low (below the minimum level you set). These are items you should think about reordering soon.'],
            ['Out of Stock', 'Items where the quantity has reached zero. You\'ve run out of these!'],
            ['Recent Activity', 'A list of the latest changes made by you or your team - like adding items, adjusting quantities, etc.'],
          ]}
        />
        <HelpTip>
          Click on any of these boxes to see more details! For example, clicking &quot;Low Stock&quot; will
          show you a list of all items that are running low.
        </HelpTip>
      </HelpSection>

      {/* Status Colors */}
      <HelpSection>
        <HelpHeading>Understanding the Colors</HelpHeading>
        <HelpParagraph>
          StockZip uses simple traffic-light colors to help you quickly see how your items are doing:
        </HelpParagraph>

        <HelpSubheading>Green (In Stock)</HelpSubheading>
        <HelpParagraph>
          Everything is good! The quantity of this item is above the minimum level you set.
          No action needed.
        </HelpParagraph>

        <HelpSubheading>Yellow (Low Stock)</HelpSubheading>
        <HelpParagraph>
          Warning! This item is running low. The quantity is below the minimum level, but you
          still have some left. Time to think about ordering more.
        </HelpParagraph>

        <HelpSubheading>Red (Out of Stock)</HelpSubheading>
        <HelpParagraph>
          Alert! You&apos;ve run out of this item - the quantity is zero. You need to restock as
          soon as possible.
        </HelpParagraph>

        <HelpTip type="success">
          To use these colors effectively, make sure you set a &quot;minimum stock level&quot; for your
          important items. Without a minimum set, StockZip can&apos;t know when something is &quot;low.&quot;
        </HelpTip>
      </HelpSection>

      {/* Quick Actions */}
      <HelpSection>
        <HelpHeading>What You Can Do from the Dashboard</HelpHeading>
        <HelpParagraph>
          The Dashboard isn&apos;t just for looking - you can take action right from here:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>Click any number card</strong> to see the related items. Click &quot;Low Stock&quot; to
            see all low-stock items, click &quot;Out of Stock&quot; to see empty items, etc.
          </HelpListItem>
          <HelpListItem>
            <strong>View the Activity Feed</strong> to see what&apos;s been happening recently.
            This shows changes like &quot;John added 10 units of Widget A&quot; or &quot;Sarah adjusted
            quantity of Part B.&quot;
          </HelpListItem>
          <HelpListItem>
            <strong>See alerts</strong> for items that need your attention - things like items
            about to expire, overdue checkouts, or pending orders.
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Understanding Your Metrics */}
      <HelpSection>
        <HelpHeading>Making Sense of Your Numbers</HelpHeading>

        <HelpSubheading>Total Items vs Total Quantity</HelpSubheading>
        <HelpParagraph>
          These are different things! Let&apos;s use an example:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            You have 3 types of screws: small, medium, and large. That&apos;s <strong>3 items</strong>.
          </HelpListItem>
          <HelpListItem>
            You have 100 small screws, 50 medium screws, and 25 large screws.
            That&apos;s <strong>175 total quantity</strong>.
          </HelpListItem>
        </HelpList>

        <HelpSubheading>Total Value</HelpSubheading>
        <HelpParagraph>
          This is how much all your inventory is worth. StockZip calculates this by:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Taking each item&apos;s quantity</HelpListItem>
          <HelpListItem>Multiplying it by the price you entered</HelpListItem>
          <HelpListItem>Adding up all those numbers</HelpListItem>
        </HelpList>
        <HelpParagraph>
          For example: If you have 100 widgets worth $5 each, the value of that item is $500.
          The Total Value shows the sum of all items.
        </HelpParagraph>
        <HelpTip type="warning">
          If some items don&apos;t have prices entered, they won&apos;t be included in the total value.
          Make sure to add prices to all items for an accurate total.
        </HelpTip>
      </HelpSection>

      {/* Tips for Using the Dashboard */}
      <HelpSection>
        <HelpHeading>Tips for Getting the Most Out of Your Dashboard</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Check it daily:</strong> Make a habit of looking at your dashboard every morning.
            It only takes a few seconds and helps you catch problems early.
          </HelpListItem>
          <HelpListItem>
            <strong>Set meaningful minimums:</strong> The Low Stock widget only helps if you&apos;ve set
            minimum levels. Think about how much of each item you need to keep on hand.
          </HelpListItem>
          <HelpListItem>
            <strong>Watch the activity feed:</strong> If you have a team, the activity feed helps
            you stay on top of what everyone is doing.
          </HelpListItem>
          <HelpListItem>
            <strong>Act on alerts:</strong> When you see items in Low Stock or Out of Stock,
            take action! Create a purchase order to restock.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
