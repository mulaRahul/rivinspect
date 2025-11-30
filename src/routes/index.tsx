import { createFileRoute } from '@tanstack/react-router'

import { Separator } from '@/components/ui/separator'
import { Workspace } from '@/components/workspace'
import { InspectorPanel } from '@/components/inspector-panel'
import { InspectorContextProvider } from '@/hooks/inspector-context'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <InspectorContextProvider>
      <main className='h-screen w-screen flex overflow-hidden'>
        <Workspace className='relative flex flex-col w-[calc(100vw-360px)] ' />
        <Separator orientation='vertical' />
        <InspectorPanel className='h-full w-[360px] dark:bg-sidebar/30' />
      </main>
    </InspectorContextProvider>
  )
}
