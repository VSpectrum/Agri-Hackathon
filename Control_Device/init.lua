if file.exists("config") then
    wifi.setmode( wifi.STATION )
    wifi.setphymode( wifi.PHYMODE_N )
    print("Node Mode")
    collectgarbage()
    dofile('main.lua')
else
    wifi.setmode(wifi.SOFTAP)
    print("Server Mode - lack of config file")
    
    dofile('server.lua')
end
