import { jsPDF } from 'jspdf'

export interface PdfFormatters {
  formatCurrency: (value: number | null | undefined) => string
  formatDate: (date: string | Date | null | undefined) => string
  formatShortDate: (date: string | Date | null | undefined) => string
}

type PdfAlign = 'left' | 'center' | 'right'

export interface PdfBranding {
  companyName?: string | null
  companyLogoDataUrl?: string | null
  companyAddressLines?: string[] | null
  companyContactLines?: string[] | null
}

export interface CompanyDetails {
  address1?: string | null
  address2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  phone?: string | null
  email?: string | null
  taxId?: string | null
  taxIdLabel?: string | null
}

interface PdfColumn<Row> {
  label: string
  width: number
  align?: PdfAlign
  wrap?: boolean
  value: (row: Row) => string
}

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const MARGIN = 48
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const LINE_HEIGHT = 14
const SECTION_GAP = 12
const META_WIDTH = 180
const COLUMN_GAP = 24

function createDocument(): jsPDF {
  const pdf = new jsPDF({ unit: 'pt', format: 'letter' })
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(33, 33, 33)
  return pdf
}

function formatStatus(value: string | null | undefined): string {
  if (!value) return '-'
  return value
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function safeText(value: string | null | undefined): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : '-'
}

function combineCityStatePostal(
  city: string | null | undefined,
  state: string | null | undefined,
  postal: string | null | undefined
): string | null {
  const cityState = [city, state].filter(Boolean).join(', ')
  if (cityState && postal) return `${cityState} ${postal}`
  if (cityState) return cityState
  return postal || null
}

export function buildCompanyBranding(
  companyName: string | null,
  logoDataUrl: string | null,
  details: CompanyDetails | null
): PdfBranding {
  const addressLines = [
    details?.address1,
    details?.address2,
    combineCityStatePostal(details?.city, details?.state, details?.postalCode),
    details?.country,
  ].filter(Boolean) as string[]

  const taxLabel = details?.taxId ? (details?.taxIdLabel || 'Tax ID') : null
  const contactLines = [
    details?.phone ? `Phone: ${details.phone}` : null,
    details?.email || null,
    taxLabel ? `${taxLabel}: ${details?.taxId}` : null,
  ].filter(Boolean) as string[]

  return {
    companyName,
    companyLogoDataUrl: logoDataUrl,
    companyAddressLines: addressLines.length > 0 ? addressLines : null,
    companyContactLines: contactLines.length > 0 ? contactLines : null,
  }
}

function formatAddressLines({
  name,
  address1,
  address2,
  city,
  state,
  postal,
  country,
  phone,
}: {
  name?: string | null
  address1?: string | null
  address2?: string | null
  city?: string | null
  state?: string | null
  postal?: string | null
  country?: string | null
  phone?: string | null
}): string[] {
  const lines = [
    name,
    address1,
    address2,
    combineCityStatePostal(city, state, postal),
    country,
    phone ? `Phone: ${phone}` : null,
  ].filter(Boolean) as string[]

  return lines.length > 0 ? lines : ['-']
}

function getImageFormat(dataUrl: string): 'PNG' | 'JPEG' | null {
  if (dataUrl.startsWith('data:image/png')) return 'PNG'
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'JPEG'
  return null
}

function drawSectionTitleAt(pdf: jsPDF, title: string, x: number, y: number): number {
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text(title, x, y)
  return y + LINE_HEIGHT
}

function drawTextLinesAt(
  pdf: jsPDF,
  lines: string[],
  x: number,
  y: number,
  width: number,
  fontSize = 10
): number {
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(fontSize)
  let cursorY = y
  const cleanLines = lines.length > 0 ? lines : ['-']

  cleanLines.forEach((line) => {
    const wrapped = pdf.splitTextToSize(line, width)
    pdf.text(wrapped, x, cursorY)
    cursorY += wrapped.length * LINE_HEIGHT
  })

  return cursorY
}

