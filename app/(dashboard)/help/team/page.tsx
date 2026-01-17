'use client'

import { UserCog } from 'lucide-react'
import {
  HelpArticleLayout,
  HelpSection,
  HelpHeading,
  HelpSubheading,
  HelpParagraph,
  HelpList,
  HelpListItem,
  HelpTable,
  HelpTip,
  HelpSteps,
} from '../components/HelpArticleLayout'

export default function TeamHelp() {
  return (
    <HelpArticleLayout
      title="Team Management"
      description="Work together with your team"
      icon={UserCog}
      iconColor="bg-slate-50 text-slate-600"
      prevArticle={{ href: '/help/reports', title: 'Reports & Analytics' }}
      nextArticle={{ href: '/help/settings', title: 'Settings' }}
    >
      {/* Introduction */}
      <HelpSection>
        <HelpParagraph>
          StockZip works great for teams! Multiple people can access the same inventory, make
          changes, and collaborate. Different team members can have different levels of access
          based on their role - some can view everything, others can edit, and admins can manage
          the team itself.
        </HelpParagraph>
      </HelpSection>

      {/* User Roles */}
      <HelpSection>
        <HelpHeading>Understanding User Roles</HelpHeading>
        <HelpParagraph>
          Each team member has a role that determines what they can do:
        </HelpParagraph>
        <HelpTable
          headers={['Role', 'What They Can Do']}
          rows={[
            ['Owner', 'Everything! Full access to all features. Can delete the account and manage billing. There\'s only one owner.'],
            ['Admin', 'Manage inventory, settings, and team members. Can do almost everything except billing and account deletion.'],
            ['Editor', 'Create and edit items, run reports, perform daily inventory tasks. Cannot change settings or manage team.'],
            ['Viewer', 'View-only access. Can see inventory and reports but cannot make any changes.'],
          ]}
        />
        <HelpTip>
          Give people the minimum access they need. A warehouse worker might just need Editor,
          while your accountant might only need Viewer to check reports.
        </HelpTip>
      </HelpSection>

      {/* Viewing Team */}
      <HelpSection>
        <HelpHeading>Viewing Your Team</HelpHeading>
        <HelpSteps
          steps={[
            {
              title: 'Go to Settings → Team',
              description: 'Click "Settings" in the sidebar, then "Team".',
            },
            {
              title: 'See all team members',
              description: 'You\'ll see a list of everyone with access.',
            },
            {
              title: 'View their details',
              description: 'Each person shows their name, email, role, and when they joined.',
            },
          ]}
        />
      </HelpSection>

      {/* Inviting Members */}
      <HelpSection>
        <HelpHeading>Inviting Team Members</HelpHeading>
        <HelpParagraph>
          Ready to add someone to your team? Here&apos;s the process:
        </HelpParagraph>
        <HelpSteps
          steps={[
            {
              title: 'Go to Settings → Team',
              description: 'Navigate to the team settings.',
            },
            {
              title: 'Click "Invite Member"',
              description: 'Start the invitation process.',
            },
            {
              title: 'Enter their email address',
              description: 'The email they\'ll use to log in.',
            },
            {
              title: 'Choose a role',
              description: 'Admin, Editor, or Viewer.',
            },
            {
              title: 'Send the invitation',
              description: 'They\'ll receive an email with instructions to join.',
            },
          ]}
        />
        <HelpTip type="info">
          The person you invite will need to create a StockZip account (if they don&apos;t have one)
          and accept the invitation to join your team.
        </HelpTip>
      </HelpSection>

      {/* Activity Tracking */}
      <HelpSection>
        <HelpHeading>Tracking Team Activity</HelpHeading>
        <HelpParagraph>
          StockZip keeps track of everything everyone does. This is useful for:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>
            <strong>Accountability:</strong> Know who made each change
          </HelpListItem>
          <HelpListItem>
            <strong>Troubleshooting:</strong> If something looks wrong, find out who changed it
          </HelpListItem>
          <HelpListItem>
            <strong>Training:</strong> See what new team members are doing
          </HelpListItem>
        </HelpList>

        <HelpSubheading>Where to See Activity</HelpSubheading>
        <HelpList>
          <HelpListItem>
            <strong>Dashboard:</strong> Shows recent activity from all team members
          </HelpListItem>
          <HelpListItem>
            <strong>Item History:</strong> Each item shows who changed it and when
          </HelpListItem>
          <HelpListItem>
            <strong>Activity Log Report:</strong> Full audit trail of all actions
          </HelpListItem>
        </HelpList>
      </HelpSection>

      {/* What Gets Tracked */}
      <HelpSection>
        <HelpHeading>What Activity is Tracked?</HelpHeading>
        <HelpParagraph>
          Every important action is logged:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Creating, editing, or deleting items</HelpListItem>
          <HelpListItem>Adjusting quantities</HelpListItem>
          <HelpListItem>Creating and completing purchase orders</HelpListItem>
          <HelpListItem>Receiving inventory</HelpListItem>
          <HelpListItem>Completing pick lists</HelpListItem>
          <HelpListItem>Checking items in and out</HelpListItem>
          <HelpListItem>Running stock counts</HelpListItem>
          <HelpListItem>And more...</HelpListItem>
        </HelpList>
        <HelpParagraph>
          Each logged action shows:
        </HelpParagraph>
        <HelpList>
          <HelpListItem>Who did it (user name)</HelpListItem>
          <HelpListItem>What they did (action type)</HelpListItem>
          <HelpListItem>What was affected (item, order, etc.)</HelpListItem>
          <HelpListItem>When it happened (date and time)</HelpListItem>
        </HelpList>
      </HelpSection>

      {/* Tips */}
      <HelpSection>
        <HelpHeading>Tips for Team Management</HelpHeading>
        <HelpList ordered>
          <HelpListItem>
            <strong>Start with fewer permissions:</strong> Give new team members Viewer or Editor
            access first. You can always increase permissions later.
          </HelpListItem>
          <HelpListItem>
            <strong>Use descriptive names:</strong> Make sure everyone uses their real name in
            their profile so you can see who did what.
          </HelpListItem>
          <HelpListItem>
            <strong>Review activity regularly:</strong> Check the activity feed to stay aware of
            what&apos;s happening with your inventory.
          </HelpListItem>
          <HelpListItem>
            <strong>Train your team:</strong> Make sure everyone knows how to use StockZip properly.
            Share these help articles with them!
          </HelpListItem>
          <HelpListItem>
            <strong>Remove access when needed:</strong> When someone leaves your team, remove their
            access promptly.
          </HelpListItem>
        </HelpList>
      </HelpSection>
    </HelpArticleLayout>
  )
}
