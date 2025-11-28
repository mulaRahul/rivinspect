'use client'

import { H4 } from "@/components/ui/type"
import { useInspectorContext } from "@/hooks/inspector-context"
import { useState } from "react"
import { toast } from "sonner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { ScrollArea } from "../ui/scroll-area"
import { Switch } from "../ui/switch"
import { AnimationSettings } from "./animation-settings"
import { ArtboardSettings } from "./artboard-settings"
import { AssetSettings } from "./asset-settings"
import { DataBindingSettings } from "./data-binding-settings"
import { StateMachineSettings } from "./state-machine-settings"
import { TextSettings } from "./text-settings"

export const InspectorPanel = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    const {
        contents,
        riveReloadKey,
        activeArtboard,
        activeStateMachine,
        autoBind,
        viewModelInstance,
        setActiveStateMachine,
        setActiveCodeSnippet,
        setViewModelName,
        setViewModelInstanceName,
        setViewModelInstance,
    } = useInspectorContext()

    const artboard = contents.artboards.find(ab => ab.name === activeArtboard);

    const [accordion, setAccordion] = useState<string[]>(['artboard'])

    const playDefaultStateMachine = (enabled: boolean) => {
        if (enabled) {
            const defaultStateMachine = artboard?.stateMachines[0];

            if (defaultStateMachine) {
                setActiveStateMachine(defaultStateMachine.name);
            } else {
                toast.error("No state machine available in the selected artboard.");
            }
        } else {
            setActiveStateMachine(undefined)
            setViewModelName(undefined)
            setViewModelInstanceName(undefined)
            setViewModelInstance(undefined)
        }
    }

    const onAccordionChange = (value: string[]) => {
        const addedItem = value.find(v => !accordion.includes(v))
        const removedItem = accordion.find(v => !value.includes(v))
        if (addedItem) {
            const snippetMap: Record<string, number> = {
                'artboard': 0,
                'animation': 1,
                'state-machine': 2,
                'data-binding': 3,
                'text': 4,
                'assets': 5,
            }
            const snippetIndex = snippetMap[addedItem]
            if (snippetIndex !== undefined) {
                setActiveCodeSnippet(snippetIndex)
            }
        }
        if (removedItem == "data-binding" && !autoBind && viewModelInstance) {
            // [bug]: VM instance values are reset upon accordion collapse and re-open
            return
        }
        setAccordion(value)
    }

    return <div {...props}>
        <ScrollArea className="h-full">

            <Accordion type="multiple" value={accordion} onValueChange={onAccordionChange} className="mb-40">

                <AccordionItem value="artboard" key="artboard">
                    <AccordionTrigger>
                        <H4>Artboard</H4>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                        <ArtboardSettings />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="animation" data-state="open">
                    <AccordionTrigger>
                        <H4>Animation</H4>
                    </AccordionTrigger>
                    <AccordionContent className="grid grid-cols-2 gap-4">
                        <AnimationSettings />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="state-machine">
                    <AccordionTrigger>
                        <div className="flex items-center justify-between w-full">
                            <H4>State Machine</H4>
                            <AccordionActionWrapper>
                                <Switch checked={!!activeStateMachine} onCheckedChange={playDefaultStateMachine} />
                            </AccordionActionWrapper>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                        <StateMachineSettings />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="data-binding">
                    <AccordionTrigger>
                        <H4>Data Binding</H4>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                        <DataBindingSettings key={riveReloadKey} />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="text">
                    <AccordionTrigger>
                        <H4>Text</H4>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                        <TextSettings />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="assets">
                    <AccordionTrigger>
                        <H4>Assets</H4>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                        <AssetSettings />
                    </AccordionContent>
                </AccordionItem>

            </Accordion>

        </ScrollArea>
    </div>
}

const AccordionActionWrapper = ({ children }: React.HTMLAttributes<HTMLButtonElement>) => {
    return <div onClick={(e) => e.stopPropagation()}>
        {children}
    </div>
}