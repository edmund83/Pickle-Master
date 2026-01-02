import Link from 'next/link'

export function MarketingNavbar() {
  return (
    <nav className="navbar px-0">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 md:flex md:items-center md:gap-2 lg:px-8">
        <div className="navbar-start w-max items-center justify-between max-md:w-full">
          <Link className="text-base-content flex items-center gap-3 text-xl font-bold" href="/">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <span className="text-base font-bold text-white">N</span>
            </div>
            Nook
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
          <div className="text-base-content *:hover:text-primary *:active:text-primary flex gap-6 text-base font-medium max-md:mt-4 max-md:flex-col md:items-center">
            <Link href="/">Home</Link>
            <Link href="/features">Features</Link>
            <Link href="/solutions">Solutions</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/learn">Learn</Link>
            <Link href="/login" className="md:hidden">Sign in</Link>
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
