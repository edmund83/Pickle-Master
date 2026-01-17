'use client'

import { Smartphone } from 'lucide-react'
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

export default function MobileHelp() {
  return (
    <HelpArticleLayout
      title="Mobile & Offline Usage"
      description="Use StockZip on your phone, even without internet"
      icon={Smartphone}
      iconColor="bg-blue-50 text-blue-600"
      prevArticle={{ href: '/help/import-export', title: 'Import & Export' }}
      nextArticle={{ href: '/help/shortcuts', title: 'Keyboard Shortcuts' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          StockZip is designed to work great on phones and tablets. The mobile version has
          the same features as desktop, with a touch-friendly layout. Best of all, it works
          even when you don&apos;t have internet - perfect for warehouses, basements, or anywhere
          with spotty WiFi.
        </HelpParagraph>
      </HelpSection>

      {/* Mobile Navigation */}
      <HelpSection>
        <HelpHeading>Getting Around on Mobile</HelpHeading>
        <HelpParagraph>
          On phones and tablets, StockZip uses a bottom navigation bar for easy thumb access:
        </HelpParagraph>
        <HelpTable
          headers={['Tab', 'What It Does']}
          rows={[
            ['Dashboard', 'See your inventory overview and metrics'],
            ['Inventory', 'Browse and search all your items'],
            ['Tasks', 'Purchase orders, pick lists, stock counts'],
            ['Scan', 'Open the barcode/QR scanner'],
            ['Profile', 'Your profile and settings'],
          ]}
        />
        <HelpTip type="success">
          The Scan button is front and center because scanning is the fastest way to work
          with inventory on mobile!
        </HelpTip>
      </HelpSection>

      {/* Mobile Features */}
      <HelpSection>
        <HelpHeading>Mobile-Friendly Features</HelpHeading>
        <HelpList>
          <HelpListItem>
            <strong>Large touch targets:</strong> Buttons and links are big enough to tap easily,
            even with one hand
          </HelpListItem>
          <HelpListItem>
            <strong>Pull to refresh:</strong> Swipe down on any list to get the latest data
          </HelpListItem>
          <HelpListItem>
            <strong>Quick quantity adjustments:</strong> Big +1/-1 buttons for fast counting
          </HelpListItem>
          <HelpListItem>
            <strong>Camera scanning:</strong> Use your phone&apos;s camera to scan barcodes and QR codes
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Offline Mode */}
      <HelpSection>
        <HelpHeading>Working Offline</HelpHeading>
        <HelpParagraph>
          No internet? No problem! StockZip continues to work even when you&apos;re offline.
        </HelpParagraph>

        <HelpSubheading>What Works Offline</HelpSubheading>
        <HelpList>
          <HelpListItem>Browse all your inventory</HelpListItem>
          <HelpListItem>Search and filter items</HelpListItem>
          <HelpListItem>View item details</HelpListItem>
          <HelpListItem>Adjust quantities</HelpListItem>
          <HelpListItem>Scan barcodes and QR codes</HelpListItem>
          <HelpListItem>Create new items</HelpListItem>
        </HelpList>

        <HelpSubheading>How You Know You&apos;re Offline</HelpSubheading>
        <HelpParagraph>
          When you lose internet connection:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>A banner appears saying &quot;Offline&quot;</HelpListItem>
          <HelpListItem>You&apos;ll see a count of pending changes waiting to sync</HelpListItem>
          <HelpListItem>Changes are automatically queued - you don&apos;t need to do anything special</HelpListItem>
        </HelpList>

        <HelpSubheading>When You&apos;re Back Online</HelpSubheading>
        <HelpParagraph>
          As soon as your internet comes back:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>StockZip automatically syncs your changes</HelpListItem>
          <HelpListItem>Usually takes less than 30 seconds</HelpListItem>
          <HelpListItem>If there are any conflicts (someone else changed the same thing),
            StockZip will ask you how to handle it</HelpListItem>
        </HelpList>
        <HelpTip>
          Don&apos;t worry about losing work when you go offline. StockZip keeps everything safe
          and syncs it when you reconnect.
        </HelpTip>
      </HelpSection>

      {/* Installing as App */}
      <HelpSection>
        <HelpHeading>Installing StockZip on Your Phone</HelpHeading>
        <HelpParagraph>
          You can add StockZip to your home screen like a regular app. This is called a
          &quot;Progressive Web App&quot; (PWA). It gives you:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>An icon on your home screen</HelpListItem>
          <HelpListItem>Full-screen experience without browser bars</HelpListItem>
          <HelpListItem>Faster loading</HelpListItem>
          <HelpListItem>Better offline support</HelpListItem>
        </HelpList>

        <HelpSubheading>On iPhone (Safari)</HelpSubheading>
        <HelpSteps
          steps={[
            {
              title: 'Open StockZip in Safari',
              description: 'Must be Safari - doesn\'t work from Chrome on iPhone.',
            },
            {
              title: 'Tap the Share button',
              description: 'The square with an arrow pointing up, at the bottom of the screen.',
            },
            {
              title: 'Scroll and tap "Add to Home Screen"',
              description: 'You might need to scroll down in the share menu to find it.',
            },
            {
              title: 'Tap "Add"',
              description: 'StockZip is now on your home screen!',
            },
          ]}
        />

        <HelpSubheading>On Android (Chrome)</HelpSubheading>
        <HelpSteps
          steps={[
            {
              title: 'Open StockZip in Chrome',
              description: 'Use the Chrome browser.',
            },
            {
              title: 'Tap the menu button',
              description: 'The three dots in the top right corner.',
            },
            {
              title: 'Tap "Add to Home screen"',
              description: 'Chrome might also show a banner at the bottom - you can tap that instead.',
            },
            {
              title: 'Tap "Add"',
              description: 'StockZip is now on your home screen!',
            },
          ]}
        />
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Tips for Mobile Usage</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Install the app:</strong> Adding to home screen gives a better experience
            than using the browser.
          </HelpListItem>
          <HelpListItem>
            <strong>Use scanning:</strong> Scanning barcodes is much faster than typing on a
            phone keyboard.
          </HelpListItem>
          <HelpListItem>
            <strong>Sync before going offline:</strong> If you know you&apos;ll be in a dead zone,
            open StockZip while you have internet so your data is fresh.
          </HelpListItem>
          <HelpListItem>
            <strong>Pull to refresh:</strong> When you come back online, pull down on any
            list to make sure you have the latest data.
          </HelpListItem>
          <HelpListItem>
            <strong>Watch the offline indicator:</strong> If you see &quot;Offline&quot;, your changes
            will sync when you reconnect.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
