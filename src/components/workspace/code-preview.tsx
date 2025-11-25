'use client'

import { CodeBlock } from '@/components/code-block'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Tabs,
    TabsContent,
    TabsContents,
    TabsList,
    TabsTrigger,
} from '@/components/ui/shadcn-io/tabs'
import { useInspectorContext, type InspectorContext } from '@/hooks/inspector-context'
import { Fit, StateMachineInputType } from '@rive-app/react-webgl2'
import ReactMarkdown from 'react-markdown'

type SnippetItem =
    | { type: 'text'; content: string }
    | { type: 'code'; content: string; language: string }

type CodeSnippet = (data: InspectorContext) => SnippetItem[]

type LanguageSnippets = {
    [language: string]: CodeSnippet[]
}

function capitalize(str: string): string {
    if (str.length === 0) {
        return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const snippets: LanguageSnippets = {
    webjs: [
        function (data) {
            return [
                {
                    type: 'text',
                    content: 'Basic setup for Rive in a web project using vanilla JavaScript.',
                },
                {
                    type: 'code',
                    language: 'html',
                    content:
                        `<!-- Place the canvas element -->
<canvas id="canvas" width="500" height="500"></canvas>

<!-- Add this script tag to your web page for the latest version -->
<script src="https://unpkg.com/@rive-app/canvas"></script>`
                },
                {
                    type: 'text',
                    content: 'After placing the canvas element and including the Rive script, instantiate Rive with the following code:',
                },
                {
                    type: 'code',
                    language: 'javascript',
                    content:
                        `const r = new rive.Rive({
  src: '${data.fileName ?? 'file.riv'}',
  canvas: document.getElementById('canvas'),
  ${data.activeArtboard ? `artboard: '${data.activeArtboard}',` : '// artboard: "Artboard", // Optional'}
  layout: new rive.Layout({
    fit: rive.Fit.${capitalize(data.fit)},
    alignment: rive.Alignment.${capitalize(data.alignment)},${data.fit == Fit.Layout ? `\n    layoutScaleFactor: ${data.layoutScaleFactor},` : ''}
  }),
  autoplay: true,
  onLoad: () => {
    r.resizeDrawingSurfaceToCanvas()
  },
})`,
                },
                {
                    type: 'text',
                    content: `For a more thorough guide, visit the [Rive Docs](https://rive.app/docs/runtimes/web/web-js).`,
                }
            ]
        },
        function (data) {
            return [
                {
                    type: 'text',
                    content: `Set animations to play on load`,
                },
                {
                    type: 'code',
                    language: 'javascript',
                    content:
                        `new rive.Rive({
    src: '${data.fileName ?? 'file.riv'}',
    canvas: document.getElementById('canvas'),
    animations: ${data.playingAnimations && data.playingAnimations.length > 0 ? `['${data.playingAnimations.join("', '")}']` : "['name']"},
    autoplay: true
});`,
                },
                {
                    type: 'text',
                    content: `Control animation playback using the following methods`,
                },
                {
                    type: 'code',
                    language: 'javascript',
                    content:
                        `// Play animation
r.play('name')

// Pause animation
r.pause('name')

// Stop animation
r.stop('name')`,
                },
                {
                    type: 'text',
                    content: `*⚠️ DEPRECATION WARNING: Use State Machines instead of direct animation playback at runtime.*`,
                }
            ]
        },
        function (data) {
            const inputs = data.rive?.stateMachineInputs(data.activeStateMachine || '') || []
            let inputCode: string[] = []

            inputs.forEach(input => {
                const name = input.name.replaceAll(/[^a-zA-Z0-9_]/g, '_');
                if (input.type === StateMachineInputType.Trigger) {
                    inputCode.push(
                        `const ${name} = inputs.find(i => i.name === '${input.name}');
${name}.fire();`)
                } else if (input.type === StateMachineInputType.Boolean) {
                    inputCode.push(
                        `const ${name} = inputs.find(i => i.name === '${input.name}');
${name}.value = true;`)
                } else if (input.type === StateMachineInputType.Number) {
                    inputCode.push(
                        `const ${name} = inputs.find(i => i.name === '${input.name}');
${name}.value = 0.5;`)
                }
            })

            return [
                {
                    type: 'text',
                    content: 'Enable state machine and access inputs `onLoad()`',
                },
                {
                    type: 'code',
                    language: 'javascript',
                    content:
                        `const r = new rive.Rive({
  ...
  autoplay: true,
  stateMachines: '${data.activeStateMachine ?? 'stateMachineName'}',
  onLoad: () => {
    // Get the inputs via the name of the state machine
    const inputs = r.stateMachineInputs('${data.activeStateMachine ?? 'stateMachineName'}');

    // Find the input you want to set a value for, or trigger
    const trigger = inputs.find(i => i.name === 'trigger');
    trigger.fire();
  },
});` + (data.captureEvents ? `\n\nr.on(rive.EventType.RiveEvent, (event) => {
  console.log(event.name);
  console.log(event.properties);
});` : ""),
                },
                {
                    type: 'text',
                    content: 'Find the input you want to set a value for, or trigger'
                },
                {
                    type: 'code',
                    language: 'javascript',
                    content: inputs.length === 0 ?
                        `const trigger = inputs.find(i => i.name === 'onClick');
trigger.fire();

const boolean = inputs.find(i => i.name === 'isOpen');
boolean.value = true;

const number = inputs.find(i => i.name === 'progress');
number.value = 0.5;` : inputCode.join('\n\n'),
                },
                {
                    type: 'text',
                    content: '*⚠️ DEPRECATED: Use Data Binding instead of Inputs for controlling Rive animations*'
                }
            ]
        },
        function (data) {
            const items: SnippetItem[] = [
                // Auto Bind
                data.autoBind ? {
                    type: 'text',
                    content: 'Use auto-binding to automatically bind the artboard\'s default view model instance to both the state machine and the artboard',
                } : {
                    type: 'text',
                    content: 'Bind a view model instance to a state machine and artboard',
                },
                data.autoBind ? {
                    type: 'code',
                    language: 'javascript',
                    content:
                        `const r = new rive.Rive({
  ...
  artboard: '${data.activeArtboard ?? 'Artboard'}',
  stateMachines: '${data.activeStateMachine ?? 'stateMachineName'}',
  autoplay: true,
  // set autoBind to true
  autoBind: true,
  onLoad: () => {
    // Access the current instance that was auto-bound
    let vmi = r.viewModelInstance;
  }
});`,
                } : {
                    type: 'code',
                    language: 'javascript',
                    content:
                        `const r = new rive.Rive({
  ...
  artboard: '${data.activeArtboard ?? 'Artboard'}',
  stateMachines: '${data.activeStateMachine ?? 'stateMachineName'}',
  autoplay: true,
  // access view models on load
  onLoad: () => {
    // Get the view model by name
    const viewModel = r.viewModelByName("${data.viewModelName ?? 'My View Model'}");

    // Get the instance by name
    const vmi = viewModel.instanceByName("${data.viewModelInstanceName ?? 'Instance 1'}");

    // Manually bind to rive
    r.bindViewModelInstance(vmi);
  }
});`,
                },

            ]
            if (data.viewModelInstance != undefined) {
                items.push({
                    type: 'text',
                    content: `Access and manipulate properties on the View Model Instance`,
                })
                if (data.viewModelInstance.properties.length > 0) {
                    const codeContent: string[] = []

                    data.viewModelInstance.properties.forEach(prop => {
                        const name = prop.name.replaceAll(/[^a-zA-Z0-9_]/g, '_');
                        const type = prop.type.toString();

                        if (type === "listIndex") return; // skip listIndex type

                        let codeLine = ''

                        codeLine += `const ${name} = vmi.${type}('${prop.name}');\n`

                        if (type === 'trigger') {
                            codeLine += `${name}.trigger();`
                        } else if (type === 'boolean') {
                            codeLine += `${name}.value = true;`
                        } else if (type === 'number') {
                            codeLine += `${name}.value = 0;`
                        } else if (type === 'string') {
                            codeLine += `${name}.value = 'New Value';`
                        } else if (type === 'color') {
                            codeLine += `// Set color to opaque black \n`
                            codeLine += `${name}.value = 0xFF000000;\n`
                            codeLine += `// or set RGBA to red with 50% opacity \n`
                            codeLine += `${name}.rgba(255, 0, 0, 128);\n`
                        } else if (type === 'enumType') {
                            const enumProp = data.viewModelInstance?.enum(prop.name)
                            if (enumProp?.values ?? 0 > 0) codeLine += `// Values: ${enumProp!.values.join(', ')}\n`
                            codeLine += `${name}.value = '${enumProp?.value || 'Option1'}';`
                        } else if (type === 'image') {
                            codeLine += `fetch("your.png").then(async (res) => {
  // Decode the image from the response.
  const image = await rive.decodeImage(
    new Uint8Array(await res.arrayBuffer())
  );
  ${name}.value = image;
  // Clean up when the image is no longer needed
  image.unref();
});`
                        } else if (type === "artboard") {
                            codeLine += `${name}.value = r.getBindableArtboard('Artboard');`
                        } else if (type === 'viewModel') {
                            codeLine += `${name}.properties // Access properties on the nested view model`
                        } else if (type === 'list') {
                            codeLine += `console.log("length: ", list.length);

// Get the view model
const itemVM = r.viewModelByName("Item View Model");

// Create a blank instance from the view model.
// Do this for each new item you want to add.
const item = itemVM.instance();
item.string("text").value = "New item";

// Add the newly created instance to the list
${name}.addInstance(item);

// Remove a specific instance from the list
${name}.removeInstance(item);`
                        }

                        codeContent.push(codeLine)
                    })

                    items.push({
                        type: 'code',
                        language: 'javascript',
                        content: codeContent.join('\n\n')
                    })
                }
            }
            items.push({
                type: 'text',
                content: `For a thorough guide, visit the [Rive Docs](https://rive.app/docs/runtimes/data-binding#web)`,
            })
            return items;
        },
        function (_) {
            return [
                {
                    type: 'code',
                    language: 'javascript',
                    content:
                        `const r = new Rive({
  ...
  onLoad: () => {
    // Read Value 
    r.getTextRunValue("runName")
    
    // Set Value
    r.setTextRunValue("runName", "New text value");
  },
})`,
                },
                {
                    type: 'text',
                    content: `*⚠️ DEPRECATED: Use Data Binding instead of direct text run manipulation at runtime*`,
                }
            ]
        },
        function (_) {
            return [
                {
                    type: 'text',
                    content: `You can intercept the loading of assets (images, fonts) from a Rive file and provide your own implementation for loading them.`,
                },
                {
                    type: 'code',
                    language: 'javascript',
                    content:
                        `const loadImage = async (asset) {
  // load your image from a source 
  const response = await fetch('https://picsum.photos/500/500');
  const buffer = new Uint8Array(await response.arrayBuffer());
  
  // convert to image format Rive can use
  const image = await rive.decodeImage(buffer);
  asset.setRenderImage(image);
  
  // Clean up when the asset is no longer needed
  image.unref();
}

const r = new rive.Rive({
  ...
  // Rive calls the assetLoader for each asset in the .riv file
  assetLoader: (asset, bytes) => {
    // Custom asset loading
    if (asset.isImage) {
      loadImage(asset)
      return false // We handled the asset loading
    }
    return true // Use embedded asset
  }
})`,
                },
                {
                    type: 'text',
                    content: 'Similarly, you can load font and sound assets:',
                },
                {
                    type: 'code',
                    language: 'javascript',
                    content:
                        `assetLoader: (asset, bytes) => {
  // Load font assets
  if (asset.isFont) {
    fetch('https://cdn.rive.app/runtime/flutter/comic-neue.ttf').then(
      async (res) => {
        const buffer = new Uint8Array(await res.arrayBuffer());
        // covert to format Rive can use
        font = await rive.decodeFont(buffer);
        asset.setFont(font);

        font.unref();
      }
    )
    return true // We handled the font loading
  }
  
  // Load audio assets
  if (asset.isAudio) {
    fetch('sample.wav').then(
      async (res) => {
        const buffer = new Uint8Array(await res.arrayBuffer());
        // covert to format Rive can use
        audio = await rive.decodeAudio(buffer);
        asset.setAudioSource(audio);

        audio.unref();
      }
    )
    return true // We handled the font loading
  }
  return true // Use embedded asset
}`
                },
                {
                    type: 'text',
                    content: `You can keep the asset handle and swap the asset later, say on a button click as well. Checkout the [Rive Docs](https://rive.app/docs/runtimes/loading-assets#web-js) for more details on custom asset loading.`,
                }
            ]
        },
    ],
    react: [
        function (data) {
            return [
                {
                    type: 'text',
                    content: 'Install the Rive React package:',
                },
                {
                    type: 'code',
                    language: 'bash',
                    content: 'npm i --save @rive-app/react-canvas',
                },
                {
                    type: 'text',
                    content: 'Render the Rive component using the `useRive` hook',
                },
                {
                    type: 'code',
                    language: 'jsx',
                    content: `import { useRive, Layout, Fit, Alignment } from '@rive-app/react-webgl2'

function RiveComponent() {
  const { RiveComponent } = useRive({
    src: '${data.fileName ?? 'file.riv'}',
    ${data.activeArtboard ? `artboard: '${data.activeArtboard}',` : '// artboard: "ArtboardName", // Optional'}
    layout: new Layout({
      fit: Fit.${capitalize(data.fit)},
      alignment: Alignment.${capitalize(data.alignment)},${data.fit == Fit.Layout ? `\n      layoutScaleFactor: ${data.layoutScaleFactor},` : ''}
    }),
    autoplay: true,
    onLoad: (rive) => {
      rive.resizeDrawingSurfaceToCanvas();
    }
  });

  return <RiveComponent />
}`,
                },
                {
                    type: 'text',
                    content: 'For a more thorough guide, visit the [Rive Docs](https://rive.app/docs/runtimes/react/react)',
                }
            ]
        },
        function (data) {
            return [
                {
                    type: 'text',
                    content: 'Control animation playback using the `useRive` hook and the `rive` instance:',
                },
                {
                    type: 'code',
                    language: 'jsx',
                    content: `import { useRive } from '@rive-app/react-canvas'

function RiveAnimation() {
  const { rive, RiveComponent } = useRive({
    src: '${data.fileName ?? 'file.riv'}',
    ${data.activeArtboard ? `artboard: '${data.activeArtboard}',` : '// artboard: "ArtboardName", // Optional'}
    autoplay: false,
  });

  return (
    <div>
      <RiveComponent />
      <button onClick={() => rive && rive.play('name')}>
        Play
      </button>
      <button onClick={() => rive && rive.pause('name')}>
        Pause
      </button>
      <button onClick={() => rive && rive.stop('name')}>
        Stop
      </button>
    </div>
  )
}`,
                },
                {
                    type: 'text',
                    content: 'You can also specify animations to start on load:',
                },
                {
                    type: 'code',
                    language: 'jsx',
                    content: `const { RiveComponent } = useRive({
  src: '${data.fileName ?? 'file.riv'}',
  ${data.activeArtboard ? `artboard: '${data.activeArtboard}',` : '// artboard: "ArtboardName", // Optional'}
  animations: ['idle', 'walk'], // Start multiple animations
  autoplay: true,
});`,
                },
                {
                    type: 'text',
                    content: `*⚠️ DEPRECATION WARNING: Use State Machines instead of direct animation playback at runtime.*`,
                }
            ]
        },
        function (data) {
            const inputs = data.rive?.stateMachineInputs(data.activeStateMachine || '') || []
            let hookCode: string[] = []
            let jsxCode: string[] = []

            inputs.forEach(input => {
                const name = input.name.replaceAll(/[^a-zA-Z0-9_]/g, '_');
                const stateMachine = data.activeStateMachine || 'StateMachineName';

                if (input.type === StateMachineInputType.Trigger) {
                    hookCode.push(`  const ${name} = useStateMachineInput(rive, '${stateMachine}', '${input.name}');`)
                    jsxCode.push(`      <button onClick={() => ${name} && ${name}.fire()}>
        Fire ${input.name}
      </button>`)
                } else if (input.type === StateMachineInputType.Boolean) {
                    hookCode.push(`  const ${name} = useStateMachineInput(rive, '${stateMachine}', '${input.name}');`)
                    jsxCode.push(`      <button onClick={() => ${name} && (${name}.value = !${name}.value)}>
        Toggle ${input.name}
      </button>`)
                } else if (input.type === StateMachineInputType.Number) {
                    hookCode.push(`  const ${name} = useStateMachineInput(rive, '${stateMachine}', '${input.name}');`)
                    jsxCode.push(`      <input 
        type="range" 
        min="0" 
        max="100" 
        onChange={(e) => ${name} && (${name}.value = Number(e.target.value))}
      />`)
                }
            })

            const hasInputs = inputs.length > 0;
            const defaultHooks = `  const triggerInput = useStateMachineInput(rive, 'StateMachineName', 'TriggerName');
  const boolInput = useStateMachineInput(rive, 'StateMachineName', 'BooleanName');
  const numberInput = useStateMachineInput(rive, 'StateMachineName', 'NumberName');`;

            const defaultJSX = `      <button onClick={() => triggerInput && triggerInput.fire()}>
        Fire Trigger
      </button>
      <button onClick={() => boolInput && (boolInput.value = !boolInput.value)}>
        Toggle Boolean
      </button>
      <input 
        type="range" 
        min="0" 
        max="100" 
        onChange={(e) => numberInput && (numberInput.value = Number(e.target.value))}
      />`;

            return [
                {
                    type: 'text',
                    content: 'Control state machine inputs using the `useStateMachineInput` hook:',
                },
                {
                    type: 'code',
                    language: 'jsx',
                    content: `import { useRive, useStateMachineInput } from '@rive-app/react-canvas'

function RiveStateMachine() {
  const { rive, RiveComponent } = useRive({
    src: '${data.fileName ?? 'file.riv'}',
    ${data.activeArtboard ? `artboard: '${data.activeArtboard}',` : '// artboard: "ArtboardName", // Optional'}
    stateMachines: '${data.activeStateMachine || 'StateMachineName'}',
    autoplay: true,
  });

  // Get input references
${hasInputs ? hookCode.join('\n') : defaultHooks}

  return (
    <div>
      <RiveComponent />
${hasInputs ? jsxCode.join('\n') : defaultJSX}
    </div>
  )
}`,
                },
                {
                    type: 'text',
                    content: 'The `useStateMachineInput` hook returns an input object with a `value` property for booleans and numbers, and a `fire()` method for triggers.',
                },
                {
                    type: 'text',
                    content: '*⚠️ DEPRECATED: Use Data Binding instead of Inputs for controlling Rive animations*'
                }
            ]
        },
        function (data) {
            const items: SnippetItem[] = []

            // Auto-bind or manual bind
            if (data.autoBind) {
                items.push({
                    type: 'text',
                    content: 'Use auto-binding to automatically bind the artboard\'s default view model instance:',
                })
                items.push({
                    type: 'code',
                    language: 'jsx',
                    content: `import { useRive } from '@rive-app/react-canvas'

function RiveDataBinding() {
  const { rive, RiveComponent } = useRive({
    src: '${data.fileName ?? 'file.riv'}',
    ${data.activeArtboard ? `artboard: '${data.activeArtboard}',` : '// artboard: "ArtboardName", // Optional'}
    stateMachines: '${data.activeStateMachine || 'StateMachineName'}',
    autoplay: true,
    autoBind: true, // Auto-bind the default view model instance
  });

  // Access the auto-bound view model instance
  const vmi = rive?.viewModelInstance;

  return <RiveComponent />
}`,
                })
            } else {
                items.push({
                    type: 'text',
                    content: 'Use the `useViewModel` hook to get a view model and bind an instance:',
                })
                items.push({
                    type: 'code',
                    language: 'jsx',
                    content: `import { useRive, useViewModel } from '@rive-app/react-webgl2'

function RiveDataBinding() {
  const { rive, RiveComponent } = useRive({
    src: '${data.fileName ?? 'file.riv'}',
    ${data.activeArtboard ? `artboard: '${data.activeArtboard}',` : '// artboard: "ArtboardName", // Optional'}
    stateMachines: '${data.activeStateMachine || 'StateMachineName'}',
    autoplay: true,
  });

  // Get the view model
  const viewModel = useViewModel(rive, { name: '${data.viewModelName ?? 'My View Model'}' });
  
  // Create an instance from the view model
  const vmi = viewModel?.instanceByName('${data.viewModelInstanceName ?? 'Instance 1'}');
  
  // Bind the instance to the Rive file
  if (rive && vmi) {
    rive.bindViewModelInstance(vmi);
  }

  return <RiveComponent />
}`,
                })
            }

            // Add property manipulation section if we have a view model instance
            if (data.viewModelInstance != undefined && data.viewModelInstance.properties.length > 0) {
                items.push({
                    type: 'text',
                    content: 'Use React hooks to manipulate properties on the view model instance:',
                })

                const hookImports: string[] = []
                const propertyBlocks: string[] = []

                data.viewModelInstance.properties.forEach(prop => {
                    const name = prop.name.replaceAll(/[^a-zA-Z0-9_]/g, '_');
                    const type = prop.type.toString();

                    if (type === "listIndex") return; // skip listIndex type

                    if (type === 'trigger') {
                        if (!hookImports.includes('useViewModelInstanceTrigger')) hookImports.push('useViewModelInstanceTrigger')
                        propertyBlocks.push(`const { trigger: ${name} } = useViewModelInstanceTrigger('${prop.name}', vmi);\n${name}?.();`)
                    } else if (type === 'boolean') {
                        if (!hookImports.includes('useViewModelInstanceBoolean')) hookImports.push('useViewModelInstanceBoolean')
                        propertyBlocks.push(`const { value: ${name}, setValue: set${name.charAt(0).toUpperCase() + name.slice(1)} } = useViewModelInstanceBoolean('${prop.name}', vmi);\nset${name.charAt(0).toUpperCase() + name.slice(1)}?.(true);`)
                    } else if (type === 'number') {
                        if (!hookImports.includes('useViewModelInstanceNumber')) hookImports.push('useViewModelInstanceNumber')
                        propertyBlocks.push(`const { value: ${name}, setValue: set${name.charAt(0).toUpperCase() + name.slice(1)} } = useViewModelInstanceNumber('${prop.name}', vmi);\nset${name.charAt(0).toUpperCase() + name.slice(1)}?.(100);`)
                    } else if (type === 'string') {
                        if (!hookImports.includes('useViewModelInstanceString')) hookImports.push('useViewModelInstanceString')
                        propertyBlocks.push(`const { value: ${name}, setValue: set${name.charAt(0).toUpperCase() + name.slice(1)} } = useViewModelInstanceString('${prop.name}', vmi);\nset${name.charAt(0).toUpperCase() + name.slice(1)}?.('New Value');`)
                    } else if (type === 'color') {
                        if (!hookImports.includes('useViewModelInstanceColor')) hookImports.push('useViewModelInstanceColor')
                        propertyBlocks.push(`const { value: ${name}, setRgb: set${name.charAt(0).toUpperCase() + name.slice(1)}Rgb } = useViewModelInstanceColor('${prop.name}', vmi);\nset${name.charAt(0).toUpperCase() + name.slice(1)}Rgb?.(255, 0, 0);`)
                    } else if (type === 'enumType') {
                        if (!hookImports.includes('useViewModelInstanceEnum')) hookImports.push('useViewModelInstanceEnum')
                        const enumProp = data.viewModelInstance?.enum(prop.name)
                        const enumUsage = enumProp?.values && enumProp.values.length > 0 
                            ? `// Options: ${enumProp.values.join(', ')}\nset${name.charAt(0).toUpperCase() + name.slice(1)}?.('${enumProp.values[0]}');`
                            : `set${name.charAt(0).toUpperCase() + name.slice(1)}?.('Option1');`
                        propertyBlocks.push(`const { value: ${name}, setValue: set${name.charAt(0).toUpperCase() + name.slice(1)}, values: ${name}Options } = useViewModelInstanceEnum('${prop.name}', vmi);\n${enumUsage}`)
                    } else if (type === 'viewModel') {
                        propertyBlocks.push(`// Nested view model '${prop.name}': Access properties using path syntax
// Example: useViewModelInstanceString('${prop.name}/propertyName', vmi)`)
                    } else if (type === 'list') {
                        if (!hookImports.includes('useViewModelInstanceList')) hookImports.push('useViewModelInstanceList')
                        propertyBlocks.push(`const { length: ${name}Length, addInstance: add${name.charAt(0).toUpperCase() + name.slice(1)} } = useViewModelInstanceList('${prop.name}', vmi);\nadd${name.charAt(0).toUpperCase() + name.slice(1)}?.(newInstance);`)
                    } else if (type === 'image') {
                        if (!hookImports.includes('useViewModelInstanceImage')) hookImports.push('useViewModelInstanceImage')
                        if (!hookImports.includes('decodeImage')) hookImports.push('decodeImage')
                        propertyBlocks.push(`const { setValue: set${name.charAt(0).toUpperCase() + name.slice(1)} } = useViewModelInstanceImage('${prop.name}', vmi);

// Load and decode image
const response = await fetch('https://example.com/image.png');
const imageBuffer = await response.arrayBuffer();
const decodedImage = await decodeImage(new Uint8Array(imageBuffer));
set${name.charAt(0).toUpperCase() + name.slice(1)}?.(decodedImage);

// Clean up when done
decodedImage.unref();`)
                    } else if (type === 'artboard') {
                        if (!hookImports.includes('useViewModelInstanceArtboard')) hookImports.push('useViewModelInstanceArtboard')
                        propertyBlocks.push(`const { setValue: set${name.charAt(0).toUpperCase() + name.slice(1)} } = useViewModelInstanceArtboard('${prop.name}', vmi);\nconst artboard = rive?.getBindableArtboard('ArtboardName');\nset${name.charAt(0).toUpperCase() + name.slice(1)}?.(artboard);`)
                    }
                })

                if (propertyBlocks.length > 0) {
                    const importStatement = hookImports.length > 0 
                        ? `import { ${hookImports.join(', ')} } from '@rive-app/react-webgl2';

`
                        : '';
                    
                    items.push({
                        type: 'code',
                        language: 'jsx',
                        content: `${importStatement}// Inside your component
${propertyBlocks.join('\n\n')}`
                    })
                }
            } else {
                // Show generic examples when no view model instance is active
                items.push({
                    type: 'text',
                    content: 'Use React hooks to manipulate properties on the view model instance:',
                })
                items.push({
                    type: 'code',
                    language: 'jsx',
                    content: `import {
  useViewModelInstanceBoolean,
  useViewModelInstanceString,
  useViewModelInstanceNumber,
  useViewModelInstanceEnum,
  useViewModelInstanceColor,
  useViewModelInstanceTrigger
} from '@rive-app/react-webgl2';

// Boolean property
const { value: isActive, setValue: setIsActive } = useViewModelInstanceBoolean('isToggleOn', vmi);
setIsActive?.(true);

// String property
const { value: userName, setValue: setUserName } = useViewModelInstanceString('userName', vmi);
setUserName?.('John Doe');

// Number property
const { value: score, setValue: setScore } = useViewModelInstanceNumber('score', vmi);
setScore?.(100);

// Enum property
const { value: status, setValue: setStatus, values: statusOptions } = useViewModelInstanceEnum('status', vmi);
setStatus?.('active');

// Color property
const { value: color, setRgb: setColorRgb } = useViewModelInstanceColor('themeColor', vmi);
setColorRgb?.(255, 0, 0);

// Trigger property
const { trigger: playEffect } = useViewModelInstanceTrigger('playEffect', vmi);
playEffect?.();`
                })
            }

            items.push({
                type: 'text',
                content: 'For a thorough guide, visit the [Rive Docs](https://rive.app/docs/runtimes/data-binding#react)',
            })

            return items
        },
        function (_) {
            return [
                {
                    type: 'text',
                    content: 'Read and update text run values using the `rive` instance from `useRive`:',
                },
                {
                    type: 'code',
                    language: 'jsx',
                    content: `import { useRive } from '@rive-app/react-canvas'
import { useEffect } from 'react'

function RiveTextRuns() {
  const { rive, RiveComponent } = useRive({...});

  useEffect(() => {
    if (rive) {
      // Read the current text value
      const currentText = rive.getTextRunValue('MyRun');
      console.log('Current text:', currentText);
      
      // Set a new text value
      rive.setTextRunValue('MyRun', 'New Text!');
    }
  }, [rive]);

  return <RiveComponent />
}`,
                },
                {
                    type: 'text',
                    content: '*⚠️ DEPRECATED: Use Data Binding instead of direct text run manipulation at runtime*',
                }
            ]
        },
        function (_) {
            return [
                {
                    type: 'text',
                    content: 'Load custom assets (images, fonts, audio) at runtime using the `assetLoader` callback:',
                },
                {
                    type: 'code',
                    language: 'jsx',
                    content: `import { useRive, decodeImage, decodeFont, decodeAudio } from '@rive-app/react-canvas'

function RiveAssetLoader() {
  const { RiveComponent } = useRive({
    // ...
    assetLoader: async (asset, bytes) => {
      // Load custom image
      if (asset.isImage) {
        const response = await fetch('https://example.com/image.png');
        const imageBuffer = new Uint8Array(await response.arrayBuffer());
        const image = await decodeImage(imageBuffer);
        asset.setRenderImage(image);
        image.unref();
        return true; // We handled the asset
      }
      
      // Load custom font
      if (asset.isFont) {
        const response = await fetch('https://example.com/font.ttf');
        const fontBuffer = new Uint8Array(await response.arrayBuffer());
        const font = await decodeFont(fontBuffer);
        asset.setFont(font);
        font.unref();
        return true; // We handled the asset
      }
      
      // Load custom audio
      if (asset.isAudio) {
        const response = await fetch('sample.wav');
        const audioBuffer = new Uint8Array(await response.arrayBuffer());
        const audio = await decodeAudio(audioBuffer);
        asset.setAudioSource(audio);
        audio.unref();
        return true; // We handled the asset
      }
      
      return false; // Use embedded or hosted asset
    },
  });

  return <RiveComponent />
}`,
                },
                {
                    type: 'text',
                    content: 'The `assetLoader` is called for each asset in the Rive file. Return `true` if you handle the asset loading, or `false` to use the default loading behavior.',
                },
                {
                    type: 'text',
                    content: 'For more details, visit the [Rive Docs](https://rive.app/docs/runtimes/loading-assets#react)',
                }
            ]
        },

    ],
//     flutter: [
//         function (data) {
//             return [
//                 {
//                     type: 'code',
//                     language: 'dart',
//                     content: `import 'package:rive/rive.dart'

// class RiveAnimation extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     return RiveAnimation.asset(
//       'assets/${data.fileName}',
//       ${data.activeArtboard ? `artboard: '${data.activeArtboard}',` : '// artboard: "ArtboardName", // Optional'}
//       fit: BoxFit.contain,
//       alignment: Alignment.center,
//     )
//   }
// }`,
//                 },
//             ]
//         },
//                 // Animation playback (legacy direct animation control – prefer state machines)
//                 function (data) {
//                         return [
//                                 {
//                                         type: 'text',
//                                         content: 'Control animation playback using a SimpleAnimation controller (prefer state machines for interactive logic).',
//                                 },
//                                 {
//                                         type: 'code',
//                                         language: 'dart',
//                                         content: `import 'package:rive/rive.dart';
// import 'package:flutter/material.dart';

// class SimpleAnimationExample extends StatefulWidget {
//     const SimpleAnimationExample({super.key});
//     @override
//     State<SimpleAnimationExample> createState() => _SimpleAnimationExampleState();
// }

// class _SimpleAnimationExampleState extends State<SimpleAnimationExample> {
//     late RiveAnimationController _controller;
//     bool _isPlaying = true;

//     @override
//     void initState() {
//         super.initState();
//         // Replace 'idle' with your animation name
//         _controller = SimpleAnimation('idle');
//     }

//     void _togglePlay() {
//         setState(() {
//             _isPlaying = !_isPlaying;
//             _controller.isActive = _isPlaying;
//         });
//     }

//     @override
//     Widget build(BuildContext context) {
//         return Column(
//             children: [
//                 Expanded(
//                     child: RiveAnimation.asset(
//                         'assets/${data.fileName}',
//                         ${data.activeArtboard ? `artboard: '${data.activeArtboard}',` : '// artboard: "ArtboardName", // Optional'}
//                         controllers: [_controller],
//                         fit: BoxFit.contain,
//                     ),
//                 ),
//                 Row(
//                     mainAxisAlignment: MainAxisAlignment.center,
//                     children: [
//                         ElevatedButton(
//                             onPressed: _togglePlay,
//                             child: Text(_isPlaying ? 'Pause' : 'Play'),
//                         ),
//                     ],
//                 )
//             ],
//         );
//     }
// }`,
//                                 },
//                                 {
//                                         type: 'text',
//                                         content: '*⚠️ DEPRECATION WARNING: Prefer State Machines instead of direct animation playback.*',
//                                 }
//                         ]
//                 },
//                 // State machine & inputs
//                 function (data) {
//                         return [
//                                 {
//                                         type: 'text',
//                                         content: 'Interact with a state machine using a controller and typed inputs (SMITrigger, SMIBool, SMINumber).',
//                                 },
//                                 {
//                                         type: 'code',
//                                         language: 'dart',
//                                         content: `import 'package:rive/rive.dart';
// import 'package:flutter/material.dart';
// import 'dart:async';

// class StateMachineExample extends StatefulWidget {
//     const StateMachineExample({super.key});
//     @override
//     State<StateMachineExample> createState() => _StateMachineExampleState();
// }

// class _StateMachineExampleState extends State<StateMachineExample> {
//     StateMachineController? _smController;
//     SMITrigger? _trigger;
//     SMIBool? _flag;
//     SMINumber? _progress;

//     @override
//     Widget build(BuildContext context) {
//         return Column(
//             children: [
//                 Expanded(
//                     child: RiveAnimation.asset(
//                         'assets/${data.fileName}',
//                         ${data.activeArtboard ? `artboard: '${data.activeArtboard}',` : '// artboard: "ArtboardName", // Optional'}
//                         fit: BoxFit.contain,
//                         onInit: (artboard) {
//                             final controller = StateMachineController.fromArtboard(
//                                 artboard,
//                                 '${data.activeStateMachine || 'State Machine 1'}',
//                             );
//                             if (controller != null) {
//                                 artboard.addController(controller);
//                                 _smController = controller;
//                                 _trigger = controller.findInput<bool>('onClick') as SMITrigger?;
//                                 _flag = controller.findInput<bool>('isOpen') as SMIBool?;
//                                 _progress = controller.findInput<double>('progress') as SMINumber?;
//                                 setState(() {});
//                             }
//                         },
//                     ),
//                 ),
//                 Wrap(
//                     spacing: 12,
//                     children: [
//                         ElevatedButton(
//                             onPressed: () => _trigger?.fire(),
//                             child: const Text('Fire Trigger'),
//                         ),
//                         ElevatedButton(
//                             onPressed: () {
//                                 if (_flag != null) _flag!.value = !_flag!.value;
//                                 setState(() {});
//                             },
//                             // Avoid template interpolation in this generated snippet; show Dart logic plainly
//                             child: Text('Toggle Bool: ' + ((_flag?.value ?? false) ? 'true' : 'false')),
//                         ),
//                         SizedBox(
//                             width: 160,
//                             child: Slider(
//                                 value: _progress?.value ?? 0,
//                                 min: 0,
//                                 max: 100,
//                                 onChanged: (v) {
//                                     if (_progress != null) _progress!.value = v;
//                                     setState(() {});
//                                 },
//                             ),
//                         )
//                     ],
//                 ),
//             ],
//         );
//     }
// }`,
//                                 },
//                                 {
//                                         type: 'text',
//                                         content: '*⚠️ DEPRECATED: Use Data Binding instead of direct state machine inputs for complex runtime control.*',
//                                 }
//                         ]
//                 },
//                 // Data Binding (auto-bind + manual bind + property access)
//                 function (data) {
//                         return [
//                                 {
//                                         type: 'text',
//                                         content: 'Bind view model instances (auto-bind or manual) and manipulate properties via the RiveWidgetController.',
//                                 },
//                                 {
//                                         type: 'code',
//                                         language: 'dart',
//                                         content: `import 'package:rive/rive.dart';
// import 'package:flutter/material.dart';

// class DataBindingExample extends StatefulWidget {
//     const DataBindingExample({super.key});
//     @override
//     State<DataBindingExample> createState() => _DataBindingExampleState();
// }

// class _DataBindingExampleState extends State<DataBindingExample> {
//     late final FileLoader _fileLoader = FileLoader.fromAsset(
//         'assets/${data.fileName}',
//         riveFactory: Factory.rive,
//     );
//     RiveWidgetController? _controller;
//     ViewModelInstance? _vmi;

//     @override
//     void dispose() {
//         _fileLoader.dispose();
//         _controller?.dispose();
//         super.dispose();
//     }

//     @override
//     Widget build(BuildContext context) {
//         return RiveWidgetBuilder(
//             fileLoader: _fileLoader,
//             artboardSelector: ${data.activeArtboard ? `ArtboardSelector.byName('${data.activeArtboard}')` : 'ArtboardDefault()'},
//             stateMachineSelector: ${data.activeStateMachine ? `StateMachineSelector.byName('${data.activeStateMachine}')` : 'StateMachineDefault()'},
//             dataBind: DataBind.auto(), // Auto-bind default instance
//             onLoaded: (state) {
//                 _controller = state.controller;
//                 _vmi = _controller?.viewModelInstance; // Auto-bound instance

//                 // Example property updates (ensure names exist in your file)
//                 final boolProp = _vmi?.boolean('isActive');
//                 boolProp?.value = true;

//                 final stringProp = _vmi?.string('title');
//                 stringProp?.value = 'Hello Rive';

//                 final numberProp = _vmi?.number('score');
//                 numberProp?.value = 42;

//                 final triggerProp = _vmi?.trigger('playEffect');
//                 triggerProp?.trigger();
//             },
//             builder: (context, state) => switch (state) {
//                 RiveLoading() => const Center(child: CircularProgressIndicator()),
//                 RiveFailed() => Text('Failed: ' + state.error.toString()),
//                 RiveLoaded() => RiveWidget(controller: state.controller, fit: BoxFit.contain),
//             },
//         );
//     }
// }`,
//                                 },
//                                 {
//                                         type: 'text',
//                                         content: 'Nested properties can be accessed via chaining or path strings: vmi.number("Parent/Child/Score").',
//                                 },
//                                 {
//                                         type: 'text',
//                                         content: 'For full API details see the Flutter Data Binding docs.',
//                                 }
//                         ]
//                 },
//                 // Text Runs (legacy)
//                 function (data) {
//                         return [
//                                 {
//                                         type: 'text',
//                                         content: 'Legacy text run manipulation (prefer Data Binding for dynamic text).',
//                                 },
//                                 {
//                                         type: 'code',
//                                         language: 'dart',
//                                         content: `import 'package:rive/rive.dart';
// import 'package:flutter/material.dart';

// class TextRunExample extends StatefulWidget {
//     const TextRunExample({super.key});
//     @override
//     State<TextRunExample> createState() => _TextRunExampleState();
// }

// class _TextRunExampleState extends State<TextRunExample> {
//     RiveWidgetController? _controller;
//     String _current = '';

//     @override
//     Widget build(BuildContext context) {
//         return RiveWidgetBuilder(
//             fileLoader: FileLoader.fromAsset('assets/${data.fileName}', riveFactory: Factory.rive),
//             artboardSelector: ${data.activeArtboard ? `ArtboardSelector.byName('${data.activeArtboard}')` : 'ArtboardDefault()'},
//             onLoaded: (state) {
//                 _controller = state.controller;
//                 final artboard = _controller!.artboard;
//                 _current = artboard.getText('MyRun') ?? '';
//                 artboard.setText('MyRun', 'New Text!');
//                 setState(() {});
//             },
//             builder: (context, state) => switch (state) {
//                 RiveLoading() => const Center(child: CircularProgressIndicator()),
//                 RiveFailed() => Text('Failed'),
//                 RiveLoaded() => Column(
//                     children: [
//                         Expanded(child: RiveWidget(controller: state.controller)),
//                         Text('Previous value: ' + _current),
//                     ],
//                 ),
//             },
//         );
//     }
// }`,
//                                 },
//                                 {
//                                         type: 'text',
//                                         content: '*⚠️ DEPRECATED: Use Data Binding instead of direct text run manipulation.*',
//                                 }
//                         ]
//                 },
//                 // Loading referenced / out-of-band assets via assetLoader
//                 function (data) {
//                         return [
//                                 {
//                                         type: 'text',
//                                         content: 'Handle referenced assets dynamically using the File.asset assetLoader callback (fonts/images/audio).',
//                                 },
//                                 {
//                                         type: 'code',
//                                         language: 'dart',
//                                         content: `import 'package:rive/rive.dart';
// import 'package:flutter/material.dart';
// import 'dart:math';
// import 'package:http/http.dart' as http;

// class AssetLoadingExample extends StatefulWidget {
//     const AssetLoadingExample({super.key});
//     @override
//     State<AssetLoadingExample> createState() => _AssetLoadingExampleState();
// }

// class _AssetLoadingExampleState extends State<AssetLoadingExample> {
//     RiveWidgetController? _controller;

//     @override
//     void initState() {
//         super.initState();
//         _loadFile();
//     }

//     Future<void> _loadFile() async {
//         final file = await File.asset(
//             'assets/${data.fileName}',
//             riveFactory: Factory.rive,
//             assetLoader: (asset, bytes) {
//                 // Replace font assets not embedded (bytes == null)
//                 if (asset is FontAsset && bytes == null) {
//                     final urls = [
//                         'https://cdn.rive.app/runtime/flutter/comic-neue.ttf',
//                         'https://cdn.rive.app/runtime/flutter/inter.ttf',
//                     ];
//                     http.get(Uri.parse(urls[Random().nextInt(urls.length)])).then((res) {
//                         asset.decode(Uint8List.view(res.bodyBytes.buffer));
//                         setState(() {});
//                     });
//                     return true; // We handled loading
//                 }
//                 // Let runtime load embedded/hosted assets
//                 return false;
//             },
//         );
//         if (file != null) {
//             final controller = RiveWidgetController(file);
//             setState(() {
//                 _controller = controller;
//             });
//         }
//     }

//     @override
//     void dispose() {
//         _controller?.dispose();
//         super.dispose();
//     }

//     @override
//     Widget build(BuildContext context) {
//         return _controller == null
//                 ? const Center(child: CircularProgressIndicator())
//                 : RiveWidget(controller: _controller!, fit: BoxFit.contain);
//     }
// }`,
//                                 },
//                                 {
//                                         type: 'text',
//                                         content: 'Return true when you handle an asset yourself; false to let the runtime load embedded/hosted assets. See Flutter Loading Assets docs for more.',
//                                 }
//                         ]
//                 },
//     ],
//     apple: [
//         function (data) {
//             return [
//                 {
//                     type: 'code',
//                     language: 'swift',
//                     content: `import RiveRuntime

// class ViewController: UIViewController {
//     @IBOutlet weak var riveView: RiveView!
    
//     override func viewDidLoad() {
//         super.viewDidLoad()
        
//         let riveFile = RiveFile(name: "${data.fileName?.replace('.riv', '') || 'file'}")
//         let artboard = riveFile.artboard(${data.activeArtboard ? `fromName: "${data.activeArtboard}"` : ''})
        
//         riveView.fit = .contain
//         riveView.alignment = .center
//         riveView.viewModel = artboard
//     }
// }`,
//                 },
//             ]
//         },
//     ],
//     android: [
//         function (data) {
//             return [
//                 {
//                     type: 'code',
//                     language: 'kotlin',
//                     content: `import app.rive.runtime.kotlin.RiveAnimationView

// class MainActivity : AppCompatActivity() {
//     override fun onCreate(savedInstanceState: Bundle?) {
//         super.onCreate(savedInstanceState)
        
//         val riveView = findViewById<RiveAnimationView>(R.id.rive_view)
//         riveView.setRiveResource(
//             R.raw.${data.fileName?.replace('.riv', '').replace(/[^a-zA-Z0-9_]/g, '_') || 'file'},
//             ${data.activeArtboard ? `artboardName = "${data.activeArtboard}",` : '// artboardName = "ArtboardName", // Optional'}
//             fit = Fit.CONTAIN,
//             alignment = Alignment.CENTER,
//             autoplay = true
//         )
//     }
// }`,
//                 },
//             ]
//         },
//     ],
//     reactnative: [
//         function (data) {
//             return [
//                 {
//                     type: 'code',
//                     language: 'jsx',
//                     content: `import Rive, { Fit, Alignment } from 'rive-react-native'

// function RiveComponent() {
//   return (
//     <Rive
//       resourceName='${data.fileName?.replace('.riv', '') || 'file'}'
//       ${data.activeArtboard ? `artboardName='${data.activeArtboard}'` : '// artboardName="ArtboardName" // Optional'}
//       fit={Fit.Contain}
//       alignment={Alignment.Center}
//       autoplay={true}
//       style={{ width: '100%', height: 400 }}
//     />
//   )
// }`,
//                 },
//             ]
//         },
//     ],
}

export const CodePreview = () => {
    const context = useInspectorContext()

    return (
        <Tabs
            defaultValue="webjs"
            className="h-[30vh] w-full bg-muted rounded-lg flex flex-col"
            style={{ width: `${context?.size.x ?? 75}%` }}
        >
            <TabsList className="grid w-full grid-cols-6 shrink-0">
                <TabsTrigger value="webjs">Web (JS)</TabsTrigger>
                <TabsTrigger value="react">React</TabsTrigger>
                {/* <TabsTrigger value="flutter">Flutter</TabsTrigger>
                <TabsTrigger value="apple">Apple</TabsTrigger>
                <TabsTrigger value="android">Android</TabsTrigger>
                <TabsTrigger value="reactnative">React Native</TabsTrigger> */}
            </TabsList>
            <TabsContents className="mx-1 mb-1 -mt-2 rounded-sm flex-1 min-h-0 bg-background">
                {Object.entries(snippets).map(([lang, langSnippets]) => (
                    <TabsContent key={lang} value={lang} className="h-full">
                        <ScrollArea className="h-full">
                            <div className="flex flex-col gap-3 p-3 min-w-0 max-w-full">
                                {langSnippets[context?.activeCodeSnippet ?? 0] && (
                                    <>
                                        {langSnippets[context?.activeCodeSnippet ?? 0](context).map((item, index) => {
                                            if (item.type === 'text') {
                                                return (
                                                    <div key={index} className="prose prose-sm dark:prose-invert max-w-none">
                                                        <ReactMarkdown>
                                                            {item.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                )
                                            } else if (item.type === 'code') {
                                                return (
                                                    <CodeBlock
                                                        key={index}
                                                        code={item.content}
                                                        language={item.language}
                                                    // showLineNumbers={true}
                                                    />
                                                )
                                            }
                                            return null
                                        })}
                                    </>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                ))}
            </TabsContents>
        </Tabs>
    )
}
