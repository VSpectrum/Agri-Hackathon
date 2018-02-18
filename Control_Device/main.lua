---
do
    local A1 = 6
    local A2 = 7
    local B1 = 8
    local B2 = 2

    local mqtt_online = false 
    local last_interrupt = tmr.now()
    reconnection_count = 0
    net.dns.setdnsserver("8.8.8.8", 0) --google first dns--
    net.dns.setdnsserver("8.8.4.4", 1) --google 2nd dns--


    raw_conf, conf = '', ''
    file.open("config", "r+")
        raw_conf = file.read()
        conf = sjson.decode(raw_conf)
    file.close()

    station_cfg={}
    station_cfg.ssid=conf["SSID"]
    station_cfg.pwd=conf["SSID_pass"]

    wifi.sta.config(station_cfg)
    wifi.sta.connect()
    
    filler = "abcdefghijklmnopqrstuvwxyz1234567890-_"


    mq = mqtt.Client("Unit1", 6, "teamrocket", "blastoff")
    mq:lwt("soilmanager/Unit1/".."status", "OFFLINE",0,0)
    mq:on("connect", function(client) 
        mqtt_online = true
        mq:publish("soilmanager/Unit1/".."status", "ONLINE",0,0)

        mq:subscribe("soilmanager/Unit1/control",0, function(conn) 
            print("subscribed") 
        end)
    end)
    mq:on("offline", function(client) 
        mqtt_online = false
    end)
    mq:on("message", function(client, topic, data)
        if (topic == 'soilmanager/Unit1/control') then     
            if (data ~= nil) then
                switec.setup(0, 6, 7, 8, 2, 1000)
                switec.moveto(0, 1500, function ()
                    switec.moveto(0, 0)
                end)
            end
        end
    end)
    mq:connect("198.58.96.40","8880",0,0)


    tmr.alarm(3, 12000, tmr.ALARM_AUTO, function ()
        if ( wifi.sta.status() ~= 5) then
            if (reconnection_count < 3) then
                print("If device cannot connect to WiFi, delete config and re-enter Hotspot credentials.")
                print("This config file will auto delete after 5 reconnection attempts (~90 seconds)")
                reconnection_count = reconnection_count + 1
            else
                file.remove("config")
                print("deleted config file")
                node.restart()
            end
        elseif (wifi.sta.status() == 5) then
            gpio.write(3, gpio.HIGH)
            gpio.write(4, gpio.LOW)
            reconnection_count = 0
            
            if ( mqtt_online==false ) then
                mq:connect("198.58.96.40","8880",0,0)
            else
                local diff = 0.16+math.floor( math.random()*100 + 0.5 ) / 100  
                local soil_info = '{'..'"Valve":"K", "Moisture_Level":"'..diff..'", "pH_Level":"5.5"}'
                mq:publish("soilmanager/soil_info", soil_info,0,0)
            end
        end
    end)
  
end
