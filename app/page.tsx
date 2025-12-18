import { redirect } from 'next/navigation'

export default function Home() {
  // Root page redirects to dashboard (middleware handles auth check)
  redirect('/dashboard')
}
