import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import NumberInput from "@/components/ui/origin-ui/number-input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ColorPicker, ColorPickerAlpha, ColorPickerEyeDropper, ColorPickerFormat, ColorPickerHue, ColorPickerOutput, ColorPickerSelection } from "@/components/ui/shadcn-io/color-picker"
import { useInspectorContext } from "@/hooks/inspector-context"
import type { ViewModelInstance } from "@rive-app/react-webgl2"
import { decodeImage, useViewModelInstanceArtboard, useViewModelInstanceBoolean, useViewModelInstanceColor, useViewModelInstanceEnum, useViewModelInstanceImage, useViewModelInstanceList, useViewModelInstanceNumber, useViewModelInstanceString, useViewModelInstanceTrigger } from "@rive-app/react-webgl2"
import type { ViewModelProperty } from "@rive-app/webgl2/rive_advanced.mjs"
import Color from "color"
import { BoxIcon, CircleDotIcon, Edit2Icon, FrameIcon, HashIcon, ImageIcon, ListIcon, ListOrderedIcon, MinusIcon, PaletteIcon, PlusIcon, ToggleRightIcon, TypeIcon, UploadIcon, ZapIcon } from "lucide-react"
import { useMemo, useRef } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { H4 } from "../ui/type"


export const VMPropertyItem = ({ property, viewModelInstance }: { property: ViewModelProperty; viewModelInstance: ViewModelInstance }) => {

    const type = property.type.toString()

    if (type === "list") {
        return <VMListProperty property={property} viewModelInstance={viewModelInstance} />
    }

    return <Item variant="outline" size="sm" className="py-0 pl-3 pr-2 min-h-12">
        <ItemMedia className="text-muted-foreground size-3.5">
            {type === "trigger" && <ZapIcon />}
            {type === "boolean" && <ToggleRightIcon />}
            {type === "number" && <HashIcon />}
            {type === "string" && <TypeIcon />}
            {type === "color" && <PaletteIcon />}
            {type === "enumType" && <CircleDotIcon />}
            {type === "image" && <ImageIcon />}
            {type === "artboard" && <FrameIcon />}
            {type === "listIndex" && <ListOrderedIcon />}
            {type === "viewModel" && <BoxIcon />}
        </ItemMedia>
        <ItemContent>
            <ItemTitle className="font-normal">{property.name}</ItemTitle>
        </ItemContent>
        <ItemActions className="w-30 h-8 justify-end">
            {type === "trigger" && <VMTriggerProperty name={property.name} viewModelInstance={viewModelInstance} />}
            {type === "boolean" && <VMBooleanProperty name={property.name} viewModelInstance={viewModelInstance} />}
            {type === "number" && <VMNumberProperty name={property.name} viewModelInstance={viewModelInstance} />}
            {type === "string" && <VMStringProperty name={property.name} viewModelInstance={viewModelInstance} />}
            {type === "color" && <VMColorProperty name={property.name} viewModelInstance={viewModelInstance} />}
            {type === "enumType" && <VMEnumProperty name={property.name} viewModelInstance={viewModelInstance} />}
            {type === "image" && <VMImageProperty name={property.name} viewModelInstance={viewModelInstance} />}
            {type === "artboard" && <VMArtboardProperty name={property.name} viewModelInstance={viewModelInstance} />}
            {type === "viewModel" && <VMViewModelProperty name={property.name} viewModelInstance={viewModelInstance} />}
        </ItemActions>
    </Item>
}

const VMTriggerProperty = ({ name, viewModelInstance }: { name: string; viewModelInstance: ViewModelInstance }) => {

    const { trigger } = useViewModelInstanceTrigger(name, viewModelInstance)

    return <Button variant="secondary" className="w-full h-full active:scale-90 transition-transform" onClick={() => trigger()}>
        <ZapIcon strokeWidth={1.5} className="size-3.5" /> trigger
    </Button>
}

const VMBooleanProperty = ({ name, viewModelInstance }: { name: string; viewModelInstance: ViewModelInstance }) => {
    const { value, setValue } = useViewModelInstanceBoolean(name, viewModelInstance)
    return <Checkbox
        checked={value ?? false}
        onCheckedChange={setValue}
        className="size-5 border-muted-foreground/50"
    />
}

const VMNumberProperty = ({ name, viewModelInstance }: { name: string; viewModelInstance: ViewModelInstance }) => {
    const { value, setValue } = useViewModelInstanceNumber(name, viewModelInstance)
    return <NumberInput
        value={value ?? 0}
        onChange={setValue}
        aria-label={name + "-number-property"}
        className="h-full w-full text-right"
    />
}

const VMStringProperty = ({ name, viewModelInstance }: { name: string; viewModelInstance: ViewModelInstance }) => {
    const { value, setValue } = useViewModelInstanceString(name, viewModelInstance)
    return <Input
        type="text"
        value={value ?? ""}
        onChange={e => setValue(e.target.value)}
        className="h-full text-right"
    />
}

const VMColorProperty = ({ name, viewModelInstance }: { name: string; viewModelInstance: ViewModelInstance }) => {
    const { value, setRgba } = useViewModelInstanceColor(name, viewModelInstance)
    const intToHex = (colorInt: number | null) => {
        if (!colorInt) return "#000000"
        const r = (colorInt >> 16) & 0xFF
        const g = (colorInt >> 8) & 0xFF
        const b = colorInt & 0xFF
        return Color.rgb(r, g, b).hex()
    }
    const colorHex = useMemo(() => intToHex(value), [value])
    const onChange = (color: any) => {
        setRgba(color[0], color[1], color[2], color[3] * 255)
    }
    return <Popover>
        <PopoverTrigger>
            <InputGroup>
                <InputGroupInput className="text-md" value={colorHex} readOnly />
                <InputGroupAddon>
                    <div className="h-6 aspect-square rounded-sm" style={{ backgroundColor: colorHex }}></div>
                </InputGroupAddon>
            </InputGroup>
        </PopoverTrigger>
        <PopoverContent className="border-[1.5px]" sideOffset={12}>
            <ColorPicker className="max-w-md h-80" defaultValue={colorHex} onChange={onChange} >
                <ColorPickerSelection />
                <div className="flex items-center gap-4">
                    <ColorPickerEyeDropper />
                    <div className="grid w-full gap-1">
                        <ColorPickerHue />
                        <ColorPickerAlpha />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ColorPickerOutput />
                    <ColorPickerFormat />
                </div>
            </ColorPicker>
        </PopoverContent>
    </Popover>
}

