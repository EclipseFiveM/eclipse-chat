local active = false
local session = nil

local function dbg(msg)
    print(('[eclipse-chat] %s'):format(msg))
end

local function safeResourceName(name)
    return (type(name) == 'string' and name ~= '') and name or nil
end

local function closeUI()
    active = false
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)
    SendNUIMessage({ action = 'close' })
end

local function sendNode(nodeId)
    if not session or type(session.nodes) ~= 'table' then return end
    local node = session.nodes[nodeId]
    if not node then
        dbg(('Node not found: %s'):format(tostring(nodeId)))
        return
    end

    SendNUIMessage({
        action = 'render',
        nodeId = nodeId,
        node = node
    })
end

-- Export: open chat
exports('open', function(opts)
    if active then closeUI() end
    if type(opts) ~= 'table' or type(opts.nodes) ~= 'table' then return false end

    local owner = safeResourceName(GetInvokingResource())
    if not owner then
        dbg('open() must be called from another resource.')
        return false
    end

    session = {
        owner = owner,
        nodes = opts.nodes,
        start = opts.start or 'start',
        payload = opts.payload or {}
    }

    active = true
    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(false)

    SendNUIMessage({
        action = 'open',
        payload = session.payload
    })

    sendNode(session.start)
    return true
end)

exports('close', function()
    if not active then return end
    closeUI()
end)

RegisterNUICallback('choose', function(data, cb)
    if not active or not session then cb(false) return end

    local nodeId = tostring(data.nodeId or '')
    local optionIndex = tonumber(data.optionIndex or -1)

    local node = session.nodes[nodeId]
    if not node or type(node.options) ~= 'table' then cb(false) return end

    local opt = node.options[optionIndex]
    if not opt then cb(false) return end

    local shouldClose = opt.close == true or opt.closeOnSelect == true

    if shouldClose then
        closeUI()
    elseif opt.next then
        sendNode(opt.next)
    end

    TriggerEvent(('eclipse-chat:choice:%s'):format(session.owner), {
        nodeId = nodeId,
        optionIndex = optionIndex,
        option = opt,
        closed = shouldClose
    })

    cb(true)
end)

RegisterNUICallback('close', function(_, cb)
    if active then closeUI() end
    if session and session.owner then
        TriggerEvent(('eclipse-chat:closed:%s'):format(session.owner), {})
    end
    cb(true)
end)

AddEventHandler('onResourceStop', function(res)
    if res ~= GetCurrentResourceName() then return end
    if active then closeUI() end
end)
