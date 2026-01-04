'use client'

import Link from 'next/link'
import { FadeIn } from './animations'

export function FinalCta() {
  return (
    <div className="bg-base-100 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="rounded-box bg-base-200 p-10 text-center">
            <h2 className="text-base-content text-2xl font-semibold md:text-3xl">
              Start tracking stock with confidence
            </h2>
            <p className="text-base-content/80 mx-auto mt-3 max-w-3xl text-lg">
              Try StockZip free and see how fast your team can scan, update, and stay accurate.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Free Trial
                <span className="icon-[tabler--arrow-right] size-5 rtl:rotate-180"></span>
              </Link>
              <Link href="/login" className="btn btn-outline btn-secondary btn-lg">
                Sign in
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
