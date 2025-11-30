import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Toggle } from "@/components/ui/toggle"
import { useInspectorContext } from "@/hooks/inspector-context"
import { CodeXmlIcon, GithubIcon, InfoIcon } from "lucide-react"
import { CodePreview } from "./code-preview"
import { RiveCanvas } from "./rive-canvas"
import { ThemeToggleButton } from "../ui/shadcn-io/theme-toggle-button"
import { useTheme } from "@/hooks/theme-provider"

export const Workspace = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    const { showCode, setShowCode, activeArtboard } = useInspectorContext()
    const { theme, setTheme } = useTheme()

    return <div {...props}>
        <header className="p-4 flex items-center gap-1">
            <h1>Riv Inspect</h1>
            <Popover>
                <PopoverTrigger>
                    <Button variant="ghost" size="icon"><InfoIcon className="size-4" /></Button>
                </PopoverTrigger>
                <PopoverContent className="text-sm">
                    Riv Inspect is an open-source tool to inspect and debug <code>.riv</code> files. Not affiliated with Rive.
                    <br /><br />
                    Using Rive React Runtime: <code>@rive-app/react-webgl2</code><br />
                    Version: <code>^4.24.0</code>
                    <br /><br />
                    This site does not collect analytics, logs, or user files. Check <a href="/privacy-policy" className="underline">privacy policy</a> for more details.
                </PopoverContent>
            </Popover>
            <div className="ml-auto"></div>
            <Toggle pressed={showCode} onPressedChange={setShowCode} disabled={!activeArtboard} aria-label="Toggle code preview">
                <CodeXmlIcon className="size-4" />
            </Toggle>
            <a href="https://github.com/mulaRahul/rivinspect">
                <Button variant="ghost" size="icon">
                    <GithubIcon className="size-4" />
                </Button>
            </a>
            <ThemeToggleButton
                theme={theme == 'light' ? 'light' : 'dark'}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                variant="polygon"
                start="top-right"
            />
            {/* <ThemeToggleButton /> */}
        </header>
        <div className="flex flex-col flex-1 items-center justify-center">
            <RiveCanvas />
        </div>
        <div className="flex mt-2 mb-8 w-full justify-center">
            {showCode && <CodePreview />}
        </div>
    </div>
}