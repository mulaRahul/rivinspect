import { Outlet, createRootRoute } from '@tanstack/react-router'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/hooks/theme-provider'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <Outlet />
      <Toaster position='bottom-center' />
    </ThemeProvider>
  ),
})
