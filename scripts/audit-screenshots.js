// Script to audit all UI screens and capture screenshots
// Run with: node scripts/audit-screenshots.js

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PAGES = {
  marketing: [
    { route: '/', name: 'home' },
    { route: '/pricing', name: 'pricing' },
    { route: '/pricing/free-inventory-software', name: 'pricing-free' },
    { route: '/features', name: 'features' },
    { route: '/features/barcode-scanning', name: 'features-barcode-scanning' },
    { route: '/features/offline-mobile-scanning', name: 'features-offline-mobile' },
    { route: '/features/low-stock-alerts', name: 'features-low-stock-alerts' },
    { route: '/features/bulk-editing', name: 'features-bulk-editing' },
    { route: '/features/check-in-check-out', name: 'features-check-in-check-out' },
    { route: '/solutions', name: 'solutions' },
    { route: '/solutions/mobile-inventory-app', name: 'solutions-mobile-app' },
    { route: '/solutions/small-business', name: 'solutions-small-business' },
    { route: '/solutions/ecommerce-inventory', name: 'solutions-ecommerce' },
    { route: '/solutions/asset-tracking', name: 'solutions-asset-tracking' },
    { route: '/solutions/construction-tools', name: 'solutions-construction' },
    { route: '/solutions/warehouse-inventory', name: 'solutions-warehouse' },
    { route: '/demo', name: 'demo' },
    { route: '/integrations', name: 'integrations' },
    { route: '/compare', name: 'compare' },
    { route: '/compare/sortly-alternative', name: 'compare-sortly' },
    { route: '/compare/boxhero-alternative', name: 'compare-boxhero' },
    { route: '/compare/fishbowl-alternative', name: 'compare-fishbowl' },
    { route: '/compare/inflow-alternative', name: 'compare-inflow' },
    { route: '/migration', name: 'migration' },
    { route: '/migration/sortly', name: 'migration-sortly' },
    { route: '/learn', name: 'learn' },
    { route: '/learn/guide', name: 'learn-guide' },
    { route: '/learn/glossary', name: 'learn-glossary' },
    { route: '/learn/templates', name: 'learn-templates' },
    { route: '/learn/tools', name: 'learn-tools' },
    { route: '/learn/blog', name: 'learn-blog' },
    { route: '/privacy', name: 'privacy' },
    { route: '/terms', name: 'terms' },
    { route: '/security', name: 'security' },
  ],
  auth: [
    { route: '/login', name: 'login' },
    { route: '/signup', name: 'signup' },
    { route: '/forgot-password', name: 'forgot-password' },
  ],
  dashboard: [
    { route: '/dashboard', name: 'dashboard' },
    { route: '/inventory', name: 'inventory' },
    { route: '/inventory/new', name: 'inventory-new' },
    { route: '/search', name: 'search' },
    { route: '/scan', name: 'scan' },
    { route: '/tasks', name: 'tasks' },
    { route: '/tasks/inbound', name: 'tasks-inbound' },
    { route: '/tasks/inventory-operations', name: 'tasks-inventory-ops' },
    { route: '/tasks/checkouts', name: 'tasks-checkouts' },
    { route: '/tasks/transfers', name: 'tasks-transfers' },
    { route: '/tasks/moves', name: 'tasks-moves' },
    { route: '/tasks/stock-count', name: 'tasks-stock-count' },
    { route: '/tasks/receives', name: 'tasks-receives' },
    { route: '/tasks/purchase-orders', name: 'tasks-purchase-orders' },
    { route: '/tasks/sales-orders', name: 'tasks-sales-orders' },
    { route: '/tasks/pick-lists', name: 'tasks-pick-lists' },
    { route: '/tasks/invoices', name: 'tasks-invoices' },
    { route: '/tasks/delivery-orders', name: 'tasks-delivery-orders' },
    { route: '/tasks/fulfillment', name: 'tasks-fulfillment' },
    { route: '/tasks/reorder-suggestions', name: 'tasks-reorder-suggestions' },
    { route: '/reports', name: 'reports' },
    { route: '/reports/inventory-summary', name: 'reports-inventory-summary' },
    { route: '/reports/inventory-value', name: 'reports-inventory-value' },
    { route: '/reports/low-stock', name: 'reports-low-stock' },
    { route: '/reports/expiring', name: 'reports-expiring' },
    { route: '/reports/stock-movement', name: 'reports-stock-movement' },
    { route: '/reports/activity', name: 'reports-activity' },
    { route: '/reports/profit-margin', name: 'reports-profit-margin' },
    { route: '/reports/trends', name: 'reports-trends' },
    { route: '/partners/customers', name: 'partners-customers' },
    { route: '/partners/vendors', name: 'partners-vendors' },
    { route: '/settings', name: 'settings' },
    { route: '/settings/profile', name: 'settings-profile' },
    { route: '/settings/company', name: 'settings-company' },
    { route: '/settings/team', name: 'settings-team' },
    { route: '/settings/preferences', name: 'settings-preferences' },
    { route: '/settings/alerts', name: 'settings-alerts' },
    { route: '/settings/billing', name: 'settings-billing' },
    { route: '/settings/integrations', name: 'settings-integrations' },
    { route: '/settings/bulk-import', name: 'settings-bulk-import' },
    { route: '/settings/custom-fields', name: 'settings-custom-fields' },
    { route: '/settings/labels', name: 'settings-labels' },
    { route: '/settings/taxes', name: 'settings-taxes' },
    { route: '/settings/payment-terms', name: 'settings-payment-terms' },
    { route: '/settings/vendors', name: 'settings-vendors' },
    { route: '/settings/features', name: 'settings-features' },
    { route: '/notifications', name: 'notifications' },
    { route: '/reminders', name: 'reminders' },
    { route: '/ai-assistant', name: 'ai-assistant' },
    { route: '/help', name: 'help' },
  ],
  onboarding: [
    { route: '/onboarding', name: 'onboarding' },
  ],
};

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const screenshotDir = path.join(__dirname, '../docs/screenshot');

  // Ensure directory exists
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const results = [];

  for (const [category, pages] of Object.entries(PAGES)) {
    console.log(`\n📁 Processing ${category} pages...`);

    for (const page of pages) {
      console.log(`  📸 ${page.name} (${page.route})`);

      for (const viewport of VIEWPORTS) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
        });
        const browserPage = await context.newPage();

        try {
          await browserPage.goto(`http://localhost:3000${page.route}`, {
            waitUntil: 'networkidle',
            timeout: 30000,
          });

          const filename = `${page.name}-${viewport.name}.png`;
          await browserPage.screenshot({
            path: path.join(screenshotDir, filename),
            fullPage: true,
          });

          results.push({
            category,
            name: page.name,
            route: page.route,
            viewport: viewport.name,
            filename,
            status: 'success',
          });
        } catch (error) {
          console.error(`    ❌ Error: ${error.message}`);
          results.push({
            category,
            name: page.name,
            route: page.route,
            viewport: viewport.name,
            status: 'error',
            error: error.message,
          });
        }

        await context.close();
      }
    }
  }

  await browser.close();

  // Write results to JSON
  fs.writeFileSync(
    path.join(screenshotDir, 'audit-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n✅ Audit complete! Results saved to docs/screenshot/audit-results.json');
}

captureScreenshots().catch(console.error);
