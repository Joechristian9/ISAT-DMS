import * as React from "react"
import {
  Home,
  Users,
  FileText,
  Settings,
  BarChart3,
  GraduationCap,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
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

// Admin navigation data
const data = {
  user: {
    name: "Admin User",
    email: "admin@gmail.com",
    avatar: "/pictures/isat.tmp",
  },
  navMain: [
    {
      title: "Menu",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: route('admin.dashboard'),
        },
        {
          title: "Teacher Management",
          url: route('admin.teachers.index'),
        },
        {
          title: "IPCRF Submissions",
          url: route('admin.ipcrf.submissions'),
        },
        {
          title: "Signed IPCRF",
          url: route('admin.signed-ipcrf'),
        },
        {
          title: "IPCRF History",
          url: route('admin.ipcrf-history'),
        },
        {
          title: "Questionnaire Results",
          url: route('admin.questionnaire-results'),
        },
        {
          title: "IPCRF Configuration",
          url: route('admin.ipcrf.configuration'),
        },
        {
          title: "Audit Logs",
          url: route('admin.audit-logs.index'),
        }
      ]
    },
  ],
}

export function AppSidebar({
  ...props
}) {
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
                  <span className="truncate text-xs" style={{ color: '#66BB6A' }}>Admin Panel</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="!bg-transparent" style={{ background: 'linear-gradient(to bottom, #F1F8E9, #E8F5E9) !important' }}>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t-2 !bg-[#E8F5E9]" style={{ backgroundColor: '#E8F5E9 !important', borderColor: '#A5D6A7' }}>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail style={{ backgroundColor: '#A5D6A7' }} />
    </Sidebar>
  );
}
