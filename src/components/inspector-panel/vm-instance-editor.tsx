import { useInspectorContext } from "@/hooks/inspector-context"
import { Settings2Icon } from "lucide-react"
import { Label } from "../ui/label"
import { VMPropertyItem } from "./vm-property-item"


export const VMInstanceEditor = () => {
    const {
        activeStateMachine,
        autoBind,
        viewModelName,
        viewModelInstanceName,
        viewModelInstance,
    } = useInspectorContext()

    if (!activeStateMachine) {
        return <p className="text-sm text-muted-foreground">
            No active State Machine
        </p>
    }

    if (!viewModelInstance) {
        return <p className="text-sm text-muted-foreground">
            No View Model Instance available or selected
        </p>
    }

    return (
        <div className="border-2 rounded-lg bg-secondary">

            <Label className="px-2 py-1.5 text-xs">
                <Settings2Icon className="size-3" />
                {
                    autoBind ? <code>Instance</code>
                    : <code>
                        {viewModelName} → {viewModelInstanceName}
                    </code>
                }
            </Label>

            <div className="flex flex-col p-2 gap-2 relative rounded-lg border bg-background">
                {
                    viewModelInstance?.properties.map((prop: any) => (
                        <VMPropertyItem key={prop.name} property={prop} viewModelInstance={viewModelInstance} />
                    ))
                }
                {
                    (viewModelInstance?.properties.length ?? 0) === 0 &&
                    <p className="text-sm text-muted-foreground">
                        No properties available in this View Model
                    </p>
                }
            </div>
        </div>
    )
}