function drawTwoColumnBlocks(
  pdf: jsPDF,
  left: { title: string; lines: string[] },
  right: { title: string; lines: string[] } | null,
  y: number
): number {
  const columnWidth = (CONTENT_WIDTH - COLUMN_GAP) / 2
  const leftX = MARGIN
  const rightX = MARGIN + columnWidth + COLUMN_GAP

  let leftY = drawSectionTitleAt(pdf, left.title, leftX, y)
  leftY = drawTextLinesAt(pdf, left.lines, leftX, leftY, columnWidth)

  let rightY = y
  if (right) {
    rightY = drawSectionTitleAt(pdf, right.title, rightX, y)
    rightY = drawTextLinesAt(pdf, right.lines, rightX, rightY, columnWidth)
  }

  return Math.max(leftY, rightY) + SECTION_GAP
}

function drawSummaryBox(
  pdf: jsPDF,
  title: string,
  value: string,
  y: number
): number {
  const boxWidth = 180
  const boxHeight = 48
  const x = PAGE_WIDTH - MARGIN - boxWidth

  pdf.setDrawColor(210, 210, 210)
  pdf.setFillColor(248, 248, 248)
  pdf.rect(x, y, boxWidth, boxHeight, 'FD')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text(title, x + boxWidth / 2, y + 16, { align: 'center' })

  pdf.setFontSize(14)
  pdf.text(value, x + boxWidth / 2, y + 34, { align: 'center' })

  return y + boxHeight + SECTION_GAP
}

function drawHeader(
  pdf: jsPDF,
  title: string,
  docId: string | null | undefined,
  meta: Array<{ label: string; value: string }>,
  branding?: PdfBranding
): number {
  let leftY = MARGIN
  let leftX = MARGIN
  let logoBottom = MARGIN

  const logoDataUrl = branding?.companyLogoDataUrl || null
  if (logoDataUrl) {
    const format = getImageFormat(logoDataUrl)
    if (format) {
      const logoSize = 36
      pdf.addImage(logoDataUrl, format, MARGIN, MARGIN, logoSize, logoSize)
      leftX = MARGIN + logoSize + 12
      logoBottom = MARGIN + logoSize
    }
  }

  const companyName = branding?.companyName?.trim()
  const addressLines = (branding?.companyAddressLines || []).filter(Boolean)
  const contactLines = (branding?.companyContactLines || []).filter(Boolean)
  const maxWidth = Math.max(PAGE_WIDTH - MARGIN - META_WIDTH - leftX, 200)

  if (companyName) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    const nameLines = pdf.splitTextToSize(companyName, maxWidth)
    pdf.text(nameLines, leftX, leftY)
    leftY += nameLines.length * LINE_HEIGHT
  }

  if (addressLines.length > 0) {
    pdf.setFont('helvetica', 'normal')
    leftY = drawTextLinesAt(pdf, addressLines, leftX, leftY, maxWidth, 9)
  }

  if (contactLines.length > 0) {
    pdf.setFont('helvetica', 'normal')
    leftY = drawTextLinesAt(pdf, contactLines, leftX, leftY, maxWidth, 9)
  }

  if (companyName || addressLines.length > 0 || contactLines.length > 0) {
    leftY += 4
  }

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text(title, leftX, leftY)
  leftY += LINE_HEIGHT + 2

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  if (docId) {
    pdf.text(docId, leftX, leftY)
    leftY += LINE_HEIGHT
  }

  pdf.setFontSize(10)
  let metaY = MARGIN
  const rightX = PAGE_WIDTH - MARGIN
  meta.forEach((item) => {
    const text = `${item.label}: ${item.value}`
    pdf.text(text, rightX, metaY, { align: 'right' })
    metaY += LINE_HEIGHT
  })

  const rightHeight = MARGIN + meta.length * LINE_HEIGHT
  return Math.max(leftY, rightHeight, logoBottom) + SECTION_GAP
}

function drawSectionTitle(pdf: jsPDF, title: string, y: number): number {
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text(title, MARGIN, y)
  return y + LINE_HEIGHT
}

function drawTextLines(pdf: jsPDF, lines: string[], y: number, width = CONTENT_WIDTH): number {
  return drawTextLinesAt(pdf, lines, MARGIN, y, width)
}

