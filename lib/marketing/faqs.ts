import type { FaqItem } from './jsonld'

export const DEFAULT_FAQS: FaqItem[] = [
  {
    question: 'Do you work with barcodes and QR codes?',
    answer:
      'Yes. You can scan with a phone camera or compatible Bluetooth scanners. Use barcodes or QR codes depending on your labels and workflow.',
  },
  {
    question: 'Will it work when my team has no internet?',
    answer:
      "Yes. StockZip is built for offline-first mobile workflows. You can keep scanning and updating, then sync when you're back online.",
  },
  {
    question: 'Can I migrate from other tools?',
    answer:
      "Yes. Import via CSV and we'll help map fields, folders/locations, tags, and custom data so you can go live quickly.",
  },
  {
    question: 'Do you have surprise pricing jumps or SKU cliffs?',
    answer:
      'No. Pricing is designed to be predictable so you can grow your catalog without suddenly being forced into an expensive tier.',
  },
]
