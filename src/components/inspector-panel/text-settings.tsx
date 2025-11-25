import { useInspectorContext } from "@/hooks/inspector-context"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group"
import { HelpCircle, SearchIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"

interface TextRun {
    name: string
    value: string
}

export const TextSettings = () => {
    const { rive } = useInspectorContext()

    const [runName, setRunName] = useState<string>("")
    const [runs, setRuns] = useState<TextRun[]>([])

    const findTextRun = () => {
        if (!rive || !runName) return

        if (runs.find(r => r.name === runName)) {
            toast.info(`Text run "${runName}" is already added.`)
            return
        }

        const value = rive.getTextRunValue(runName)

        if (!value) {
            toast.warning(`Text run "${runName}" not found.`, {
                description: "The text run name must be marked as exported in the Rive editor to make it queryable at runtime."
            })
        } else {
            setRuns(prev => {
                return [...prev, { name: runName, value }]
            })
        }
    }

    const updateTextRun = (runName: string, newValue: string) => {
        if (!rive) return
        rive.setTextRunValue(runName, newValue)

        // force a render update if no animations or state machines are playing
        if (rive.playingAnimationNames.length == 0 && rive.playingStateMachineNames.length == 0) {
            rive.play()
            rive.stop()
        }
    }

    return <>
        <InputGroup>
            <InputGroupInput placeholder="text run" value={runName} onChange={e => setRunName(e.target.value)} />

            <InputGroupAddon align="inline-end">
                <InputGroupButton variant="secondary" onClick={findTextRun} disabled={!rive}>
                    <SearchIcon /> Find
                </InputGroupButton>
            </InputGroupAddon>

            <Tooltip>
                <TooltipTrigger asChild>
                    <InputGroupAddon>
                        <InputGroupButton
                            variant="ghost"
                            aria-label="Help"
                            size="icon-xs"
                        >
                            <HelpCircle />
                        </InputGroupButton>
                    </InputGroupAddon>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Find an exported text run by name to read/edit</p>
                </TooltipContent>
            </Tooltip>
        </InputGroup>


        {
            runs.map(run => (
                <InputGroup key={run.name}>
                    <InputGroupInput id="text-field" defaultValue={run.value} onChange={e => updateTextRun(run.name, e.target.value)} />
                    <InputGroupAddon align="block-start">
                        <Label htmlFor="text-field" className="text-primary">
                            {run.name}
                        </Label>
                    </InputGroupAddon>
                </InputGroup>
            ))
        }
    </>
}