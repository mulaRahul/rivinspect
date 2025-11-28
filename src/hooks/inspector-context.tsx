import React, { createContext, useContext, useEffect, useState } from "react"

import type { RiveContents } from "@/lib/utils"
import { Alignment, decodeAudio, decodeFont, decodeImage, EventType, Fit, Rive, RiveEventType, ViewModelInstance, type AudioAsset, type FileAsset, type FontAsset, type ImageAsset, type RiveEventPayload } from "@rive-app/react-webgl2"
import { toast } from "sonner"


export type InspectorContext = {
  buffer?: ArrayBuffer
  fileName?: string
  contents: RiveContents
  // 
  rive?: Rive
  activeArtboard?: string
  size: { x: number; y: number }
  alignment: Alignment
  fit: Fit
  layoutScaleFactor: number
  enableFPSCounter: boolean
  activeCodeSnippet: number
  //
  playingAnimations: string[]
  //
  activeStateMachine?: string
  captureEvents: boolean
  //
  autoBind: boolean
  viewModelName: string | undefined
  viewModelInstanceName: string | undefined
  viewModelInstance: ViewModelInstance | undefined
  //
  assets: FileAsset[]
  riveReloadKey: number
  //
  showCode: boolean
  //
  updateRiveFile: (riveFile?: File) => void
  assetLoader: (asset: FileAsset, bytes: Uint8Array) => boolean
  onRiveReady: (riveInstance: Rive) => void
  setSize: (size: { x: number; y: number }) => void
  setActiveArtboard: (artboardName: string) => void
  updateFit: (fit: Fit) => void
  setAlignment: (alignment: Alignment) => void
  setLayoutScaleFactor: (scale: number) => void
  setEnableFPSCounter: (enable: boolean) => void
  setActiveCodeSnippet: (index: number) => void
  // 
  toggleAnimation: (animationName: string) => void
  onStop: (e: any) => void
  //
  setActiveStateMachine: (stateMachineName: string | undefined) => void
  setCaptureEvents: (capture: boolean) => void
  //
  setAutoBind: (autoBind: boolean) => void
  setViewModelName: (viewModelName: string | undefined) => void
  setViewModelInstanceName: (viewModelInstanceName: string | undefined) => void
  setViewModelInstance: (viewModelInstance: ViewModelInstance | undefined) => void
  //
  replaceAsset: (uniqueFilename: string, bytes: Uint8Array) => void
  reloadRive: () => void
  //
  setShowCode: (show: boolean) => void
}

const InspectorContext = createContext<InspectorContext | null>(null)

