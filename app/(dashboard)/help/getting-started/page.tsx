'use client'

import { Rocket } from 'lucide-react'
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

export default function GettingStartedHelp() {
  return (
    <HelpArticleLayout
      title="Getting Started"
      description="Create your account and learn the basics of StockZip"
      icon={Rocket}
      iconColor="bg-green-50 text-green-600"
      nextArticle={{ href: '/help/dashboard', title: 'Dashboard Overview' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Welcome to StockZip! This guide will walk you through setting up your account
          and help you understand how everything works. Don&apos;t worry - we&apos;ll explain
          everything in simple terms.
        </HelpParagraph>
      </HelpSection>

      {/* Creating Your Account */}
      <HelpSection>
        <HelpHeading>Creating Your Account</HelpHeading>
        <HelpParagraph>
          Getting started with StockZip is quick and easy. Here&apos;s how to create your account:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Go to StockZip and click "Sign Up"',
              description: 'You\'ll see a sign up button on the main page. Click it to start.',
            },
            {
              title: 'Choose how you want to sign up',
              description: 'You can use your email address and create a password, or click "Continue with Google" to sign up with your Google account (faster!).',
            },
            {
              title: 'Check your email (recommended)',
              description: 'We\'ll send you an email to make sure your email address is real. Click the link in that email.',
            },
            {
              title: 'Create your first item',
              description: 'StockZip will guide you through adding your first inventory item so you can see how it works.',
            },
          ]}
        />
        <HelpTip type="success">
          Signing up with Google is the fastest way to get started - just one click and you&apos;re in!
        </HelpTip>
      </HelpSection>

      {/* First-Time Setup */}
      <HelpSection>
        <HelpHeading>First-Time Setup</HelpHeading>
        <HelpParagraph>
          After you sign up, StockZip helps you set up a few important things:
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>
            <strong>Company Name:</strong> Enter your business or organization name. This shows up on labels and reports.
          </HelpListItem>
          <HelpListItem>
            <strong>Create Your First Item:</strong> Add at least one inventory item to understand how the system works. Don&apos;t worry, this is just practice!
          </HelpListItem>
          <HelpListItem>
            <strong>Explore the Dashboard:</strong> Take a look around. Click on different menu items to see what they do.
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Understanding the Navigation */}
      <HelpSection>
        <HelpHeading>Understanding the Navigation</HelpHeading>
        <HelpParagraph>
          StockZip is organized into different sections. Think of it like different rooms in a house -
          each room has a specific purpose. Here&apos;s what you&apos;ll find:
        </HelpParagraph>
        <HelpTable
          headers={['Section', 'What It Does', 'Where to Find It']}
          rows={[
            ['Dashboard', 'Shows you the big picture - how much inventory you have, what\'s running low, and recent activity', 'Main screen (home)'],
            ['Inventory', 'Where you see, search, and manage all your items', 'Top menu'],
            ['Tasks', 'Purchase orders, receiving shipments, pick lists, and stock counts', 'Side menu'],
            ['Reports', 'Charts and data about your inventory - great for understanding trends', 'Side menu'],
            ['Partners', 'Manage your vendors (suppliers) and customers', 'Side menu'],
            ['Settings', 'Customize StockZip - company info, team members, and preferences', 'Side menu'],
          ]}
        />
      </HelpSection>

      {/* Quick Tour */}
      <HelpSection>
        <HelpHeading>Quick Tour of the Main Features</HelpHeading>

        <HelpSubheading>Adding Items</HelpSubheading>
        <HelpParagraph>
          The most important thing in StockZip is your items - the things you&apos;re tracking.
          To add an item, just click the &quot;+ New Item&quot; button. At minimum, you need to enter:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>A name (what is it?)</HelpListItem>
          <HelpListItem>A quantity (how many do you have?)</HelpListItem>
        </HelpList>
        <HelpParagraph>
          That&apos;s it! You can add more details later, like pictures, prices, and barcodes.
        </HelpParagraph>

        <HelpSubheading>Organizing Items</HelpSubheading>
        <HelpParagraph>
          Use folders to organize your items. Think of folders like physical locations or categories:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Warehouse &rarr; Aisle A &rarr; Shelf 1</HelpListItem>
          <HelpListItem>Store &rarr; Display Cases</HelpListItem>
          <HelpListItem>Van 1, Van 2, Van 3</HelpListItem>
        </HelpList>

        <HelpSubheading>Tracking Stock Levels</HelpSubheading>
        <HelpParagraph>
          StockZip uses simple colors to show you the status of each item:
        </HelpParagraph>
        <HelpList>
          <HelpListItem><strong>Green (In Stock):</strong> You have plenty - above your minimum level</HelpListItem>
          <HelpListItem><strong>Yellow (Low Stock):</strong> Running low - time to think about reordering</HelpListItem>
          <HelpListItem><strong>Red (Out of Stock):</strong> Empty! You need to restock</HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Getting Started Checklist */}
      <HelpSection>
        <HelpHeading>Getting Started Checklist</HelpHeading>
        <HelpParagraph>
          Here&apos;s a handy checklist to help you set up StockZip. You don&apos;t have to do everything at once -
          take your time and check off items as you go:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Create your account and verify your email</HelpListItem>
          <HelpListItem>Complete the onboarding (create your first item)</HelpListItem>
          <HelpListItem>Set your company name and logo in Settings</HelpListItem>
          <HelpListItem>Create a folder structure (like warehouse locations)</HelpListItem>
          <HelpListItem>Add your items (manually or import from a spreadsheet)</HelpListItem>
          <HelpListItem>Set minimum stock levels on important items</HelpListItem>
          <HelpListItem>Invite team members if you work with others</HelpListItem>
          <HelpListItem>Try the barcode scanner on your phone</HelpListItem>
          <HelpListItem>Set up low-stock reminders</HelpListItem>
          <HelpListItem>Add your vendors (suppliers)</HelpListItem>
          <HelpListItem>Print QR labels for your items</HelpListItem>
          <HelpListItem>Do your first stock count</HelpListItem>
          <HelpListItem>Check out the dashboard and reports</HelpListItem>
        </HelpList>
        <HelpTip>
          Don&apos;t feel overwhelmed! Start with just a few items and learn as you go.
          You can always add more features later.
        </HelpTip>
      </HelpSection>

      {/* Need Help? */}
      <HelpSection>
        <HelpHeading>Need More Help?</HelpHeading>
        <HelpParagraph>
          If you get stuck or have questions:
        </HelpParagraph>
        <HelpList>
          <HelpListItem><strong>Click the Help icon</strong> in the navigation to access these guides anytime</HelpListItem>
          <HelpListItem><strong>Ask Zoe</strong> - our AI assistant can answer quick questions</HelpListItem>
          <HelpListItem><strong>Email us</strong> at support@stockzip.com - we&apos;re happy to help!</HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