function drawTableHeader<Row>(
  pdf: jsPDF,
  columns: PdfColumn<Row>[],
  widths: number[],
  startY: number
): number {
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)

  let x = MARGIN
  columns.forEach((column, index) => {
    const width = widths[index]
    const align = column.align || 'left'
    const textX = align === 'right' ? x + width : align === 'center' ? x + width / 2 : x
    pdf.text(column.label, textX, startY, { align })
    x += width
  })

  pdf.setDrawColor(220, 220, 220)
  pdf.line(MARGIN, startY + 4, PAGE_WIDTH - MARGIN, startY + 4)
  return startY + LINE_HEIGHT
}

function drawTable<Row>(
  pdf: jsPDF,
  columns: PdfColumn<Row>[],
  rows: Row[],
  startY: number
): number {
  const totalWidth = columns.reduce((sum, column) => sum + column.width, 0)
  const widths = columns.map(column => (column.width / totalWidth) * CONTENT_WIDTH)

  let y = drawTableHeader(pdf, columns, widths, startY)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)

  rows.forEach((row) => {
    const cellLines = columns.map((column, index) => {
      const text = column.value(row) || '-'
      if (column.wrap) {
        return pdf.splitTextToSize(text, widths[index] - 4)
      }
      return [text]
    })

    const rowHeight = Math.max(...cellLines.map(lines => lines.length)) * LINE_HEIGHT + 4
    if (y + rowHeight > PAGE_HEIGHT - MARGIN) {
      pdf.addPage()
      y = drawTableHeader(pdf, columns, widths, MARGIN)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
    }

    let x = MARGIN
    cellLines.forEach((lines, index) => {
      const column = columns[index]
      const width = widths[index]
      const align = column.align || 'left'
      const textX = align === 'right' ? x + width : align === 'center' ? x + width / 2 : x
      if (align === 'left') {
        pdf.text(lines, textX, y, { align })
      } else {
        pdf.text(lines[0] || '-', textX, y, { align })
      }
      x += width
    })

    y += rowHeight
    pdf.setDrawColor(235, 235, 235)
    pdf.line(MARGIN, y - 6, PAGE_WIDTH - MARGIN, y - 6)
  })

  return y + SECTION_GAP
}

function drawTotals(
  pdf: jsPDF,
  totals: Array<{ label: string; value: string }>,
  startY: number
): number {
  let y = startY
  const labelX = PAGE_WIDTH - MARGIN - 160
  const valueX = PAGE_WIDTH - MARGIN

  totals.forEach((total, index) => {
    const isLast = index === totals.length - 1
    pdf.setFont('helvetica', isLast ? 'bold' : 'normal')
    pdf.setFontSize(isLast ? 11 : 10)
    pdf.text(total.label, labelX, y)
    pdf.text(total.value, valueX, y, { align: 'right' })
    y += LINE_HEIGHT
  })

  return y + SECTION_GAP
}

export async function fetchImageDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { cache: 'force-cache' })
    if (!response.ok) return null

    const blob = await response.blob()
    if (!blob.type.startsWith('image/')) return null

    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export function downloadPdfBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export interface PurchaseOrderPdfData {
  display_id: string | null
  order_number: string | null
  status: string | null
  expected_date: string | null
  created_at: string | null
  notes: string | null
  subtotal: number | null
  tax: number | null
  shipping: number | null
  total: number | null
  vendor: {
    name: string
    contact_name: string | null
    email: string | null
    phone: string | null
    payment_terms: string | null
  } | null
  ship_to_name: string | null
  ship_to_address1: string | null
  ship_to_address2: string | null
  ship_to_city: string | null
  ship_to_state: string | null
  ship_to_postal_code: string | null
  ship_to_country: string | null
  bill_to_name: string | null
  bill_to_address1: string | null
  bill_to_address2: string | null
  bill_to_city: string | null
  bill_to_state: string | null
  bill_to_postal_code: string | null
  bill_to_country: string | null
  items: Array<{
    item_name: string
    sku: string | null
    part_number: string | null
    ordered_quantity: number
    unit_price: number
  }>
}

