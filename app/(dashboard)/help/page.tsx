import { HelpCircle, BookOpen, MessageCircle, Mail, ExternalLink, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const FAQ_ITEMS = [
  {
    question: 'How do I add a new inventory item?',
    answer: 'Navigate to Inventory in the sidebar, then click the "Add Item" button. Fill in the item details like name, quantity, price, and optionally add images and tags.',
  },
  {
    question: 'How do I organize items into folders?',
    answer: 'You can create folders from the Inventory page by clicking "New Folder". Then drag and drop items into folders, or select the folder when creating/editing an item.',
  },
  {
    question: 'What do the stock status colors mean?',
    answer: 'Green (In Stock) means your item quantity is above the low stock threshold. Yellow (Low Stock) means you\'re running low and should reorder soon. Red (Out of Stock) means the quantity has reached zero.',
  },
  {
    question: 'How do I set up low stock alerts?',
    answer: 'Go to Settings > Alerts to configure low stock thresholds for your items. You\'ll receive notifications when items fall below the threshold.',
  },
  {
    question: 'Can I track item movements between locations?',
    answer: 'Yes! Use the Workflows > Stock Moves feature to transfer items between folders/locations. All movements are logged in your activity history.',
  },
  {
    question: 'How do I create a pick list for orders?',
    answer: 'Go to Workflows > Pick Lists and click "New Pick List". Add items you need to pick, and mark them as picked as you process the order.',
  },
  {
    question: 'How do I invite team members?',
    answer: 'Go to Settings > Team and click "Invite Member". Enter their email and assign a role (Admin, Editor, or Viewer).',
  },
  {
    question: 'What\'s the difference between user roles?',
    answer: 'Owners have full access. Admins can manage settings and team members. Editors can add, edit, and delete inventory. Viewers can only view inventory data.',
  },
]

const QUICK_LINKS = [
  {
    title: 'Getting Started Guide',
    description: 'Learn the basics of Nook inventory management',
    icon: BookOpen,
    href: '#getting-started',
  },
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step video guides',
    icon: ExternalLink,
    href: '#tutorials',
  },
  {
    title: 'Contact Support',
    description: 'Get help from our support team',
    icon: MessageCircle,
    href: '#support',
  },
]

export default function HelpPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Help Center</h1>
        <p className="mt-1 text-neutral-500">
          Find answers, learn tips, and get support
        </p>
      </div>

      <div className="p-8">
        {/* Quick Links */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <link.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 group-hover:text-primary">
                  {link.title}
                </h3>
                <p className="mt-0.5 text-sm text-neutral-500">{link.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-primary" />
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="rounded-xl border border-neutral-200 bg-white" id="getting-started">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-900">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-neutral-200">
            {FAQ_ITEMS.map((item, index) => (
              <details key={index} className="group">
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-neutral-900 hover:bg-neutral-50">
                  <span className="font-medium">{item.question}</span>
                  <ChevronRight className="h-5 w-5 text-neutral-400 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-4 text-neutral-600">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6" id="support">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Mail className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900">Still need help?</h3>
              <p className="mt-1 text-neutral-600">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="mailto:support@nook.app"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary"
                >
                  <Mail className="h-4 w-4" />
                  Email Support
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  Live Chat
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-neutral-900">Keyboard Shortcuts</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-2">
              <span className="text-sm text-neutral-600">Quick search</span>
              <kbd className="rounded bg-neutral-200 px-2 py-1 text-xs font-mono">⌘ K</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-2">
              <span className="text-sm text-neutral-600">New item</span>
              <kbd className="rounded bg-neutral-200 px-2 py-1 text-xs font-mono">⌘ N</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-2">
              <span className="text-sm text-neutral-600">Go to dashboard</span>
              <kbd className="rounded bg-neutral-200 px-2 py-1 text-xs font-mono">G D</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-2">
              <span className="text-sm text-neutral-600">Go to inventory</span>
              <kbd className="rounded bg-neutral-200 px-2 py-1 text-xs font-mono">G I</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
