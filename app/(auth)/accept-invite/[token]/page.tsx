import { getInvitationByToken } from '@/app/actions/invitations'
import { AcceptInviteClient } from './AcceptInviteClient'

interface PageProps {
  params: Promise<{ token: string }>
}

/** Accept-invite: token lookup is done on the server only (token not sent from client for lookup). */
export default async function AcceptInvitePage({ params }: PageProps) {
  const { token } = await params
  const initialInvitation = await getInvitationByToken(token ?? '')
  const initialError =
    !token?.trim()
      ? 'Invalid invitation link.'
      : initialInvitation === null
        ? 'This invitation link is invalid or has already been used.'
        : null

  return (
    <AcceptInviteClient
      token={token ?? ''}
      initialInvitation={initialInvitation}
      initialError={initialError}
    />
  )
}
