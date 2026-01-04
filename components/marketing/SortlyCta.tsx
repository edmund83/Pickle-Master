'use client'

import Link from 'next/link'
import { FadeIn } from './animations'

export function SortlyCta() {
  return (
    <div className="bg-base-100 pb-8 sm:pb-16 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="rounded-box bg-base-200 p-8 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Switching from Sortly?
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
              StockZip is built for real workflows (offline scanning + check-in/out) with pricing that won&apos;t punish growth.
              Migrate your data fast and keep your team moving.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/compare/sortly-alternative" className="btn btn-primary">
                See why teams switch
              </Link>
              <Link href="/migration/sortly" className="btn btn-outline btn-secondary">
                Sortly migration
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
