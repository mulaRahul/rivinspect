import { useInspectorContext } from "@/hooks/inspector-context";
import { Button } from "@/components/ui/button";
import { PauseIcon, PlayIcon } from "lucide-react";

export const AnimationSettings = () => {
    const {
        contents,
        activeArtboard,
        activeStateMachine,
        playingAnimations,
        toggleAnimation,
    } = useInspectorContext()

    const artboard = contents.artboards.find(ab => ab.name === activeArtboard);
    const stateMachine = artboard?.stateMachines.find(sm => sm.name === activeStateMachine);

    if (stateMachine) {
        return <p className="text-sm text-muted-foreground col-span-2">
            Disable state machine to play animations
        </p>
    }

    if (!activeArtboard || artboard?.animations.length === 0) {
        return <p className="text-sm text-muted-foreground col-span-2">
            No animations available
        </p>
    }

    return <>{
        artboard?.animations.map((animationName) => {
            const isPlaying = playingAnimations.includes(animationName);

            return (
                <Button
                    key={animationName}
                    variant={isPlaying ? "default" : "secondary"}
                    size="sm"
                    className="justify-start"
                    onClick={() => toggleAnimation(animationName)}
                    aria-pressed={isPlaying}
                >
                    {isPlaying ? (
                        <PauseIcon className="mr-2 size-3" />
                    ) : (
                        <PlayIcon className="mr-2 size-3" />
                    )}
                    {animationName}
                </Button>
            )
        })
    }</>
}


{/* <div className="flex p-3 bg-secondary/30 border rounded-md">
    <Button variant="secondary" size="icon-lg">
        <Play />
    </Button>
    <div className="w-full ml-4 flex flex-col justify-center">
        <div className="flex gap-1 mb-2">
            <p className="font-medium">loop</p>
            <p className={cn("text-transparent", "ml-auto transition-colors")}>00:00 /</p>
            <p className="text-muted-foreground">00:07</p>
        </div>
        <Slider defaultValue={[33]} max={100} step={1} />
    </div>
</div> */}
