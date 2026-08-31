import * as React from "react"
import { usePage } from '@inertiajs/react'
import {
  Home,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { roleLabel, isPrincipal, hasRole } from "@/lib/roleLabels"
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

// Base admin navigation. Items with `superAdminOnly` are filtered by role below.
const baseItems = [
  { title: "Dashboard", url: route('admin.dashboard') },
  { title: "Teacher Management", url: route('admin.teachers.index') },
  { title: "User Management", url: route('admin.users.index'), superAdminOnly: true },
  { title: "IPCRF Submissions", url: route('admin.ipcrf.submissions') },
  { title: "Signed IPCRF", url: route('admin.signed-ipcrf') },
  { title: "IPCRF History", url: route('admin.ipcrf-history') },
  { title: "Questionnaire Results", url: route('admin.questionnaire-results') },
  { title: "IPCRF Configuration", url: route('admin.ipcrf.configuration') },
  { title: "Audit Logs", url: route('admin.audit-logs.index') },
]

export function AppSidebar({
  ...props
}) {
  const { auth } = usePage().props
  const roles = auth?.roles ?? auth?.user?.roles
  const principal = isPrincipal(roles)
  // A Master Teacher holds both admin + teacher roles.
  const alsoTeacher = hasRole(roles, 'teacher')

  const items = baseItems.filter((item) => !item.superAdminOnly || principal)
  if (alsoTeacher) {
    items.push({ title: "→ My Teacher Panel", url: route('teacher.dashboard') })
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
    roleLabel: auth?.roleLabel ?? roleLabel(roles),
  }

  return (
    <Sidebar collapsible="icon" {...props} className="border-r-2 !bg-[#E8F5E9]" style={{ borderColor: '#A5D6A7', backgroundColor: '#E8F5E9 !important' }}>
      <SidebarHeader className="border-b-2 !bg-[#E8F5E9]" style={{ backgroundColor: '#E8F5E9 !important', borderColor: '#A5D6A7' }}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href={route('admin.dashboard')} className="flex items-center gap-2 hover:bg-green-50 transition-colors">
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