export const InspectorContextProvider = ({ children }: { children: React.ReactNode }) => {

  const [rive, setRive] = useState<Rive | undefined>()

  // Rive File State
  const [contents, setContents] = useState<RiveContents>({
    artboards: [],
    viewModels: [],
  })
  const [buffer, setBuffer] = useState<ArrayBuffer | undefined>(undefined)
  const [fileName, setFileName] = useState<string | undefined>(undefined)

  // Artboard & Layout
  const [activeArtboard, setActiveArtboard] = useState<string | undefined>(undefined)
  const [size, setSize] = useState<{ x: number; y: number }>({ x: 75, y: 75 })
  const [alignment, setAlignment] = useState<Alignment>(Alignment.Center)
  const [fit, setFit] = useState<Fit>(Fit.Contain)
  const [layoutScaleFactor, setLayoutScaleFactor] = useState<number>(1)
  const [enableFPSCounter, setEnableFPSCounter] = useState<boolean>(false)
  const [activeCodeSnippet, setActiveCodeSnippet] = useState<number>(0)

  // Animation
  const [playingAnimations, setPlayingAnimations] = useState<string[]>([])

  // State Machine
  const [activeStateMachine, setActiveStateMachine] = useState<string | undefined>(undefined)
  const [captureEvents, setCaptureEvents] = useState<boolean>(false)

  // Data Binding
  const [autoBind, setAutoBind] = useState<boolean>(false)
  const [viewModelName, setViewModelName] = useState<string | undefined>(undefined)
  const [viewModelInstanceName, setViewModelInstanceName] = useState<string | undefined>(undefined)
  const [viewModelInstance, setViewModelInstance] = useState<ViewModelInstance | undefined>(undefined)

  // Assets
  const [assets, setAssets] = useState<FileAsset[]>([])
  const [replacementAssets, setReplacementAssets] = useState<Map<string, Uint8Array>>(new Map())
  const [riveReloadKey, setRiveReloadKey] = useState<number>(0)
  
  // UI State
  const [showCode, setShowCode] = useState<boolean>(false)

  // Side Effects
  const onRivEvent = (e: any) => {
    const data = e.data as RiveEventPayload;
    if (data.type === RiveEventType.General) {
      toast.info(
        `Event: ${data.name}`,
        {
          description: data.properties ? `Properties: ${JSON.stringify(data.properties)}` : undefined,
        },
      )
    } else if (data.type === RiveEventType.OpenUrl) {
      toast.info(
        `OpenURL Event: ${data.name}`,
        {
          description: `URL: ${(data as any)?.url}`,
        },
      )
    }
  }

  useEffect(() => {
    if (rive) {
      if (captureEvents) {
        rive.on(EventType.RiveEvent, onRivEvent)
      } else {
        rive.off(EventType.RiveEvent, onRivEvent);
      }
    }
  }, [captureEvents])

  useEffect(() => {
    setViewModelName(undefined)
    setViewModelInstanceName(undefined)
    setViewModelInstance(undefined)
  }, [activeArtboard])

  // Functions
  const reset = () => {
    setBuffer(undefined)
    setFileName(undefined)
    setRive(undefined)
    setContents({
      artboards: [],
      viewModels: [],
    })
    setActiveArtboard(undefined)
    setAssets([])
    setReplacementAssets(new Map())
    setPlayingAnimations([])
    setActiveStateMachine(undefined)
    setRiveReloadKey(0)
    setViewModelName(undefined)
    setViewModelInstanceName(undefined)
    setViewModelInstance(undefined)
  }

  const updateRiveFile = async (file?: File) => {
    if (!file) {
      reset()
    }
    else if (!file.name.endsWith('.riv')) {
      toast.error("Invalid file type. Please upload a .riv file.")
    }
    else {
      setBuffer(await file.arrayBuffer())
      setFileName(file.name)
      setContents({
        artboards: [],
        viewModels: [],
      })
    }
  };

  const assetLoader = (asset: FileAsset, _bytes: Uint8Array) => {
    const a = assets.find(a => a.uniqueFilename === asset.uniqueFilename);

    if (!a) {
      const tAsset = asset.isFont ? asset as FontAsset : asset.isAudio ? asset as AudioAsset : asset as ImageAsset;
      setAssets((prev) => [...prev, tAsset]);
    }
    
    // Check if we have a replacement for this asset
    const replacement = replacementAssets.get(asset.uniqueFilename);
    if (replacement) {
      // Decode and set the replacement asset
      if (asset.isImage) {
        decodeImage(replacement).then(image => {
          (asset as ImageAsset).setRenderImage(image);
          image.unref();
        });
      } else if (asset.isAudio) {
        decodeAudio(replacement).then(audio => {
          (asset as AudioAsset).setAudioSource(audio);
          audio.unref();
        });
      } else if (asset.isFont) {
        decodeFont(replacement).then(font => {
          (asset as FontAsset).setFont(font);
          font.unref();
        });
      }
    }

    return false
  }

  const onRiveReady = (riveInstance: Rive) => {
    setRive(riveInstance);

    if (contents?.artboards.length === 0) {
      const vms: string[] = [];
      for (let i = 0; i < riveInstance.viewModelCount; i++) {
        const vm = riveInstance.viewModelByIndex(i);
        if (vm) {
          vms.push(vm.name);
        }
      }
      setContents({
        viewModels: vms,
        artboards: riveInstance.contents.artboards ?? [],
      })
      setActiveArtboard(riveInstance.activeArtboard)
    }

    if (autoBind) {
      const vm = riveInstance?.defaultViewModel()
      if (!vm || vm.instanceCount == 0) {
        setViewModelInstance(undefined)
        toast.warning("No View Model Instance is available to bind.", { description: "View Model Instances must be created and exported from the Rive Editor" })
      } else {
        setViewModelInstance(riveInstance.viewModelInstance ?? undefined)
      }
    } else {
      if (viewModelName && viewModelInstance) {
        riveInstance.bindViewModelInstance(viewModelInstance)
      } else {
        setViewModelInstance(undefined)
      }
    }

    if (riveInstance.playingAnimationNames.length > 0) {
      riveInstance.stop(riveInstance.playingAnimationNames)
    }
  }

  const updateFit = (fit: Fit) => {
    setFit((prev) => {
      if (prev == Fit.Layout) {
        reloadRive()
      }
      return fit
    })
  }

  const toggleAnimation = (animationName: string) => {
    if (!rive) return
    if (playingAnimations.includes(animationName)) {
      rive.pause(animationName);
      setPlayingAnimations((prev) => prev.filter(name => name !== animationName));
    } else {
      rive.play(animationName);
      setPlayingAnimations((prev) => [...prev, animationName]);
    }

  }

  const onStop = (e: any) => {
    if (e.data && e.data.length > 0) {
      setPlayingAnimations((prev) => prev.filter(name => name !== e.data[0]));
    }
  }

  const replaceAsset = (uniqueFilename: string, bytes: Uint8Array) => {
    setReplacementAssets((prev) => {
      const newMap = new Map(prev);
      newMap.set(uniqueFilename, bytes);
      return newMap;
    });
  }

  const reloadRive = () => {
    setRiveReloadKey((prev) => prev + 1);
  }

  const value: InspectorContext = {
    buffer,
    fileName,
    size,
    rive,
    contents,
    activeArtboard,
    fit,
    alignment,
    layoutScaleFactor,
    enableFPSCounter,
    activeCodeSnippet,
    playingAnimations,
    activeStateMachine,
    captureEvents,
    autoBind,
    viewModelName,
    viewModelInstanceName,
    viewModelInstance,
    assets,
    riveReloadKey,
    showCode,
    updateRiveFile,
    assetLoader,
    onRiveReady,
    setActiveArtboard,
    setSize,
    setAlignment,
    updateFit,
    setLayoutScaleFactor,
    setEnableFPSCounter,
    setActiveCodeSnippet,
    toggleAnimation,
    onStop,
    setActiveStateMachine,
    setCaptureEvents,
    setAutoBind,
    setViewModelName,
    setViewModelInstanceName,
    setViewModelInstance,
    replaceAsset,
    reloadRive,
    setShowCode,
  }

  return (
    <InspectorContext.Provider value={value}>
      {children}
    </InspectorContext.Provider>
  )
}

export const useInspectorContext = () => {
  const context = useContext(InspectorContext)

  if (!context)
    throw new Error("InspectorContext must be called from within the InspectorContextProvider")
  return context
}