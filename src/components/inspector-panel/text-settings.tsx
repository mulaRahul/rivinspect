import { useInspectorContext } from "@/hooks/inspector-context"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group"
import { HelpCircle, SearchIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export const TextSettings = () => {
    const { rive } = useInspectorContext()

    const [runName, setRunName] = useState<string>("")
    const [runs, setRuns] = useState<Map<string, string>>(new Map())
    const prevRiveRef = useRef(rive)

    // Sync runs with new rive instance
    useEffect(() => {
        if (rive !== prevRiveRef.current) {
            prevRiveRef.current = rive
            if (!rive) {
                setRuns(new Map())
                return
            }
            // Re-validate existing runs with new rive instance
            setRuns(prev => {
                const updated = new Map<string, string>()
                prev.forEach((_, name) => {
                    const value = rive.getTextRunValue(name)
                    if (value) {
                        updated.set(name, value)
                    }
                })
                return updated
            })
        }
    }, [rive])

    const findTextRun = () => {
        if (!rive || !runName.trim()) return

        if (runs.has(runName)) {
            toast.info(`Text run "${runName}" is already added.`)
            return
        }

        const value = rive.getTextRunValue(runName)

        if (!value) {
            toast.warning(`Text run "${runName}" not found.`, {
                description: "The text run name must be marked as exported in the Rive editor to make it queryable at runtime."
            })
        } else {
            setRuns(prev => new Map(prev).set(runName, value))
            setRunName("")
        }
    }

    const updateTextRun = (name: string, newValue: string) => {
        if (!rive) return
        rive.setTextRunValue(name, newValue)
        setRuns(prev => new Map(prev).set(name, newValue))

        // force a render update if no animations or state machines are playing
        if (rive.playingAnimationNames.length === 0 && rive.playingStateMachineNames.length === 0) {
            rive.play()
            rive.stop()
        }
    }

    return <>
        <InputGroup>
            <InputGroupInput 
                placeholder="text run" 
                value={runName} 
                onChange={e => setRunName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && findTextRun()}
            />

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
            Array.from(runs.entries()).map(([name, value]) => (
                <InputGroup key={name}>
                    <InputGroupInput 
                        id={`text-run-${name}`} 
                        value={value} 
                        onChange={e => updateTextRun(name, e.target.value)} 
                    />
                    <InputGroupAddon align="block-start">
                        <Label htmlFor={`text-run-${name}`} className="text-primary">
                            {name}
                        </Label>
                    </InputGroupAddon>
                </InputGroup>
            ))
        }
    </>
}