export function generatePurchaseOrderPDF(
  purchaseOrder: PurchaseOrderPdfData,
  formatters: PdfFormatters,
  branding?: PdfBranding
): Blob {
  const pdf = createDocument()
  const meta = [
    { label: 'Status', value: formatStatus(purchaseOrder.status) },
    { label: 'PO Date', value: formatters.formatShortDate(purchaseOrder.created_at) },
    { label: 'Expected', value: formatters.formatShortDate(purchaseOrder.expected_date) },
  ]

  let y = drawHeader(
    pdf,
    'Purchase Order',
    purchaseOrder.display_id || purchaseOrder.order_number,
    meta,
    branding
  )

  const vendorLines = purchaseOrder.vendor
    ? [
        purchaseOrder.vendor.name,
        purchaseOrder.vendor.contact_name,
        purchaseOrder.vendor.email,
        purchaseOrder.vendor.phone,
        purchaseOrder.vendor.payment_terms ? `Terms: ${purchaseOrder.vendor.payment_terms}` : null,
      ].filter(Boolean) as string[]
    : ['-']

  const shipToLines = formatAddressLines({
    name: purchaseOrder.ship_to_name,
    address1: purchaseOrder.ship_to_address1,
    address2: purchaseOrder.ship_to_address2,
    city: purchaseOrder.ship_to_city,
    state: purchaseOrder.ship_to_state,
    postal: purchaseOrder.ship_to_postal_code,
    country: purchaseOrder.ship_to_country,
  })
  y = drawTwoColumnBlocks(
    pdf,
    { title: 'Vendor', lines: vendorLines },
    { title: 'Ship To', lines: shipToLines },
    y
  )

  const hasBillTo =
    purchaseOrder.bill_to_name ||
    purchaseOrder.bill_to_address1 ||
    purchaseOrder.bill_to_address2 ||
    purchaseOrder.bill_to_city ||
    purchaseOrder.bill_to_state ||
    purchaseOrder.bill_to_postal_code ||
    purchaseOrder.bill_to_country

  if (hasBillTo) {
    y = drawSectionTitle(pdf, 'Bill To', y)
    y = drawTextLines(
      pdf,
      formatAddressLines({
        name: purchaseOrder.bill_to_name,
        address1: purchaseOrder.bill_to_address1,
        address2: purchaseOrder.bill_to_address2,
        city: purchaseOrder.bill_to_city,
        state: purchaseOrder.bill_to_state,
        postal: purchaseOrder.bill_to_postal_code,
        country: purchaseOrder.bill_to_country,
      }),
      y
    ) + SECTION_GAP
  }

  y = drawSectionTitle(pdf, 'Items', y)
  y = drawTable(
    pdf,
    [
      { label: 'Item', width: 4, wrap: true, value: (item) => item.item_name },
      { label: 'SKU', width: 2, value: (item) => item.part_number || item.sku || '-' },
      { label: 'Qty', width: 1, align: 'center', value: (item) => String(item.ordered_quantity) },
      { label: 'Unit', width: 1.5, align: 'right', value: (item) => formatters.formatCurrency(item.unit_price) },
      {
        label: 'Total',
        width: 1.5,
        align: 'right',
        value: (item) => formatters.formatCurrency(item.unit_price * item.ordered_quantity),
      },
    ],
    purchaseOrder.items,
    y
  )

  const subtotal = purchaseOrder.subtotal ?? purchaseOrder.items.reduce(
    (sum, item) => sum + item.unit_price * item.ordered_quantity,
    0
  )
  const tax = purchaseOrder.tax ?? 0
  const shipping = purchaseOrder.shipping ?? 0
  const total = purchaseOrder.total ?? subtotal + tax + shipping

  y = drawTotals(pdf, [
    { label: 'Subtotal', value: formatters.formatCurrency(subtotal) },
    { label: 'Tax', value: formatters.formatCurrency(tax) },
    { label: 'Shipping', value: formatters.formatCurrency(shipping) },
    { label: 'Total', value: formatters.formatCurrency(total) },
  ], y)

  if (purchaseOrder.notes) {
    y = drawSectionTitle(pdf, 'Notes', y)
    drawTextLines(pdf, [purchaseOrder.notes], y)
  }

  return pdf.output('blob') as Blob
}

