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
                    className="h-8 w-8 shrink-0 object-contain p-0.5"
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
            <span className="badge badge-outline badge-secondary badge-lg rounded-full">
              <svg className="h-4 w-auto shrink-0" viewBox="-12 10 90 45" aria-hidden="true">
                <path d="M13.2 32.4c0 1.1.1 2 .3 2.6.2.7.5 1.4.9 2.2.1.2.2.5.2.7 0 .3-.2.6-.6.9l-2 1.3c-.3.2-.5.3-.8.3-.3 0-.6-.2-.9-.5-.4-.5-.8-.9-1.1-1.4-.3-.5-.6-1.1-1-1.8-2.4 2.9-5.5 4.3-9.2 4.3-2.6 0-4.7-.7-6.3-2.2-1.5-1.5-2.3-3.5-2.3-6 0-2.6.9-4.8 2.8-6.4 1.9-1.6 4.4-2.4 7.6-2.4 1.1 0 2.2.1 3.3.2 1.1.2 2.3.4 3.6.7v-2.3c0-2.4-.5-4-1.5-5-1-.9-2.7-1.4-5.1-1.4-1.1 0-2.2.1-3.4.4-1.1.3-2.3.6-3.4 1.1-.5.2-.9.3-1.1.4-.2.1-.4.1-.5.1-.4 0-.7-.3-.7-1v-1.5c0-.5.1-.9.2-1.1.2-.2.4-.4.9-.6 1.1-.6 2.4-1 3.9-1.4 1.5-.4 3.2-.6 4.9-.6 3.7 0 6.5.8 8.2 2.5 1.7 1.7 2.6 4.3 2.6 7.9v10.4h-.4zm-12.7 4.7c1 0 2.1-.2 3.2-.5 1.1-.4 2.1-1.1 3-2 .5-.6.9-1.2 1.1-2 .2-.7.3-1.6.3-2.7v-1.3c-.9-.2-1.9-.4-2.9-.5-1-.1-2-.2-2.9-.2-2.1 0-3.6.4-4.6 1.2-1 .8-1.5 2-1.5 3.6 0 1.5.4 2.6 1.1 3.3.8.8 1.9 1.1 3.2 1.1zm25.1 3.4c-.5 0-.9-.1-1.2-.3-.3-.2-.5-.6-.6-1.2l-7-23c-.2-.5-.2-.8-.2-1 0-.4.2-.6.6-.6h3.1c.6 0 1 .1 1.2.3.3.2.5.6.6 1.2l5 19.7 4.6-19.7c.1-.6.3-1 .6-1.2.3-.2.7-.3 1.2-.3h2.5c.6 0 1 .1 1.2.3.3.2.5.6.6 1.2l4.7 19.9 5.1-19.9c.2-.6.3-1 .6-1.2.3-.2.7-.3 1.2-.3h2.9c.4 0 .7.2.7.6 0 .1 0 .3-.1.4 0 .2-.1.4-.2.6l-7.2 23c-.2.6-.3 1-.6 1.2-.3.2-.7.3-1.2.3h-2.7c-.5 0-.9-.1-1.2-.3-.3-.2-.5-.6-.6-1.2l-4.6-19.1-4.6 19.1c-.1.6-.3 1-.6 1.2-.3.2-.7.3-1.2.3h-2.8zm40.1 1c-1.6 0-3.2-.2-4.8-.6-1.6-.4-2.8-.8-3.6-1.2-.5-.3-.8-.5-1-.8-.1-.3-.2-.5-.2-.8v-1.6c0-.7.3-1 .7-1 .2 0 .4 0 .6.1.2.1.5.2.8.3 1.1.5 2.2.9 3.4 1.1 1.2.3 2.5.4 3.7.4 2 0 3.5-.3 4.6-1 1.1-.7 1.6-1.7 1.6-3 0-.9-.3-1.6-.8-2.2-.6-.6-1.6-1.1-3.2-1.6l-4.5-1.4c-2.3-.7-4-1.8-5-3.2-1-1.4-1.6-2.9-1.6-4.5 0-1.3.3-2.5.8-3.5.6-1 1.3-1.9 2.3-2.6.9-.7 2-1.2 3.2-1.6 1.2-.4 2.5-.5 3.9-.5.7 0 1.4 0 2.1.1.7.1 1.4.2 2 .3.6.1 1.2.3 1.8.5.6.2 1 .4 1.3.6.4.2.7.5.9.8.2.3.3.6.3 1v1.5c0 .7-.3 1-.7 1-.3 0-.7-.1-1.2-.4-1.8-.8-3.8-1.2-6-1.2-1.8 0-3.2.3-4.2.9-1 .6-1.5 1.5-1.5 2.8 0 .9.3 1.6.9 2.2.6.6 1.8 1.2 3.4 1.7l4.4 1.4c2.3.7 3.9 1.7 4.9 3 1 1.3 1.4 2.8 1.4 4.3 0 1.3-.3 2.5-.8 3.6-.5 1.1-1.3 2-2.3 2.7-1 .8-2.1 1.3-3.5 1.7-1.4.5-2.9.7-4.5.7z" fill="#252F3E"/>
                <path d="M60.6 45.5C55 49.5 46.8 51.6 39.8 51.6c-9.9 0-18.8-3.7-25.5-9.8-.5-.5-.1-1.1.6-.8 7.3 4.2 16.2 6.8 25.5 6.8 6.3 0 13.1-1.3 19.5-4 1-.4 1.7.6.7 1.7z" fill="#FF9900"/>
                <path d="M62.9 42.9c-.7-.9-4.8-.4-6.6-.2-.6.1-.6-.4-.1-.8 3.2-2.3 8.5-1.6 9.2-.9.6.8-.2 6.1-3.2 8.6-.5.4-.9.2-.7-.3.7-1.7 2.1-5.5 1.4-6.4z" fill="#FF9900"/>
              </svg>
              Hosted on AWS
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
