import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer>
      <div className="bg-base-200">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-6">
            {/* Newsletter section */}
            <div className="col-span-2 mb-8 flex flex-col justify-between gap-6 sm:mb-16 lg:mb-0 lg:gap-12">
              <div>
                <Link title="StockZip" className="text-base-content flex items-center gap-2 text-xl font-bold" href="/">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logo.png"
                    alt="StockZip"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                  <span>StockZip<span className="text-[10px] font-light align-super opacity-70">™</span></span>
                </Link>
                <p className="text-base-content/80 mt-4 text-balance lg:max-w-md">
                  Simple, mobile-first inventory management for small teams — barcode scanning, offline reliability, and
                  trust-first pricing that doesn&apos;t punish growth.
                </p>
              </div>
              <div>
                <h4 className="text-base-content text-lg font-medium">Subscribe to Newsletter</h4>
                <div className="join mt-4 w-full lg:max-w-sm">
                  <label className="join-item input flex items-center gap-2 w-full">
                    <span className="icon-[tabler--mail] text-base-content/50 size-5 shrink-0"></span>
                    <input type="text" className="grow bg-transparent outline-none" placeholder="Email" />
                  </label>
                  <button className="btn btn-primary join-item border-0">Subscribe</button>
                </div>
                <span className="text-base-content/80 mt-2 text-sm">No spam. Unsubscribe anytime.</span>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-5">
              <h4 className="text-base-content text-lg font-medium">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/features" className="link link-animated text-base-content/80">Features</Link></li>
                <li><Link href="/solutions" className="link link-animated text-base-content/80">Solutions</Link></li>
                <li><Link href="/pricing" className="link link-animated text-base-content/80">Pricing</Link></li>
                <li><Link href="/pricing/free-inventory-software" className="link link-animated text-base-content/80">Free inventory software</Link></li>
                <li><Link href="/demo" className="link link-animated text-base-content/80">Demo</Link></li>
                <li><Link href="/migration" className="link link-animated text-base-content/80">Migration guide</Link></li>
              </ul>
            </div>

            {/* Compare */}
            <div className="space-y-5">
              <h4 className="text-base-content text-lg font-medium">Compare</h4>
              <ul className="space-y-3">
                <li><Link href="/compare" className="link link-animated text-base-content/80">All comparisons</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-5">
              <h4 className="text-base-content text-lg font-medium">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/learn" className="link link-animated text-base-content/80">Learning Center</Link></li>
                <li><Link href="/integrations" className="link link-animated text-base-content/80">Integrations</Link></li>
                <li><Link href="/security" className="link link-animated text-base-content/80">Security</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-5">
              <h4 className="text-base-content text-lg font-medium">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="link link-animated text-base-content/80">Privacy</Link></li>
                <li><Link href="/terms" className="link link-animated text-base-content/80">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="via-primary/30 mx-auto h-px w-3/4 bg-gradient-to-r from-transparent to-transparent"></div>

        {/* Product section */}
        <div className="mx-auto flex max-w-7xl justify-between gap-5 px-4 py-6 max-lg:flex-col sm:px-6 lg:items-center lg:px-8">
          <div className="text-base-content text-lg font-medium">Built for real inventory work:</div>
          <div className="flex w-fit gap-y-3 max-sm:flex-col">
            <span className="badge badge-outline badge-secondary badge-lg rounded-full">
              <span className="icon-[tabler--scan] text-primary size-5"></span>
              Barcode scanning
            </span>
            <div className="divider divider-horizontal mx-5 max-sm:hidden"></div>
            <span className="badge badge-outline badge-secondary badge-lg rounded-full">
              <span className="icon-[tabler--wifi-off] text-primary size-5"></span>
              Offline-first
            </span>
            <div className="divider divider-horizontal mx-5 max-sm:hidden"></div>
            <span className="badge badge-outline badge-secondary badge-lg rounded-full">
              <span className="icon-[tabler--shield-check-filled] text-primary size-5"></span>
              Audit trail
            </span>
          </div>
        </div>

        <div className="divider"></div>

        {/* Payment / Copyright section */}
        <div className="mx-auto flex max-w-7xl justify-between gap-3 px-4 py-6 max-lg:flex-col sm:px-6 lg:items-center lg:px-8">
          <div className="text-base-content text-base text-wrap">
            &copy;{new Date().getFullYear()} <Link href="/" className="text-primary">StockZip</Link>. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="badge badge-outline badge-secondary badge-lg rounded-full">
              <span className="icon-[tabler--shield-check-filled] text-success size-5"></span>
              Secure by design
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
