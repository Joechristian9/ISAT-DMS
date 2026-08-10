import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function AdminLayout({ children, header }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b-2 border-green-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
                        <Separator orientation="vertical" className="mr-2 h-4 bg-green-300" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-green-800 font-semibold">{header || 'Admin Panel'}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
