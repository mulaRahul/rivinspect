import { ZapIcon, ToggleRightIcon, HashIcon } from "lucide-react"
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "../ui/item"
import NumberInput from "../ui/origin-ui/number-input"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { StateMachineInputType, useStateMachineInput } from "@rive-app/react-webgl2"
import { useInspectorContext } from "@/hooks/inspector-context"

export const SMInputRow = (
    { name, type }:
        { name: string, type: StateMachineInputType }
) => {

    const { rive, activeStateMachine } = useInspectorContext();

    if (!rive || !activeStateMachine) {
        return null;
    }

    const input = useStateMachineInput(
        rive!,
        activeStateMachine!,
        name,
    );

    if (!input) {
        return <Item variant="outline" size="sm">
            <ItemContent>
                <ItemTitle className="font-normal">
                    <code>{name}</code> not found
                </ItemTitle>
            </ItemContent>
        </Item>
    }

    return <Item variant="outline" size="sm" className="py-0 pl-3 pr-2 h-12">
        <ItemMedia className="text-muted-foreground size-4">
            {
                type === StateMachineInputType.Trigger && <ZapIcon strokeWidth={1.5} />
            }
            {
                type === StateMachineInputType.Boolean && <ToggleRightIcon strokeWidth={1.5} />
            }
            {
                type === StateMachineInputType.Number && <HashIcon strokeWidth={1.5} />
            }
        </ItemMedia>
        <ItemContent>
            <ItemTitle className="font-normal">{name}</ItemTitle>
        </ItemContent>
        <ItemActions className="w-24 h-8 justify-end">
            {
                type === StateMachineInputType.Trigger && 
                <Button variant="outline" className="w-full h-full active:scale-90 transition-transform" onClick={() => input.fire()} >
                    trigger
                </Button>
            }
            {
                type === StateMachineInputType.Boolean &&
                <Checkbox 
                    className="size-6 border-muted-foreground/50" 
                    defaultChecked={input.value as boolean} 
                    onCheckedChange={(state) => input.value = state as boolean} 
                />
            }
            {
                type === StateMachineInputType.Number && 
                <NumberInput
                    className="h-full w-full text-right"
                    defaultValue={input.value as number}
                    onChange={(value) => input.value = value}
                    aria-label={name}
                />
            }
        </ItemActions>
    </Item>
}