const VMEnumProperty = ({ name, viewModelInstance }: { name: string; viewModelInstance: ViewModelInstance }) => {
    const { value, values, setValue } = useViewModelInstanceEnum(name, viewModelInstance)
    return <Select value={value ?? ""} onValueChange={setValue}>
        <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                {values.map((value) => (
                    <SelectItem key={value} value={value}>
                        {value}
                    </SelectItem>
                ))}
            </SelectGroup>
        </SelectContent>
    </Select>
}

const VMArtboardProperty = ({ name, viewModelInstance }: { name: string; viewModelInstance: ViewModelInstance }) => {
    const { rive, contents } = useInspectorContext()
    const { setValue } = useViewModelInstanceArtboard(name, viewModelInstance)
    const onChange = (value: string) => {
        if (!rive) return
        const bindableArtboard = rive.getBindableArtboard(value)
        setValue(bindableArtboard)
    }
    return <Select onValueChange={onChange}>
        <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                {contents.artboards.map((artboard) => (
                    <SelectItem key={artboard.name} value={artboard.name}>
                        {artboard.name}
                    </SelectItem>
                ))}
            </SelectGroup>
        </SelectContent>
    </Select>
}

const VMImageProperty = ({ name, viewModelInstance }: { name: string; viewModelInstance: ViewModelInstance }) => {
    const { setValue } = useViewModelInstanceImage(name, viewModelInstance)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        const image = await decodeImage(new Uint8Array(await file.arrayBuffer()))
        setValue(image)
        image.unref()
    }
    return <>
        <input
            type="file"
            accept="image/*"
            multiple={false}
            ref={fileInputRef}
            hidden
            onChange={handleFileChange}
        />
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => fileInputRef.current?.click()}>
            <UploadIcon className="size-3" /> Change
        </Button>
    </>
}

const VMListProperty = ({ property, viewModelInstance }: { property: ViewModelProperty; viewModelInstance: ViewModelInstance }) => {

    const { rive, contents } = useInspectorContext()

    const {
        length,
        getInstanceAt,
        addInstance,
        removeInstanceAt
    } = useViewModelInstanceList(property.name, viewModelInstance)

    const addItem = (vmName: string) => {
        const viewModel = rive?.viewModelByName(vmName)
        const newInstance = viewModel?.instance()
        if (newInstance) {
            addInstance(newInstance)
        }
    }
    // [bug] when using default instance, removing a new item does not udate the animation
    // [TODO] add sorting functionality
    return <div className="py-2 pl-3 pr-2 min-h-12 border rounded-md">
        <div className="flex">
            <div className="flex gap-3 items-center max-h-8">
                <ListIcon className="size-3.5 text-muted-foreground" />
                <p>{property.name}</p>
            </div>
            <div className="w-1/2 ml-auto flex flex-col gap-1">
                {Array.from({ length }).map((_, index) => {
                    const itemInstance = getInstanceAt(index)
                    return (
                        <div key={index} className="w-full flex items-center space-x-1">
                            <Popover>
                                <PopoverTrigger>
                                    <Button variant="ghost" size="icon-sm">
                                        <Edit2Icon className="size-3" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent side="left" sideOffset={8} className="w-80 flex flex-col gap-2">
                                    <H4>List Item {index + 1}</H4>
                                    {(itemInstance as any)?.properties.map((prop: any) => (
                                        <VMPropertyItem key={`list-${property.name}-item-${index}-prop-${prop.name}`} property={prop} viewModelInstance={itemInstance!} />
                                    ))}
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs" style={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
                                List Item {index + 1}
                            </p>
                            <Button variant="ghost" size="icon-sm" className="ml-auto hover:text-red-500" onClick={() => removeInstanceAt(index)}>
                                <MinusIcon className="size-3" />
                            </Button>
                        </div>
                    )
                })}

                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button variant="outline" size="sm" className="w-full font-normal text-xs" >
                            <PlusIcon className="size-3" /> Add Item
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-38">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Select ViewModel</DropdownMenuLabel>
                        {
                            contents.viewModels.map((vm) => (
                                <DropdownMenuItem key={vm} onClick={() => addItem(vm)}>{vm}</DropdownMenuItem>
                            ))
                        }
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </div>
    </div>
}

const VMViewModelProperty = ({ name, viewModelInstance }: { name: string; viewModelInstance: ViewModelInstance }) => {

    const property = viewModelInstance!.viewModel(name)!

    return <Popover>
        <PopoverTrigger>
            <Button variant="outline" size="sm" className="text-xs">
                <Edit2Icon className="size-3" /> Edit Instance
            </Button>
        </PopoverTrigger>
        <PopoverContent side="left" sideOffset={8} className="w-80 flex flex-col gap-2">
            <H4>{name}</H4>
            {property?.properties.map((prop: any) => (
                <VMPropertyItem key={`${name}-prop-${prop.name}`} property={prop} viewModelInstance={property!} />
            ))}
        </PopoverContent>
    </Popover>
}