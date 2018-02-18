cfg={}
cfg.ssid="Agri-Hackathon"
cfg.pwd="wifipassword1"
wifi.ap.config(cfg)
startup_cfg = {}
netname_cfg = ''
netpass_cfg = ''

function unescape (s)
    if (s == nil) then
        return s
    end
    
    s = string.gsub(s, "+", " ")
    s = string.gsub(s, "%%(%x%x)", function (h)
        return string.char(tonumber(h, 16))
      end)
    return s
end

srv=net.createServer(net.TCP)
srv:listen(80,function(conn)
    conn:on("receive", function(sck,request)
   
        local buf = '';
        local _, _, method, path, vars = string.find(request, "([A-Z]+) (.+)?(.+) HTTP");
        
        if(method == nil)then
            _, _, method, path = string.find(request, "([A-Z]+) (.+) HTTP");
        end
        
        local _GET = {}

        vars = (vars ~= nil and vars or "")
        if (vars ~= nil) then
            for pair in string.gmatch(vars, "([^&]+)") do
                local i, j, key = string.find(pair, "([^=]+)")
                local x, y, value = string.find(pair, "=([^&]+)")
                _GET[unescape(key)] = unescape(value)
                print(value)
            end
        end
        
        local _on,_off = "",""

        local netname = _GET.networkName
        local netpass = _GET.networkPassword or ""

        startup_cfg["SSID"]=netname
        startup_cfg["SSID_pass"]=netpass
        
        requestFile = ''
        --print(request)
        if (netname ~= nil) then
            local json_cfg = sjson.encode(startup_cfg)
            file.open("config", "w+")
                file.write(json_cfg)
            file.close()
            client:send('<html>OK<script>window.setTimeout( function(){window.location = "/"; }, 2500 );</script></html>')
        else    
            if file.exists("config") then
                local stored_cfg = ''
                file.open("config", "r")
                    stored_cfg = sjson.decode(file.read())
                file.close()
                netname_cfg = stored_cfg["SSID"]
                netpass_cfg = stored_cfg["SSID_pass"]
                print(netname_cfg)
            end
            filePos=0;            
            requestFile = "network_setup.html"
            conn:send("HTTP/1.1 200 OK\r\nContent-Type: ".."text/html".."\r\n\r\n");         
        end
    end)
    conn:on("sent",function(conn)
        print("in Sent")
        if requestFile == "network_setup.html" then
            print("in reqFile")
            if file.open(requestFile,r) then
                file.seek("set",filePos);
                local partial_data=file.read(512);
                file.close();
                
                if partial_data then
                    filePos=filePos+#partial_data;
                    print("["..filePos.." bytes sent]");
                    partial_temp = partial_data
                    partial_temp = string.gsub(partial_temp, "{{networkName}}", netname_cfg)
                    partial_temp = string.gsub(partial_temp, "{{networkPassword}}", netpass_cfg)
                    conn:send(partial_temp);
                    if (string.len(partial_data)==512) then
                        return;
                    end
                   
                end
            else
                print("[Error opening file"..requestFile.."]");
            end
        end
        print("[Connection closed]");
        conn:close();
        collectgarbage();
    end)
end)