export interface PickListPdfData {
  pick_list: {
    display_id: string | null
    pick_list_number: string | null
    status: string
    due_date: string | null
    item_outcome: string
    notes: string | null
    ship_to_name: string | null
    ship_to_address1: string | null
    ship_to_address2: string | null
    ship_to_city: string | null
    ship_to_state: string | null
    ship_to_postal_code: string | null
    ship_to_country: string | null
    created_at: string
  }
  items: Array<{
    item_name: string
    item_sku: string | null
    requested_quantity: number
    picked_quantity: number
  }>
  assigned_to_name: string | null
  created_by_name: string | null
}

export function generatePickListPDF(
  data: PickListPdfData,
  formatters: PdfFormatters,
  branding?: PdfBranding
): Blob {
  const pdf = createDocument()
  const meta = [
    { label: 'Status', value: formatStatus(data.pick_list.status) },
    { label: 'Due', value: formatters.formatShortDate(data.pick_list.due_date) },
    { label: 'Assigned', value: safeText(data.assigned_to_name) },
  ]

  let y = drawHeader(
    pdf,
    'Pick List',
    data.pick_list.display_id || data.pick_list.pick_list_number,
    meta,
    branding
  )

  const detailLines = [
    `Outcome: ${formatStatus(data.pick_list.item_outcome)}`,
    `Assigned: ${safeText(data.assigned_to_name)}`,
    `Created: ${formatters.formatShortDate(data.pick_list.created_at)}`,
    `Created by: ${safeText(data.created_by_name)}`,
  ]
  const shipToLines = formatAddressLines({
    name: data.pick_list.ship_to_name,
    address1: data.pick_list.ship_to_address1,
    address2: data.pick_list.ship_to_address2,
    city: data.pick_list.ship_to_city,
    state: data.pick_list.ship_to_state,
    postal: data.pick_list.ship_to_postal_code,
    country: data.pick_list.ship_to_country,
  })
  y = drawTwoColumnBlocks(
    pdf,
    { title: 'Pick Details', lines: detailLines },
    { title: 'Ship To', lines: shipToLines },
    y
  )

  y = drawSectionTitle(pdf, 'Items', y)
  y = drawTable(
    pdf,
    [
      { label: 'Item', width: 4, wrap: true, value: (item) => item.item_name },
      { label: 'SKU', width: 2, value: (item) => item.item_sku || '-' },
      { label: 'Requested', width: 1, align: 'center', value: (item) => String(item.requested_quantity) },
      { label: 'Picked', width: 1, align: 'center', value: (item) => String(item.picked_quantity) },
    ],
    data.items,
    y
  )

  if (data.pick_list.notes) {
    y = drawSectionTitle(pdf, 'Notes', y)
    drawTextLines(pdf, [data.pick_list.notes], y)
  }

  return pdf.output('blob') as Blob
}

export interface SalesOrderPdfData {
  display_id: string | null
  order_number: string | null
  status: string | null
  priority: string | null
  order_date: string | null
  requested_date: string | null
  promised_date: string | null
  subtotal: number | null
  discount_total: number | null
  tax_total: number | null
  shipping_total: number | null
  total: number | null
  customer_notes: string | null
  customer: {
    name: string
    contact_name: string | null
    email: string | null
    phone: string | null
  } | null
  ship_to_name: string | null
  ship_to_address1: string | null
  ship_to_address2: string | null
  ship_to_city: string | null
  ship_to_state: string | null
  ship_to_postal_code: string | null
  ship_to_country: string | null
  bill_to_name: string | null
  bill_to_address1: string | null
  bill_to_address2: string | null
  bill_to_city: string | null
  bill_to_state: string | null
  bill_to_postal_code: string | null
  bill_to_country: string | null
  assigned_to_name: string | null
  items: Array<{
    item_name: string
    sku: string | null
    quantity_ordered: number
    unit_price: number
    line_total: number
  }>
}

