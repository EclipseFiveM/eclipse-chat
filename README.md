# Eclipse Chat

Eclipse Chat is a reusable branching dialogue NUI for FiveM. It provides a clean, modern chat interface that allows other resources to open interactive conversations with selectable options and event-driven responses. Standalone

---

## Features

- Branching dialogue trees
- Reusable across multiple resources
- Clean NUI interface
- Export-based API
- Event callbacks for player choices
- Custom title, subtitle, and badge support
- Keyboard (ESC) and button close handling

---

## Installation

1. Place the `eclipse-chat` folder in your `resources` directory.
2. Add the resource to `server.cfg`:
3. Restart the server.

---

## Usage

### Opening a Chat

Call the export from another **client-side** resource:

```lua
exports['eclipse-chat']:open({
 start = 'start',
 payload = {
     title = 'Mysterious Dealer',
     subtitle = 'Choose carefully.',
     badge = 'ECLIPSE'
 },
 nodes = {
     start = {
         text = 'Looking for something special?',
         options = {
             {
                 label = 'Show me what you have',
                 desc = 'Browse items',
                 next = 'shop'
             },
             {
                 label = 'Not interested',
                 desc = 'End conversation',
                 close = true
             }
         }
     },

     shop = {
         text = 'Here is what I can offer.',
         options = {
             {
                 label = 'Buy item',
                 desc = 'Proceed with purchase',
                 close = true
             }
         }
     }
 }
})
```

## Node Format
```lua
nodeId = {
    text = 'Dialogue text',
    options = {
        {
            label = 'Option title',
            desc = 'Optional description',
            next = 'anotherNodeId', -- optional
            close = true            -- optional
        }
    }
}
```

## Events

# Choice Selected
```lua
AddEventHandler('eclipse-chat:choice:your_resource', function(data)
    -- data.nodeId
    -- data.optionIndex
    -- data.option
    -- data.closed
end)
```

# Chat Closed
```lua
AddEventHandler('eclipse-chat:closed:your_resource', function()
    -- Called when the UI is closed
end)
```

## Exports
```open(options)```

Opens a new chat session.
Returns true on success, false on failure.

```close()```

Closes the active chat session if one is open.

### Notes

```open()``` must be called from another resource.

Only one chat can be active at a time.

UI automatically closes on resource stop.

Client-side only; handle server logic via emitted events.
