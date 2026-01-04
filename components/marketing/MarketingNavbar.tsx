import Link from 'next/link'

export function MarketingNavbar() {
  return (
    <nav className="navbar px-0">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 md:flex md:items-center md:gap-2 lg:px-8">
        <div className="navbar-start w-max items-center justify-between max-md:w-full">
          <Link className="text-base-content flex items-center gap-3 text-xl font-bold" href="/">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <span className="text-base font-bold text-white">S</span>
            </div>
            StockZip
          </Link>
          <div className="md:hidden">
            <button
              type="button"
              className="collapse-toggle btn btn-outline btn-secondary btn-square"
              data-collapse="#navbar-block-1"
              aria-controls="navbar-block-1"
              aria-label="Toggle navigation"
            >
              <span className="icon-[tabler--menu-2] collapse-open:hidden size-5.5"></span>
              <span className="icon-[tabler--x] collapse-open:block hidden size-5.5"></span>
            </button>
          </div>
        </div>

        <div
          id="navbar-block-1"
          className="transition-height collapse hidden grow basis-full overflow-hidden duration-300 max-md:w-full md:ml-auto md:flex md:w-auto md:basis-auto md:grow-0 md:items-center md:justify-end md:overflow-visible"
        >
          <div className="text-base-content flex gap-6 text-base font-medium max-md:mt-4 max-md:flex-col md:items-center">
            <Link href="/" className="hover:text-primary active:text-primary">Home</Link>

            {/* Features Dropdown */}
            <div className="dropdown relative inline-flex [--offset:8] max-md:[--strategy:static] md:[--trigger:hover]">
              <button
                type="button"
                className="dropdown-toggle dropdown-open:text-primary hover:text-primary flex items-center gap-1"
                aria-haspopup="menu"
                aria-expanded="false"
              >
                Features
                <span className="icon-[tabler--chevron-down] dropdown-open:rotate-180 size-4 transition-transform duration-200" />
              </button>
              <ul
                className="dropdown-menu dropdown-open:opacity-100 hidden min-w-52 before:absolute before:-top-2 before:left-0 before:h-2 before:w-full max-md:static max-md:mt-2 max-md:w-full max-md:border-0 max-md:bg-transparent max-md:shadow-none max-md:before:hidden"
                role="menu"
              >
                <li><Link href="/features" className="dropdown-item">All Features</Link></li>
                <li><Link href="/features/barcode-scanning" className="dropdown-item">Barcode Scanning</Link></li>
                <li><Link href="/features/offline-mobile-scanning" className="dropdown-item">Offline Mobile</Link></li>
                <li><Link href="/features/check-in-check-out" className="dropdown-item">Check In/Out</Link></li>
                <li><Link href="/features/low-stock-alerts" className="dropdown-item">Low Stock Alerts</Link></li>
                <li><Link href="/features/bulk-editing" className="dropdown-item">Bulk Editing</Link></li>
              </ul>
            </div>

            {/* Solutions Dropdown */}
            <div className="dropdown relative inline-flex [--offset:8] max-md:[--strategy:static] md:[--trigger:hover]">
              <button
                type="button"
                className="dropdown-toggle dropdown-open:text-primary hover:text-primary flex items-center gap-1"
                aria-haspopup="menu"
                aria-expanded="false"
              >
                Solutions
                <span className="icon-[tabler--chevron-down] dropdown-open:rotate-180 size-4 transition-transform duration-200" />
              </button>
              <ul
                className="dropdown-menu dropdown-open:opacity-100 hidden min-w-52 before:absolute before:-top-2 before:left-0 before:h-2 before:w-full max-md:static max-md:mt-2 max-md:w-full max-md:border-0 max-md:bg-transparent max-md:shadow-none max-md:before:hidden"
                role="menu"
              >
                <li><Link href="/solutions" className="dropdown-item">All Solutions</Link></li>
                <li><Link href="/solutions/warehouse-inventory" className="dropdown-item">Warehouse</Link></li>
                <li><Link href="/solutions/ecommerce-inventory" className="dropdown-item">E-commerce</Link></li>
                <li><Link href="/solutions/small-business" className="dropdown-item">Small Business</Link></li>
                <li><Link href="/solutions/construction-tools" className="dropdown-item">Construction Tools</Link></li>
                <li><Link href="/solutions/mobile-inventory-app" className="dropdown-item">Mobile App</Link></li>
                <li><Link href="/solutions/asset-tracking" className="dropdown-item">Asset Tracking</Link></li>
              </ul>
            </div>

            <Link href="/pricing" className="hover:text-primary active:text-primary">Pricing</Link>
            <Link href="/demo" className="hover:text-primary active:text-primary">Demo</Link>

            {/* Learn Dropdown */}
            <div className="dropdown relative inline-flex [--offset:8] max-md:[--strategy:static] md:[--trigger:hover]">
              <button
                type="button"
                className="dropdown-toggle dropdown-open:text-primary hover:text-primary flex items-center gap-1"
                aria-haspopup="menu"
                aria-expanded="false"
              >
                Learn
                <span className="icon-[tabler--chevron-down] dropdown-open:rotate-180 size-4 transition-transform duration-200" />
              </button>
              <ul
                className="dropdown-menu dropdown-open:opacity-100 hidden min-w-60 before:absolute before:-top-2 before:left-0 before:h-2 before:w-full max-md:static max-md:mt-2 max-md:w-full max-md:border-0 max-md:bg-transparent max-md:shadow-none max-md:before:hidden"
                role="menu"
              >
                <li><Link href="/learn/guide" className="dropdown-item">Guides</Link></li>
                <li><Link href="/learn/blog" className="dropdown-item">Blog</Link></li>
                <li><Link href="/learn/templates" className="dropdown-item">Templates &amp; Tools</Link></li>
                <li><Link href="/learn/glossary" className="dropdown-item">Glossary</Link></li>
              </ul>
            </div>

            <Link href="/login" className="hover:text-primary active:text-primary md:hidden">Sign in</Link>
          </div>

          <div className="my-6 h-px w-full shrink-0 bg-base-content/20 md:mx-6 md:my-0 md:h-6 md:w-px"></div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Link href="/login" className="btn btn-text max-md:hidden">
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary btn-gradient max-md:w-full">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