export function generateSalesOrderPDF(
  salesOrder: SalesOrderPdfData,
  formatters: PdfFormatters,
  branding?: PdfBranding
): Blob {
  const pdf = createDocument()
  const meta = [
    { label: 'Status', value: formatStatus(salesOrder.status) },
    { label: 'Order Date', value: formatters.formatShortDate(salesOrder.order_date) },
    { label: 'Requested', value: formatters.formatShortDate(salesOrder.requested_date) },
    { label: 'Promised', value: formatters.formatShortDate(salesOrder.promised_date) },
  ]

  if (salesOrder.priority && salesOrder.priority !== 'normal') {
    meta.push({ label: 'Priority', value: formatStatus(salesOrder.priority) })
  }

  let y = drawHeader(
    pdf,
    'Sales Order',
    salesOrder.display_id || salesOrder.order_number,
    meta,
    branding
  )

  const billToLines = [
    salesOrder.bill_to_name || salesOrder.customer?.name || null,
    salesOrder.customer?.contact_name || null,
    salesOrder.customer?.email || null,
    salesOrder.customer?.phone || null,
    salesOrder.bill_to_address1,
    salesOrder.bill_to_address2,
    combineCityStatePostal(
      salesOrder.bill_to_city,
      salesOrder.bill_to_state,
      salesOrder.bill_to_postal_code
    ),
    salesOrder.bill_to_country,
  ].filter(Boolean) as string[]

  const shipToLines = formatAddressLines({
    name: salesOrder.ship_to_name,
    address1: salesOrder.ship_to_address1,
    address2: salesOrder.ship_to_address2,
    city: salesOrder.ship_to_city,
    state: salesOrder.ship_to_state,
    postal: salesOrder.ship_to_postal_code,
    country: salesOrder.ship_to_country,
  })

  y = drawTwoColumnBlocks(
    pdf,
    { title: 'Bill To', lines: billToLines.length > 0 ? billToLines : ['-'] },
    { title: 'Ship To', lines: shipToLines },
    y
  )

  y = drawSectionTitle(pdf, 'Items', y)
  y = drawTable(
    pdf,
    [
      { label: 'Item', width: 4, wrap: true, value: (item) => item.item_name },
      { label: 'SKU', width: 2, value: (item) => item.sku || '-' },
      { label: 'Qty', width: 1, align: 'center', value: (item) => String(item.quantity_ordered) },
      { label: 'Unit', width: 1.5, align: 'right', value: (item) => formatters.formatCurrency(item.unit_price) },
      { label: 'Total', width: 1.5, align: 'right', value: (item) => formatters.formatCurrency(item.line_total) },
    ],
    salesOrder.items,
    y
  )

  const subtotal = salesOrder.subtotal ?? salesOrder.items.reduce(
    (sum, item) => sum + item.line_total,
    0
  )
  const discount = salesOrder.discount_total ?? 0
  const tax = salesOrder.tax_total ?? 0
  const shipping = salesOrder.shipping_total ?? 0
  const total = salesOrder.total ?? subtotal - discount + tax + shipping

  y = drawTotals(pdf, [
    { label: 'Subtotal', value: formatters.formatCurrency(subtotal) },
    { label: 'Discount', value: formatters.formatCurrency(discount) },
    { label: 'Tax', value: formatters.formatCurrency(tax) },
    { label: 'Shipping', value: formatters.formatCurrency(shipping) },
    { label: 'Total', value: formatters.formatCurrency(total) },
  ], y)

  if (salesOrder.customer_notes) {
    y = drawSectionTitle(pdf, 'Customer Notes', y)
    drawTextLines(pdf, [salesOrder.customer_notes], y)
  }

  return pdf.output('blob') as Blob
}

