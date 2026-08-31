import * as React from "react"
import { usePage } from '@inertiajs/react'
import {
  Home,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { roleLabel, isPrincipal, isAdministrator, hasRole } from "@/lib/roleLabels"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"

// Base admin navigation. Each entry names a Ziggy route; `superAdminOnly` /
// `administratorOnly` entries are filtered by role below. Routes are resolved
// lazily inside the component (not at module load) and guarded with
// `route().has()` so a name missing from the Ziggy payload — e.g. a stale
// server-side route cache right after a deploy — hides that one item instead
// of throwing and blanking the whole authenticated shell.
const baseItems = [
  { title: "Dashboard", route: 'admin.dashboard' },
  { title: "Teacher Management", route: 'admin.teachers.index' },
  { title: "User Management", route: 'admin.users.index', superAdminOnly: true },
  { title: "Assessment Tools", route: 'admin.assessment-tools', administratorOnly: true },
  { title: "IPCRF Submissions", route: 'admin.ipcrf.submissions' },
  { title: "Signed IPCRF", route: 'admin.signed-ipcrf' },
  { title: "IPCRF History", route: 'admin.ipcrf-history' },
  { title: "Questionnaire Results", route: 'admin.questionnaire-results' },
  { title: "IPCRF Configuration", route: 'admin.ipcrf.configuration' },
  { title: "Audit Logs", route: 'admin.audit-logs.index' },
]

// Resolve a Ziggy route name to a URL, or null if it isn't in the payload.
const safeRoute = (name) => {
  try {
    return route().has(name) ? route(name) : null;
  } catch {
    return null;
  }
}

export function AppSidebar({
  ...props
}) {
  const { auth } = usePage().props
  const roles = auth?.roles ?? auth?.user?.roles
  const principal = isPrincipal(roles)
  const administrator = isAdministrator(roles, auth?.user)
  // A Master Teacher holds both admin + teacher roles.
  const alsoTeacher = hasRole(roles, 'teacher')

  const items = baseItems
    .filter((item) =>
      (!item.superAdminOnly || principal) && (!item.administratorOnly || administrator)
    )
    .map((item) => ({ title: item.title, url: safeRoute(item.route) }))
    .filter((item) => item.url !== null)
  if (alsoTeacher) {
    const teacherUrl = safeRoute('teacher.dashboard')
    if (teacherUrl) {
      items.push({ title: "→ My Teacher Panel", url: teacherUrl })
    }
  }

  const navMain = [
    {
      title: "Menu",
      icon: Home,
      isActive: true,
      items,
    },
  ]

  const user = {
    name: auth?.user?.name ?? "User",
    email: auth?.user?.email ?? "",
    avatar: auth?.user?.profile_picture ?? "/pictures/isat.tmp",
    roleLabel: auth?.roleLabel ?? roleLabel(roles, auth?.user),
  }

  return (
    <Sidebar collapsible="icon" {...props} className="border-r-2 !bg-[#E8F5E9]" style={{ borderColor: '#A5D6A7', backgroundColor: '#E8F5E9 !important' }}>
      <SidebarHeader className="border-b-2 !bg-[#E8F5E9]" style={{ backgroundColor: '#E8F5E9 !important', borderColor: '#A5D6A7' }}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href={safeRoute('admin.dashboard') ?? '/dashboard'} className="flex items-center gap-2 hover:bg-green-50 transition-colors">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg shadow-md" style={{ background: 'linear-gradient(to bottom right, #81C784, #66BB6A)' }}>
                  <img
                    src="/pictures/isat.tmp"
                    alt="ISAT"
                    className="size-8 rounded-lg object-cover"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold" style={{ color: '#388E3C' }}>ISAT e-TRACES</span>
                  <span className="truncate text-xs" style={{ color: '#66BB6A' }}>{user.roleLabel} Panel</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="!bg-transparent" style={{ background: 'linear-gradient(to bottom, #F1F8E9, #E8F5E9) !important' }}>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t-2 !bg-[#E8F5E9]" style={{ backgroundColor: '#E8F5E9 !important', borderColor: '#A5D6A7' }}>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail style={{ backgroundColor: '#A5D6A7' }} />
    </Sidebar>
  );
}
