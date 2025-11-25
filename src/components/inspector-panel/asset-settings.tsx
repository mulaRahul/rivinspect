import { useInspectorContext } from "@/hooks/inspector-context"
import { type FileAsset } from "@rive-app/react-webgl2"
import { FileImageIcon, FileMusicIcon, FileTypeIcon, UploadIcon } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item"

export const AssetSettings = () => {

    const { assets, replaceAsset, reloadRive } = useInspectorContext()

    const [assetToUpdate, setAssetToUpdate] = useState<FileAsset>()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const categorizeFile = (filename: string) => {
        const extension = filename.split('.').pop()?.toLowerCase() || '';
        
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
        const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'];
        const fontExtensions = ['ttf', 'otf', 'woff', 'woff2', 'eot'];

        if (imageExtensions.includes(extension)) {
            return 'Image';
        } else if (audioExtensions.includes(extension)) {
            return 'Audio';
        } else if (fontExtensions.includes(extension)) {
            return 'Font';
        } else {
            return 'Other';
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (!file || !assetToUpdate) {
            console.log('No file selected or no asset to update.')
            return
        }
        const fileType = categorizeFile(file.name)
        console.log("Asset is", fileType)

        try {
            const fileBytes = new Uint8Array(await file.arrayBuffer());

            if (assetToUpdate.isAudio) {
                if (fileType !== 'Audio') {
                    toast.error('Please select a valid audio file.')
                    return;
                }
            } else if (assetToUpdate.isImage) {
                if (fileType !== 'Image') {
                    toast.error('Please select a valid image file.')
                    return;
                }
            } else if (assetToUpdate.isFont) {
                if (fileType !== 'Font') {
                    toast.error('Please select a valid font file.')
                    return;
                }
            }

            // Store the replacement asset bytes
            replaceAsset(assetToUpdate.uniqueFilename, fileBytes);

            // Reload the Rive instance to pick up the new asset
            reloadRive();

            toast.success(`Asset "${assetToUpdate.name}" updated successfully`)
        } catch (error) {
            toast.error('Failed to update asset. Please try again.')
        }

        setAssetToUpdate(undefined)
    }

    if (assets.length === 0) {
        return <p className="text-sm text-muted-foreground">
            No assets available
        </p>
    }

    return <>
        <input
            type="file"
            multiple={false}
            ref={fileInputRef}
            hidden
            onChange={handleFileChange}
        />
        {
            assets.map((asset) =>
                <Item variant="outline" size="sm" key={asset.uniqueFilename}>
                    <ItemMedia className="size-10 stroke-1">
                        {
                            asset.isFont && <FileTypeIcon strokeWidth={1.5} className="size-10 text-muted-foreground" />
                        }
                        {
                            asset.isImage && <FileImageIcon strokeWidth={1.5} className="size-10 text-muted-foreground" />
                        }
                        {
                            asset.isAudio && <FileMusicIcon strokeWidth={1.5} className="size-10 text-muted-foreground" />
                        }
                    </ItemMedia>

                    <ItemContent>
                        <ItemTitle className="font-normal">{asset.name}</ItemTitle>
                        <ItemDescription>{asset.uniqueFilename}</ItemDescription>
                    </ItemContent>

                    <ItemActions className="w-24 h-8 justify-end">
                        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => {
                            setAssetToUpdate(asset)
                            fileInputRef.current?.click()
                        }}>
                            <UploadIcon className="size-3" /> Replace
                        </Button>
                    </ItemActions>
                </Item>
            )
        }
    </>
}