export interface DeliveryOrderPdfData {
  display_id: string | null
  status: string | null
  carrier: string | null
  tracking_number: string | null
  shipping_method: string | null
  scheduled_date: string | null
  dispatched_at: string | null
  delivered_at: string | null
  ship_to_name: string | null
  ship_to_address1: string | null
  ship_to_address2: string | null
  ship_to_city: string | null
  ship_to_state: string | null
  ship_to_postal_code: string | null
  ship_to_country: string | null
  ship_to_phone: string | null
  received_by: string | null
  delivery_notes: string | null
  total_packages: number
  total_weight: number | null
  weight_unit: string | null
  sales_order: {
    display_id: string | null
    customers: {
      name: string
      email: string | null
      phone: string | null
    } | null
  } | null
  items: Array<{
    item_name: string
    sku: string | null
    quantity_shipped: number
    quantity_delivered: number
  }>
}

export function generateDeliveryOrderPDF(
  deliveryOrder: DeliveryOrderPdfData,
  formatters: PdfFormatters,
  branding?: PdfBranding
): Blob {
  const pdf = createDocument()
  const meta = [
    { label: 'Status', value: formatStatus(deliveryOrder.status) },
    { label: 'Scheduled', value: formatters.formatShortDate(deliveryOrder.scheduled_date) },
    { label: 'Carrier', value: safeText(deliveryOrder.carrier) },
  ]

  let y = drawHeader(
    pdf,
    'Delivery Order',
    deliveryOrder.display_id || deliveryOrder.sales_order?.display_id,
    meta,
    branding
  )

  const shipToLines = [
    deliveryOrder.sales_order?.customers?.name || null,
    deliveryOrder.sales_order?.customers?.email || null,
    deliveryOrder.sales_order?.customers?.phone || null,
    deliveryOrder.ship_to_name,
    deliveryOrder.ship_to_address1,
    deliveryOrder.ship_to_address2,
    combineCityStatePostal(
      deliveryOrder.ship_to_city,
      deliveryOrder.ship_to_state,
      deliveryOrder.ship_to_postal_code
    ),
    deliveryOrder.ship_to_country,
    deliveryOrder.ship_to_phone ? `Phone: ${deliveryOrder.ship_to_phone}` : null,
  ].filter(Boolean) as string[]

  const shipmentLines = [
    `Tracking: ${safeText(deliveryOrder.tracking_number)}`,
    `Method: ${safeText(deliveryOrder.shipping_method)}`,
    `Dispatched: ${formatters.formatShortDate(deliveryOrder.dispatched_at)}`,
    `Delivered: ${formatters.formatShortDate(deliveryOrder.delivered_at)}`,
    `Packages: ${deliveryOrder.total_packages}`,
    deliveryOrder.total_weight ? `Weight: ${deliveryOrder.total_weight} ${deliveryOrder.weight_unit || ''}` : null,
  ].filter(Boolean) as string[]

  y = drawTwoColumnBlocks(
    pdf,
    { title: 'Ship To', lines: shipToLines.length > 0 ? shipToLines : ['-'] },
    { title: 'Shipment', lines: shipmentLines.length > 0 ? shipmentLines : ['-'] },
    y
  )

  y = drawSectionTitle(pdf, 'Items', y)
  y = drawTable(
    pdf,
    [
      { label: 'Item', width: 4, wrap: true, value: (item) => item.item_name },
      { label: 'SKU', width: 2, value: (item) => item.sku || '-' },
      { label: 'Shipped', width: 1, align: 'center', value: (item) => String(item.quantity_shipped) },
      { label: 'Delivered', width: 1, align: 'center', value: (item) => String(item.quantity_delivered) },
    ],
    deliveryOrder.items,
    y
  )

  y = drawSectionTitle(pdf, 'Delivery Notes', y)
  const noteLines = [
    deliveryOrder.received_by ? `Received by: ${deliveryOrder.received_by}` : null,
    deliveryOrder.delivery_notes,
  ].filter(Boolean) as string[]
  drawTextLines(pdf, noteLines.length > 0 ? noteLines : ['-'], y)

  return pdf.output('blob') as Blob
}

