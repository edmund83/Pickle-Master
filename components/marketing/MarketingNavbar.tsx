import Link from 'next/link'

export function MarketingNavbar() {
  return (
    <nav className="navbar px-0 bg-transparent">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 md:flex md:items-center md:gap-2 lg:px-8">
        <div className="navbar-start w-max items-center justify-between max-md:w-full">
          <Link className="text-white flex items-center gap-2 text-xl font-bold" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="StockZip"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
            StockZip<span className="text-[10px] font-light align-super opacity-70">™</span>
          </Link>
          <div className="md:hidden">
            <button
              type="button"
              className="collapse-toggle btn btn-outline btn-square border-white text-white hover:bg-accent hover:border-accent"
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
          <div className="text-white flex gap-6 text-base font-medium max-md:mt-4 max-md:flex-col md:items-center">
            <Link href="/" className="hover:text-accent active:text-accent">Home</Link>

            {/* Features Dropdown */}
            <div className="dropdown relative inline-flex [--offset:8] max-md:[--strategy:static] md:[--trigger:hover]">
              <button
                type="button"
                className="dropdown-toggle dropdown-open:text-accent hover:text-accent flex items-center gap-1"
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
                className="dropdown-toggle dropdown-open:text-accent hover:text-accent flex items-center gap-1"
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

            <Link href="/pricing" className="hover:text-accent active:text-accent">Pricing</Link>
            <Link href="/demo" className="hover:text-accent active:text-accent">Demo</Link>

            {/* Learn Dropdown */}
            <div className="dropdown relative inline-flex [--offset:8] max-md:[--strategy:static] md:[--trigger:hover]">
              <button
                type="button"
                className="dropdown-toggle dropdown-open:text-accent hover:text-accent flex items-center gap-1"
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

            <Link href="/login" className="hover:text-accent active:text-accent md:hidden">Sign in</Link>
          </div>

          <div className="my-6 h-px w-full shrink-0 bg-white/20 md:mx-6 md:my-0 md:h-6 md:w-px"></div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Link href="/login" className="btn btn-text text-white hover:text-accent max-md:hidden">
              Sign in
            </Link>
            <Link href="/signup" className="btn border-0 bg-white text-primary hover:bg-accent hover:text-accent-content max-md:w-full">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
