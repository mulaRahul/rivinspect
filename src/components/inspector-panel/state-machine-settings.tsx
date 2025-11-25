import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useInspectorContext } from "@/hooks/inspector-context";
import { BellRingIcon } from "lucide-react";
import { useMemo } from "react";
import { SMInputRow } from "./sm-input-item";

export const StateMachineSettings = () => {
    const {
        contents,
        activeArtboard,
        activeStateMachine,
        captureEvents,
        setCaptureEvents,
    } = useInspectorContext()

    const artboard = useMemo(
        () => contents.artboards.find(ab => ab.name === activeArtboard),
        [contents, activeArtboard]
    )
    const stateMachine = useMemo(
        () => artboard?.stateMachines.find(sm => sm.name === activeStateMachine)
        , [artboard, activeStateMachine]
    )

    if (!activeStateMachine) {
        return <p className="text-sm text-muted-foreground">
            Enable a state machine
        </p>
    }

    return <>
        <Select value={activeStateMachine} >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a state machine" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>State Machine</SelectLabel>
                    {
                        artboard?.stateMachines.map((sm) => (
                            <SelectItem key={sm.name} value={sm.name}>
                                {sm.name}
                            </SelectItem>
                        ))
                    }
                </SelectGroup>
            </SelectContent>
        </Select>

        {/* Inputs */}
        {
            stateMachine?.inputs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No inputs available for this state machine.
                </p>
            ) : <>
                {stateMachine?.inputs.map((input) =>
                    <SMInputRow
                        key={input.name}
                        name={input.name}
                        type={input.type}
                    />
                )}
            </>
        }

        <div className="flex items-center gap-2 px-2">
            <Tooltip>
                <TooltipTrigger>
                    <BellRingIcon className="size-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Add listeners for rive events and get notified</p>
                </TooltipContent>
            </Tooltip>
            <Label htmlFor="listen-events" className="mr-auto text-muted-foreground">Capture Events</Label>
            <Switch id="listen-events" checked={captureEvents} onCheckedChange={setCaptureEvents} />
        </div>
    </>
}