export interface InvoicePdfData {
  display_id: string | null
  invoice_number: string | null
  status: string
  invoice_date: string
  due_date: string | null
  sent_at: string | null
  sent_to_email: string | null
  bill_to_name: string | null
  bill_to_address1: string | null
  bill_to_address2: string | null
  bill_to_city: string | null
  bill_to_state: string | null
  bill_to_postal_code: string | null
  bill_to_country: string | null
  subtotal: number
  discount_amount: number
  tax_amount: number
  total: number
  amount_paid: number
  balance_due: number
  customer_notes: string | null
  terms_and_conditions: string | null
  customer: {
    name: string
    email: string | null
    phone: string | null
  } | null
  items: Array<{
    item_name: string
    sku: string | null
    quantity: number
    unit_price: number
    line_total: number
  }>
}

export function generateInvoicePDF(
  invoice: InvoicePdfData,
  formatters: PdfFormatters,
  branding?: PdfBranding
): Blob {
  const pdf = createDocument()
  const meta = [
    { label: 'Status', value: formatStatus(invoice.status) },
    { label: 'Invoice Date', value: formatters.formatShortDate(invoice.invoice_date) },
    { label: 'Due', value: formatters.formatShortDate(invoice.due_date) },
  ]

  let y = drawHeader(
    pdf,
    'Invoice',
    invoice.display_id || invoice.invoice_number,
    meta,
    branding
  )

  y = drawSummaryBox(pdf, 'Balance Due', formatters.formatCurrency(invoice.balance_due), y)

  const billToLines = [
    invoice.bill_to_name || invoice.customer?.name || null,
    invoice.customer?.email || null,
    invoice.customer?.phone || null,
    invoice.bill_to_address1,
    invoice.bill_to_address2,
    combineCityStatePostal(
      invoice.bill_to_city,
      invoice.bill_to_state,
      invoice.bill_to_postal_code
    ),
    invoice.bill_to_country,
  ].filter(Boolean) as string[]

  y = drawSectionTitle(pdf, 'Bill To', y)
  y = drawTextLines(pdf, billToLines.length > 0 ? billToLines : ['-'], y) + SECTION_GAP

  y = drawSectionTitle(pdf, 'Items', y)
  y = drawTable(
    pdf,
    [
      { label: 'Item', width: 4, wrap: true, value: (item) => item.item_name },
      { label: 'SKU', width: 2, value: (item) => item.sku || '-' },
      { label: 'Qty', width: 1, align: 'center', value: (item) => String(item.quantity) },
      { label: 'Unit', width: 1.5, align: 'right', value: (item) => formatters.formatCurrency(item.unit_price) },
      { label: 'Total', width: 1.5, align: 'right', value: (item) => formatters.formatCurrency(item.line_total) },
    ],
    invoice.items,
    y
  )

  y = drawTotals(pdf, [
    { label: 'Subtotal', value: formatters.formatCurrency(invoice.subtotal) },
    { label: 'Discount', value: formatters.formatCurrency(invoice.discount_amount) },
    { label: 'Tax', value: formatters.formatCurrency(invoice.tax_amount) },
    { label: 'Total', value: formatters.formatCurrency(invoice.total) },
    { label: 'Amount Paid', value: formatters.formatCurrency(invoice.amount_paid) },
    { label: 'Balance Due', value: formatters.formatCurrency(invoice.balance_due) },
  ], y)

  if (invoice.sent_at || invoice.sent_to_email) {
    y = drawSectionTitle(pdf, 'Sent Details', y)
    y = drawTextLines(
      pdf,
      [
        invoice.sent_at ? `Sent at: ${formatters.formatDate(invoice.sent_at)}` : null,
        invoice.sent_to_email ? `Sent to: ${invoice.sent_to_email}` : null,
      ].filter(Boolean) as string[],
      y
    ) + SECTION_GAP
  }

  if (invoice.customer_notes) {
    y = drawSectionTitle(pdf, 'Customer Notes', y)
    y = drawTextLines(pdf, [invoice.customer_notes], y) + SECTION_GAP
  }

  if (invoice.terms_and_conditions) {
    y = drawSectionTitle(pdf, 'Terms', y)
    drawTextLines(pdf, [invoice.terms_and_conditions], y)
  }

  return pdf.output('blob') as Blob
}
