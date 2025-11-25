import { useEffect, useRef, useState } from "react";
import { FileCheck, UploadIcon, X } from "lucide-react";
import { useRive, Layout } from "@rive-app/react-webgl2";

import { cn } from "@/lib/utils";
import { useInspectorContext } from "@/hooks/inspector-context";
import { H3, InlineCode, Paragraph } from "@/components/ui/type"


export const RiveCanvas = () => {

    const { buffer, fileName, activeArtboard, activeStateMachine, size, updateRiveFile, riveReloadKey } = useInspectorContext();

    const [isDragging, setIsDragging] = useState(false);
    const uploadAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            updateRiveFile(file);
        }
    };

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };
    const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
            updateRiveFile(file);
        }
    };

    return buffer ? (
        <div id="container" className={cn(
                "relative bg-transparent rounded-xl overflow-hidden outline",
                "has-[.close-btn:hover]:outline-red-500 has-[.close-btn:hover]:outline-offset-8 transition-all"
            )}
            style={{ width: `${size.x}%`, height: `${size.y}%` }}
            >
            <div className="flex items-center absolute top-4 left-4 p-2 gap-2 rounded-md bg-muted border text-xs">
                {fileName || "?.riv"}
                <X
                    size={"1em"}
                    className="close-btn text-muted-foreground hover:text-red-400 cursor-pointer transition-colors"
                    onClick={() => updateRiveFile()}
                />
            </div>

            <RiveCanvasInner key={`${activeArtboard}-${activeStateMachine}-${riveReloadKey}`} />
        </div>
    ) : (
        <div
            id="uploadArea"
            ref={uploadAreaRef}
            className={cn(
                "w-2/4 h-2/4 min-w-[300px] min-h-[200px]",
                "uploadarea flex flex-col gap-2 items-center justify-center bg-secondary/20 rounded-2xl outline-2",
                "cursor-pointer hover:bg-secondary/40 hover:outline-offset-8 hover:outline-blue-600/50 transition-all",
                isDragging && "outline-blue-600 outline-offset-8 bg-secondary/40"
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {
                isDragging
                    ? <FileCheck size={48} className="mb-4 text-blue-500 transition-colors" />
                    : <UploadIcon size={48} className="mb-4 uploadarea-hover:text-blue-600 transition-colors" />
            }
            <H3>{isDragging ? "Release to drop" : "Drag & Drop your .riv file here"}</H3>
            <Paragraph className="text-muted-foreground">Or click to browse files</Paragraph>
            <InlineCode className="mt-2 px-2 py-1 text-xs text-muted-foreground font-light bg-primary-foreground rounded">Supports .riv files</InlineCode>
            <input
                hidden
                type="file"
                accept=".riv"
                ref={fileInputRef}
                onChange={onFileChange}
            />
        </div>
    )
}

const RiveCanvasInner = () => {
    const {
        buffer,
        activeArtboard,
        size,
        fit,
        alignment,
        layoutScaleFactor,
        activeStateMachine,
        autoBind,
        showCode,
        assetLoader,
        onRiveReady,
        onStop,
    } = useInspectorContext()

    const { rive, RiveComponent } = useRive({
        buffer: buffer,
        autoplay: true,
        autoBind: autoBind,
        stateMachines: activeStateMachine,
        artboard: activeArtboard,
        layout: new Layout({
            fit: fit,
            alignment: alignment,
            layoutScaleFactor: layoutScaleFactor,
        }),
        assetLoader,
        onRiveReady,
        onStop,
    })

    useEffect(() => {
        return () => {
            rive?.cleanup()
        }
    }, [])

    useEffect(() => {
        if (rive) {
            rive.resizeDrawingSurfaceToCanvas()
        }
    }, [size, showCode])

    // useEffect(() => {
    //     if (enableFPSCounter) {
    //         rive?.enableFPSCounter((value) => {console.log("Rive FPS:", value)})
    //     } else {
    //         rive?.disableFPSCounter() // error
    //     }
    // }, [enableFPSCounter])

    useEffect(() => {
        if (rive) {
            rive.layout = new Layout({
                fit: fit,
                alignment: alignment,
                layoutScaleFactor: layoutScaleFactor,
            })
            rive.resizeDrawingSurfaceToCanvas()
        }
    }, [fit, alignment, layoutScaleFactor])

    return <RiveComponent />;
}