'use client'

import { Keyboard } from 'lucide-react'
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

export default function ShortcutsHelp() {
  return (
    <HelpArticleLayout
      title="Keyboard Shortcuts"
      description="Speed up your workflow with keyboard shortcuts"
      icon={Keyboard}
      iconColor="bg-gray-50 text-gray-600"
      prevArticle={{ href: '/help/mobile', title: 'Mobile & Offline' }}
      nextArticle={{ href: '/help/troubleshooting', title: 'Troubleshooting' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Keyboard shortcuts help you work faster by letting you do things without using the
          mouse. Once you learn a few key shortcuts, you&apos;ll be navigating StockZip like a pro!
          These work on desktop computers - if you&apos;re on a Mac, use ⌘ (Command). On Windows
          or Linux, use Ctrl.
        </HelpParagraph>
      </HelpSection>

      {/* Global Shortcuts */}
      <HelpSection>
        <HelpHeading>Global Shortcuts</HelpHeading>
        <HelpParagraph>
          These work from anywhere in StockZip:
        </HelpParagraph>
        <HelpTable
          headers={['Shortcut (Mac)', 'Shortcut (Windows)', 'What It Does']}
          rows={[
            ['⌘ K', 'Ctrl + K', 'Open the quick search - find any item instantly'],
            ['⌘ N', 'Ctrl + N', 'Create a new item'],
            ['⌘ S', 'Ctrl + S', 'Save the current form'],
            ['⌘ Z', 'Ctrl + Z', 'Undo your last action'],
            ['⌘ ,', 'Ctrl + ,', 'Open Settings'],
            ['?', '?', 'Show help (this guide!)'],
          ]}
        />
        <HelpTip type="success">
          The most useful shortcut to learn is <strong>⌘K (or Ctrl+K)</strong> for quick search.
          From anywhere, press it and start typing to find any item!
        </HelpTip>
      </HelpSection>

      {/* Navigation Shortcuts */}
      <HelpSection>
        <HelpHeading>Navigation Shortcuts</HelpHeading>
        <HelpParagraph>
          Jump to different parts of StockZip quickly. These use the pattern &quot;G then a letter&quot;
          - press G, let go, then press the second letter.
        </HelpParagraph>
        <HelpTable
          headers={['Shortcut', 'What It Does']}
          rows={[
            ['G then D', 'Go to Dashboard'],
            ['G then I', 'Go to Inventory'],
            ['G then S', 'Go to Scan'],
          ]}
        />
        <HelpParagraph>
          How to use: Press &quot;G&quot;, release it, then quickly press &quot;D&quot; to go to the Dashboard.
        </HelpParagraph>
      </HelpSection>

      {/* Item Page Shortcuts */}
      <HelpSection>
        <HelpHeading>Item Page Shortcuts</HelpHeading>
        <HelpParagraph>
          When viewing an item&apos;s detail page:
        </HelpParagraph>
        <HelpTable
          headers={['Shortcut', 'What It Does']}
          rows={[
            ['E', 'Edit the item'],
            ['P', 'Print a label for this item'],
            ['C', 'Check out this item'],
            ['Delete / Backspace', 'Delete the item'],
          ]}
        />
      </HelpSection>

      {/* How to Remember */}
      <HelpSection>
        <HelpHeading>How to Remember Shortcuts</HelpHeading>
        <HelpParagraph>
          Most shortcuts follow logical patterns:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>⌘K / Ctrl+K = &quot;K&quot;ommand palette / quick search</strong> - This is a common
            pattern in many apps
          </HelpListItem>
          <HelpListItem>
            <strong>⌘N / Ctrl+N = &quot;N&quot;ew</strong> - Same as creating new documents in most programs
          </HelpListItem>
          <HelpListItem>
            <strong>⌘S / Ctrl+S = &quot;S&quot;ave</strong> - Universal save shortcut
          </HelpListItem>
          <HelpListItem>
            <strong>G then D = &quot;G&quot;o to &quot;D&quot;ashboard</strong> - G for &quot;go&quot;, then the first
            letter of the destination
          </HelpListItem>
          <HelpListItem>
            <strong>E = &quot;E&quot;dit</strong> - First letter of the action
          </HelpListItem>
          <HelpListItem>
            <strong>P = &quot;P&quot;rint</strong> - First letter of the action
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Start with These */}
      <HelpSection>
        <HelpHeading>Start with These Three</HelpHeading>
        <HelpParagraph>
          If you only learn three shortcuts, make them these:
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>
            <strong>⌘K / Ctrl+K</strong> - Quick search. You&apos;ll use this constantly to find items.
          </HelpListItem>
          <HelpListItem>
            <strong>⌘N / Ctrl+N</strong> - New item. Adding inventory is a common task.
          </HelpListItem>
          <HelpListItem>
            <strong>⌘Z / Ctrl+Z</strong> - Undo. Everyone makes mistakes!
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Tips for Using Shortcuts</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Start with one:</strong> Don&apos;t try to memorize all shortcuts at once.
            Learn one, use it until it&apos;s natural, then learn another.
          </HelpListItem>
          <HelpListItem>
            <strong>Quick search is king:</strong> ⌘K / Ctrl+K is the most powerful shortcut.
            Master it first.
          </HelpListItem>
          <HelpListItem>
            <strong>Press ? for help:</strong> If you forget, press ? to see available shortcuts.
          </HelpListItem>
          <HelpListItem>
            <strong>Shortcuts work when focus is correct:</strong> Make sure you&apos;ve clicked
            somewhere in StockZip (not in another browser tab) for shortcuts to work.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
