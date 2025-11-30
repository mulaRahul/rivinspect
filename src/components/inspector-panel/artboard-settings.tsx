import { useInspectorContext } from "@/hooks/inspector-context";
import { Alignment, Fit } from "@rive-app/react-webgl2";
import { AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignStartHorizontal, AlignStartVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import NumberInput from "@/components/ui/origin-ui/number-input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";


export const ArtboardSettings = () => {

    const {
        contents,
        activeArtboard,
        size,
        fit,
        layoutScaleFactor,
        setActiveArtboard,
        setSize,
        updateFit,
        setAlignment,
        setLayoutScaleFactor,
    } = useInspectorContext()

    const [hAlign, setHAlign] = useState("center");
    const [vAlign, setVAlign] = useState("center");

    // Update alignment
    useEffect(() => {
        let newAlignment: Alignment = Alignment.Center;
        if (hAlign === "left" && vAlign === "top") newAlignment = Alignment.TopLeft;
        else if (hAlign === "center" && vAlign === "top") newAlignment = Alignment.TopCenter;
        else if (hAlign === "right" && vAlign === "top") newAlignment = Alignment.TopRight;
        else if (hAlign === "left" && vAlign === "center") newAlignment = Alignment.CenterLeft;
        else if (hAlign === "center" && vAlign === "center") newAlignment = Alignment.Center;
        else if (hAlign === "right" && vAlign === "center") newAlignment = Alignment.CenterRight;
        else if (hAlign === "left" && vAlign === "bottom") newAlignment = Alignment.BottomLeft;
        else if (hAlign === "center" && vAlign === "bottom") newAlignment = Alignment.BottomCenter;
        else if (hAlign === "right" && vAlign === "bottom") newAlignment = Alignment.BottomRight;
        setAlignment && setAlignment(newAlignment);
    }, [hAlign, vAlign]);

    return <>
        {/* Artboard */}
        <Select value={activeArtboard} onValueChange={setActiveArtboard}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an artboard" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Artboards</SelectLabel>
                    {contents?.artboards.map((artboard) => (
                        <SelectItem key={artboard.name} value={artboard.name}>
                            {artboard.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>

        {/* Size */}
        <Label className="text-muted-foreground">Size</Label>
        <div className="flex gap-2">
            <InputGroup>
                <InputGroupInput
                    value={size.x}
                    min={10}
                    max={98}
                    type="number"
                    onChange={e => setSize(
                        { ...size, x: Number(e.target.value) }
                    )}
                />
                <InputGroupAddon>
                    <p>X</p>
                </InputGroupAddon>
            </InputGroup>

            <InputGroup>
                <InputGroupInput
                    value={size.y}
                    min={10}
                    max={98}
                    type="number"
                    onChange={e => setSize(
                        { ...size, y: Number(e.target.value) }
                    )}
                />
                <InputGroupAddon>
                    <p>Y</p>
                </InputGroupAddon>
            </InputGroup>
        </div>

        <Label className="text-muted-foreground">Alignment</Label>
        <div className="flex w-full gap-4">
            <ToggleGroup value={vAlign} onValueChange={setVAlign} type="single" variant="outline" size="lg" className="w-full">
                <ToggleGroupItem value="top" className="flex-1" aria-label="Toggle bold">
                    <AlignStartHorizontal className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="center" className="flex-1" aria-label="Toggle italic">
                    <AlignCenterHorizontal className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="bottom" className="flex-1" aria-label="Toggle strikethrough">
                    <AlignEndHorizontal className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>

            <ToggleGroup value={hAlign} onValueChange={setHAlign} type="single" variant="outline" size="lg" className="w-full">
                <ToggleGroupItem value="left" className="flex-1" aria-label="Toggle bold">
                    <AlignStartVertical className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="center" className="flex-1" aria-label="Toggle italic">
                    <AlignCenterVertical className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="right" className="flex-1" aria-label="Toggle strikethrough">
                    <AlignEndVertical className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>

        {/* Layout */}
        <div className="flex w-full gap-4">
            <div className="flex flex-1 flex-col gap-3">
                <Label className="text-muted-foreground">Fit</Label>
                <Select
                    value={fit}
                    onValueChange={updateFit}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Fit Mode" />
                    </SelectTrigger>
                    <SelectContent >
                        <SelectItem value={Fit.None}>None</SelectItem>
                        <SelectItem value={Fit.Contain}>Contain</SelectItem>
                        <SelectItem value={Fit.Cover}>Cover</SelectItem>
                        <SelectItem value={Fit.Fill}>Fill</SelectItem>
                        <SelectItem value={Fit.Layout}>Layout</SelectItem>
                        <SelectItem value={Fit.FitWidth}>Fit Width</SelectItem>
                        <SelectItem value={Fit.FitHeight}>Fit Height</SelectItem>
                        <SelectItem value={Fit.ScaleDown}>Scale Down</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {
                fit == Fit.Layout &&
                <div className="flex flex-1 flex-col gap-3">
                    <Label htmlFor="scaleFactor" className="text-muted-foreground">Scale Factor</Label>
                    <NumberInput id="scaleFactor" value={layoutScaleFactor} minValue={0} step={0.1} onChange={setLayoutScaleFactor} />
                </div>
            }

        </div>

        {/* FPS Counter */}
        {/* <div className="flex items-center gap-2 px-2">
            <Label htmlFor="fps-counter" className="mr-auto text-muted-foreground">Display FPS Count</Label>
            <Switch id="fps-counter" checked={enableFPSCounter} onCheckedChange={setEnableFPSCounter} />
        </div> */}
    </>
}