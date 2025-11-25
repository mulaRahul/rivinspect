import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInspectorContext } from "@/hooks/inspector-context"
import { type ViewModel } from "@rive-app/react-webgl2"
import { BoxesIcon, BoxIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"
import { VMInstanceEditor } from "./vm-instance-editor"

enum Tab {
    AutoBind = "auto-bind",
    Manual = "manual",
}

export const DataBindingSettings = () => {
    const {
        rive,
        activeStateMachine,
        autoBind,
        viewModelName,
        viewModelInstanceName,
        setAutoBind,
        setViewModelName,
        setViewModelInstanceName,
        setViewModelInstance,
        reloadRive
    } = useInspectorContext()

    useEffect(() => {
        if (!rive || !viewModelName || !viewModelInstanceName) {
            setViewModelInstanceName(undefined)
            return
        }
        const instance = viewModelInstanceName == "custom" 
            ? viewModel?.instance()
            : viewModel?.instanceByName(viewModelInstanceName)
        if (instance) {
            rive?.bindViewModelInstance(instance)
            setViewModelInstance(instance)

            return () => {
                instance?.cleanup()
            }
        }
    }, [viewModelInstanceName])

    const viewModels = useMemo(() => {
        if (!rive) return []

        const vms: ViewModel[] = []

        for (let i = 0; i < rive.viewModelCount; i++) {
            const vm = rive.viewModelByIndex(i)
            if (vm) {
                vms.push(vm)
            }
        }
        return vms
    }, [rive])

    const viewModel = useMemo(() => {
        if (!rive || !viewModelName) return
        return rive.viewModelByName(viewModelName);
    }, [rive, viewModelName])

    // if (!viewModels || viewModels.length === 0) {
    //     return (
    //         <p className="text-sm text-muted-foreground">
    //             No View Models available in this Rive file.
    //         </p>
    //     )
    // }

    const onTabChange = (value: string) => {
        const bind = value === Tab.AutoBind
        setAutoBind(bind)
        if (bind) {
            reloadRive()
            setViewModelName(undefined)
            setViewModelInstanceName(undefined)
        } else {
            rive?.bindViewModelInstance(null)
        }
    }

    return (
        <Tabs value={autoBind ? Tab.AutoBind : Tab.Manual} onValueChange={onTabChange} className="w-full">
            <TabsList className="w-full dark:bg-black">
                <TabsTrigger value={Tab.AutoBind}>Auto Bind</TabsTrigger>
                <TabsTrigger value={Tab.Manual}>Manual</TabsTrigger>
            </TabsList>
            <TabsContent value={Tab.AutoBind}>
                <VMInstanceEditor />
            </TabsContent>
            <TabsContent value={Tab.Manual} className="flex flex-col gap-2">
                {/* View Model */}
                <Label htmlFor="view-model" className="text-muted-foreground mt-1">View Model</Label>
                <Select value={viewModelName || ""} onValueChange={setViewModelName} disabled={!activeStateMachine}>
                    <SelectTrigger
                        id="view-model"
                        className="w-full justify-start"
                    >
                        <BoxIcon className="size-4 text-muted-foreground" />
                        <div className="mr-auto">
                            <SelectValue placeholder="Select instance" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>View Models</SelectLabel>
                            {
                                viewModels.map((vm) => (
                                    <SelectItem key={vm.name} value={vm.name}>
                                        {vm.name}
                                    </SelectItem>
                                ))
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>
                {/* View Model Instance */}
                {
                    viewModelName && <>
                        <Label className="text-muted-foreground">Instance</Label>
                        <Select value={viewModelInstanceName ?? ""} onValueChange={setViewModelInstanceName}>
                            <SelectTrigger
                                id="view-model-properties"
                                className="w-full"
                            >
                                <BoxesIcon strokeWidth={1.5} className="size-5 text-muted-foreground" />
                                <div className="mr-auto">
                                    <SelectValue placeholder="Select instance" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Exported Instances</SelectLabel>
                                    {
                                        viewModel?.instanceNames.map((name) => (
                                            <SelectItem key={name} value={name}>
                                                {name}
                                            </SelectItem>
                                        ))
                                    }
                                    <SelectItem key="custom" value="custom">Custom</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </>
                }
                {/* View Model Instance Properties */}
                {viewModelInstanceName !== undefined && <VMInstanceEditor />}
            </TabsContent>
        </Tabs>
    )
}