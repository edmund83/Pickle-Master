'use client'

import { ScanBarcode } from 'lucide-react'
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

export default function ScanningHelp() {
  return (
    <HelpArticleLayout
      title="Barcode & QR Code Scanning"
      description="Use your camera or scanner to quickly find and update items"
      icon={ScanBarcode}
      iconColor="bg-cyan-50 text-cyan-600"
      prevArticle={{ href: '/help/folders', title: 'Organizing with Folders' }}
      nextArticle={{ href: '/help/labels', title: 'Printing Labels' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          Scanning is the fastest way to work with your inventory. Instead of typing item names
          or searching, just point your camera at a barcode or QR code and StockZip instantly
          finds the item for you. You can use your phone&apos;s camera or a handheld barcode scanner.
        </HelpParagraph>
      </HelpSection>

      {/* How to Access the Scanner */}
      <HelpSection>
        <HelpHeading>How to Access the Scanner</HelpHeading>
        <HelpSteps
          steps={[
            {
              title: 'Click the "Scan" button',
              description: 'On mobile, it\'s in the bottom navigation bar. On desktop, look in the top navigation.',
            },
            {
              title: 'Allow camera access',
              description: 'The first time you scan, your browser will ask permission to use your camera. Click "Allow".',
            },
            {
              title: 'Point at the barcode',
              description: 'Hold your device steady and point the camera at the barcode or QR code. Keep it within the scanning area on screen.',
            },
          ]}
        />
        <HelpTip type="success">
          Once your camera finds the barcode, StockZip reads it instantly - you don&apos;t need to
          click anything!
        </HelpTip>
      </HelpSection>

      {/* Scanning Modes */}
      <HelpSection>
        <HelpHeading>Different Ways to Scan</HelpHeading>
        <HelpParagraph>
          StockZip offers different scanning modes depending on what you need to do:
        </HelpParagraph>
        <HelpTable
          headers={['Mode', 'Best For', 'How It Works']}
          rows={[
            ['Single Scan', 'Looking up one item', 'Scan once, see the item details, make changes if needed'],
            ['Quick Adjust', 'Fast inventory updates', 'Scan → adjust quantity → save → ready for next scan'],
            ['Batch Counting', 'Stock counts', 'Keep scanning items one after another. Great for counting everything on a shelf.'],
          ]}
        />
      </HelpSection>

      {/* What Happens When You Scan */}
      <HelpSection>
        <HelpHeading>What Happens When You Scan</HelpHeading>

        <HelpSubheading>If the Barcode Exists in Your Inventory</HelpSubheading>
        <HelpParagraph>
          Great news! StockZip found the item. You&apos;ll immediately see:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>The item name, photo, and current quantity</HelpListItem>
          <HelpListItem>Quick buttons to adjust quantity (+1, -1, or type a number)</HelpListItem>
          <HelpListItem>Option to view full details or check out the item</HelpListItem>
        </HelpList>

        <HelpSubheading>If the Barcode is NOT Found</HelpSubheading>
        <HelpParagraph>
          No problem! This just means the barcode isn&apos;t in your system yet. StockZip will:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Ask if you want to add a new item</HelpListItem>
          <HelpListItem>Pre-fill the barcode number in the form for you</HelpListItem>
          <HelpListItem>Let you add the rest of the details (name, quantity, etc.)</HelpListItem>
        </HelpList>
        <HelpTip>
          This is actually a great way to add new items! Just scan the product&apos;s barcode and fill
          in the rest. The barcode is already captured for you.
        </HelpTip>
      </HelpSection>

      {/* Supported Barcode Types */}
      <HelpSection>
        <HelpHeading>Barcode Types That Work</HelpHeading>
        <HelpParagraph>
          StockZip can read many different kinds of barcodes. Here are the most common:
        </HelpParagraph>
        <HelpTable
          headers={['Barcode Type', 'What It Looks Like', 'Common Use']}
          rows={[
            ['QR Code', 'Square with small squares inside', 'Custom labels, equipment tags, quick lookup'],
            ['UPC-A', '12-digit barcode (common in USA)', 'Products you buy at stores'],
            ['EAN-13', '13-digit barcode (international)', 'Products from around the world'],
            ['EAN-8', 'Short 8-digit barcode', 'Small products'],
            ['Code 128', 'Compact, can include letters and numbers', 'Shipping, internal tracking'],
            ['Code 39', 'Older format, letters and numbers', 'Warehouse labels, older systems'],
            ['ITF-14', '14-digit barcode', 'Shipping boxes and containers'],
          ]}
        />
        <HelpTip type="info">
          Don&apos;t worry about remembering these types! StockZip automatically figures out what
          kind of barcode you&apos;re scanning.
        </HelpTip>
      </HelpSection>

      {/* Using Hardware Scanners */}
      <HelpSection>
        <HelpHeading>Using a Handheld Barcode Scanner</HelpHeading>
        <HelpParagraph>
          While your phone&apos;s camera works great, some people prefer handheld scanners.
          They&apos;re faster and work better in tricky lighting. Here&apos;s how to use them:
        </HelpParagraph>

        <HelpSubheading>USB Barcode Scanners</HelpSubheading>
        <HelpParagraph>
          These plug directly into your computer:
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>Plug the scanner into your computer&apos;s USB port</HelpListItem>
          <HelpListItem>Click in any text field (like the search box)</HelpListItem>
          <HelpListItem>Scan the barcode - the scanner types it for you like a keyboard!</HelpListItem>
        </HelpList>

        <HelpSubheading>Bluetooth Scanners</HelpSubheading>
        <HelpParagraph>
          These connect wirelessly to your phone or tablet:
        </HelpParagraph>
        <HelpList ordered>
          <HelpListItem>Pair the scanner with your device using Bluetooth settings</HelpListItem>
          <HelpListItem>Open StockZip and tap a text field</HelpListItem>
          <HelpListItem>Scan - works just like typing!</HelpListItem>
        </HelpList>
        <HelpTip type="success">
          Hardware scanners work in any text field - the search box, quantity fields, anywhere.
          Just make sure the field is selected (clicked on) before you scan.
        </HelpTip>
      </HelpSection>

      {/* Enterprise Scanner Configuration */}
      <HelpSection>
        <HelpHeading>Enterprise Handheld Scanners</HelpHeading>
        <HelpParagraph>
          If you&apos;re using an enterprise mobile computer with a built-in scanner (Zebra, Honeywell,
          Datalogic, etc.), you need to configure it to work with web apps like StockZip. Each brand
          has its own configuration app, but they all work the same way: sending scans as keyboard input.
        </HelpParagraph>

        <HelpTip type="info">
          The key is to enable &quot;Keyboard Wedge&quot; or &quot;Keystroke Output&quot; mode, which makes the
          scanner type the barcode into the focused input field, followed by an Enter key.
        </HelpTip>
      </HelpSection>

      {/* Zebra DataWedge */}
      <HelpSection>
        <HelpHeading>Zebra Devices (DataWedge)</HelpHeading>
        <HelpParagraph>
          Zebra devices like the TC22, TC52, MC33, and others use <strong>DataWedge</strong> to
          control scanner output.
        </HelpParagraph>

        <HelpSubheading>Setting Up DataWedge</HelpSubheading>
        <HelpSteps
          steps={[
            {
              title: 'Open the DataWedge app',
              description: 'Find DataWedge in your app drawer. It has a barcode icon with a blue background.',
            },
            {
              title: 'Create or select a profile',
              description: 'Tap the menu (three dots) and select "New profile". Name it "StockZip" or select your browser\'s existing profile (e.g., "Chrome").',
            },
            {
              title: 'Associate with your browser',
              description: 'Tap "Associated apps" and add your browser (Chrome, Edge, or the PWA). This tells DataWedge to use these settings when that app is open.',
            },
            {
              title: 'Enable Keystroke Output',
              description: 'Scroll to "Keystroke Output" and make sure it\'s enabled. This makes the scanner type the barcode like a keyboard.',
            },
            {
              title: 'Configure the Enter key',
              description: 'Under "Basic data formatting", enable "Send ENTER key" or set "Send data" → "Send as suffix" → "Carriage Return". This tells StockZip the scan is complete.',
            },
            {
              title: 'Disable Intent Output (optional)',
              description: 'If you see "Intent Output" enabled, you can disable it. Intent mode is for native apps, not web apps.',
            },
          ]}
        />

        <HelpSubheading>DataWedge Quick Settings</HelpSubheading>
        <HelpTable
          headers={['Setting', 'Recommended Value', 'Why']}
          rows={[
            ['Keystroke Output', 'Enabled', 'Sends scans as keyboard input to web apps'],
            ['Send ENTER key', 'Enabled', 'Tells StockZip the barcode is complete'],
            ['Intent Output', 'Disabled', 'Not needed for web apps'],
            ['Key event delay', '0 ms', 'Faster scanning (increase if characters are missing)'],
          ]}
        />

        <HelpSubheading>Supported Zebra Models</HelpSubheading>
        <HelpList>
          <HelpListItem>TC22, TC26, TC27 (touch computers)</HelpListItem>
          <HelpListItem>TC52, TC53, TC57, TC58 (enterprise touch computers)</HelpListItem>
          <HelpListItem>TC72, TC73, TC77, TC78 (rugged touch computers)</HelpListItem>
          <HelpListItem>MC33, MC93 (mobile computers)</HelpListItem>
          <HelpListItem>TC8300 (warehouse computer)</HelpListItem>
          <HelpListItem>EC50, EC55 (enterprise computers)</HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Honeywell */}
      <HelpSection>
        <HelpHeading>Honeywell Devices</HelpHeading>
        <HelpParagraph>
          Honeywell devices like the CT40, CT60, CK65, and EDA series use <strong>Honeywell Settings</strong> or
          <strong> EZConfig</strong> to configure scanner output.
        </HelpParagraph>

        <HelpSubheading>Setting Up Honeywell Scanners</HelpSubheading>
        <HelpSteps
          steps={[
            {
              title: 'Open Settings → Honeywell Settings',
              description: 'Or look for "Scanning" in your device settings. Some models have a dedicated "EZConfig" app.',
            },
            {
              title: 'Go to Scanning → Internal Scanner',
              description: 'Select the built-in scanner configuration.',
            },
            {
              title: 'Set Data Processing → Wedge',
              description: 'Change the output mode to "Keyboard Wedge" or "Wedge as keys". This makes scans appear as keyboard input.',
            },
            {
              title: 'Add Enter key suffix',
              description: 'Under "Wedge Settings" or "Data Editing", add a suffix of CR (Carriage Return) or Enter key.',
            },
            {
              title: 'Disable Intent mode',
              description: 'Make sure "Intent Output" or "Broadcast" is disabled if you only need web app support.',
            },
          ]}
        />

        <HelpSubheading>Supported Honeywell Models</HelpSubheading>
        <HelpList>
          <HelpListItem>CT40, CT45, CT47, CT60 (mobile computers)</HelpListItem>
          <HelpListItem>CK65, CK3X (mobile computers)</HelpListItem>
          <HelpListItem>EDA51, EDA52, EDA56, EDA61K (enterprise devices)</HelpListItem>
          <HelpListItem>CN80, CN51 (mobile computers)</HelpListItem>
          <HelpListItem>Dolphin series (CT50, CT60XP)</HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Datalogic */}
      <HelpSection>
        <HelpHeading>Datalogic Devices</HelpHeading>
        <HelpParagraph>
          Datalogic devices like the Memor, Skorpio, and Falcon series use <strong>SoftSpot</strong> or
          <strong> DL-Config</strong> to configure scanner settings.
        </HelpParagraph>

        <HelpSubheading>Setting Up Datalogic Scanners</HelpSubheading>
        <HelpSteps
          steps={[
            {
              title: 'Open Settings → Datalogic Settings',
              description: 'Or find "Scanner Settings" or "SoftSpot" in your app drawer.',
            },
            {
              title: 'Go to Scanner → Wedge',
              description: 'Enable the keyboard wedge output mode.',
            },
            {
              title: 'Enable Keyboard Wedge',
              description: 'Toggle "Enable Wedge" or "Keyboard Emulation" to ON.',
            },
            {
              title: 'Set suffix to Enter',
              description: 'Under "Wedge Settings" or "Formatting", add Enter or Carriage Return as the suffix character.',
            },
          ]}
        />

        <HelpSubheading>Supported Datalogic Models</HelpSubheading>
        <HelpList>
          <HelpListItem>Memor 10, Memor 11, Memor 20 (mobile computers)</HelpListItem>
          <HelpListItem>Skorpio X3, X4, X5 (rugged mobile computers)</HelpListItem>
          <HelpListItem>Falcon X3, X4 (mobile computers)</HelpListItem>
          <HelpListItem>Joya Touch series</HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Other Brands */}
      <HelpSection>
        <HelpHeading>Other Scanner Brands</HelpHeading>
        <HelpParagraph>
          Most enterprise scanners from other manufacturers work similarly. Look for these settings:
        </HelpParagraph>

        <HelpTable
          headers={['Brand', 'Config App', 'Key Setting']}
          rows={[
            ['Unitech', 'Unitech Scanner Settings', 'Enable Keyboard Wedge + Enter suffix'],
            ['CipherLab', 'Reader Config or AppLock', 'Output: Keyboard Emulation + Terminator: Enter'],
            ['Point Mobile', 'EmKit or Scanner Settings', 'Wedge Mode: Keyboard + Suffix: CR'],
            ['Urovo', 'Scanner Settings', 'Output Mode: Keyboard Simulation + Add Enter'],
            ['iData', 'iData Settings', 'Keyboard Wedge Mode + Enter Suffix'],
            ['Chainway', 'Scanner Settings', 'Wedge Output + Carriage Return'],
          ]}
        />

        <HelpTip type="success">
          The universal rule: Enable &quot;Keyboard Wedge&quot; mode and add &quot;Enter&quot; as a suffix.
          This works with any web app, not just StockZip!
        </HelpTip>
      </HelpSection>

      {/* General Tips */}
      <HelpSection>
        <HelpHeading>Tips for All Enterprise Scanners</HelpHeading>
        <HelpList>
          <HelpListItem>
            <strong>Always tap the input field first:</strong> The scanner types into whatever is
            focused. Make sure you tap the scanner input field on the scan page before pressing the
            scan button.
          </HelpListItem>
          <HelpListItem>
            <strong>Use keyboard wedge mode:</strong> This is the most compatible mode for web apps.
            Avoid &quot;Intent&quot; or &quot;Broadcast&quot; modes as they only work with native Android apps.
          </HelpListItem>
          <HelpListItem>
            <strong>Add Enter key suffix:</strong> Without the Enter key, StockZip doesn&apos;t know when
            the barcode is complete. Always configure your scanner to send Enter after the barcode.
          </HelpListItem>
          <HelpListItem>
            <strong>Test with a simple app first:</strong> Open any note-taking app and scan a barcode.
            If the barcode appears followed by a new line, your scanner is configured correctly.
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Troubleshooting */}
      <HelpSection>
        <HelpHeading>Scanning Not Working? Try This</HelpHeading>
        <HelpList>
          <HelpListItem>
            <strong>Check camera permission:</strong> Make sure you allowed StockZip to use your camera.
            You can check this in your browser or phone settings.
          </HelpListItem>
          <HelpListItem>
            <strong>Improve the lighting:</strong> Scanning works best with good light. Move to a
            brighter area or turn on more lights.
          </HelpListItem>
          <HelpListItem>
            <strong>Hold steady:</strong> Keep your hand still while scanning. Moving too much makes
            it hard to read.
          </HelpListItem>
          <HelpListItem>
            <strong>Find the right distance:</strong> Not too close, not too far. Usually 6-12 inches
            (15-30 cm) works best.
          </HelpListItem>
          <HelpListItem>
            <strong>Clean the camera:</strong> Smudges on your camera lens can make scanning difficult.
            Give it a quick wipe!
          </HelpListItem>
        </HelpList>

        <HelpSubheading>Enterprise Scanner Not Working?</HelpSubheading>
        <HelpList>
          <HelpListItem>
            <strong>Tap the input field:</strong> Make sure you tap the &quot;Scanner input&quot; field on
            the scan page before pressing the scan button. The scanner types into whatever is focused.
          </HelpListItem>
          <HelpListItem>
            <strong>Enable keyboard wedge mode:</strong> Open your scanner&apos;s settings app (DataWedge for Zebra,
            Honeywell Settings, DL-Config for Datalogic, etc.) and enable &quot;Keyboard Wedge&quot; or &quot;Keystroke Output&quot;.
          </HelpListItem>
          <HelpListItem>
            <strong>Add Enter key suffix:</strong> Configure your scanner to send an Enter key (carriage return)
            after each scan. Without this, StockZip doesn&apos;t know the scan is complete.
          </HelpListItem>
          <HelpListItem>
            <strong>Disable Intent/Broadcast output:</strong> Intent mode only works with native Android apps.
            Disable it if you&apos;re only using web apps.
          </HelpListItem>
          <HelpListItem>
            <strong>Try increasing key delay:</strong> If characters are missing from your scans,
            increase the keystroke delay to 10-20ms in your scanner settings.
          </HelpListItem>
          <HelpListItem>
            <strong>Test in a notes app:</strong> Open any notes app and scan. If the barcode appears
            followed by a new line, your scanner is configured correctly for web apps.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
