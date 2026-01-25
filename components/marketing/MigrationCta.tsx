'use client'

import Link from 'next/link'
import { FadeIn } from './animations'

export function MigrationCta() {
  return (
    <div className="bg-base-100 pb-8 sm:pb-16 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="rounded-box bg-base-200 p-8 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Migrating from another tool?
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
              StockZip is built for real workflows (offline scanning + check-in/out) with clear pricing that scales
              predictably. Import your data fast and keep your team moving.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/compare" className="btn btn-primary">
                See comparisons
              </Link>
              <Link href="/migration" className="btn btn-outline btn-secondary">
                Migration guide
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
