import paho.mqtt.client as mqtt
import logging
import json
import time

logger = logging.getLogger('soilmanager_backend')
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


logger.info('Starting soilmanager_backend...')

mqtt_host = '198.58.96.40'
mqtt_port = 8880
username = 'teamrocket'
password = 'blastoff'

soil_info_topic = 'soilmanager/soil_info'


valves = {
}


def on_connect(client, userdata, flags, rc):
    logger.info('Connected to mqtt server on %s:%d\n', mqtt_host, mqtt_port)
    #Need to subscribe to topic for ph value and moisture.
    logger.info('Subscribing to topic: %s\n', soil_info_topic)
    client.subscribe(soil_info_topic)

def on_disconnect(client, userdata, rc):
    logger.warning('Disconnected from mqtt server on %s:%d\n', mqtt_host, mqtt_port)

def on_message(client, userdata, msg):
    if msg.topic == soil_info_topic:

        soil_info = json.loads(msg.payload)
        v = soil_info['valve']
        if v not in valves:
            valves[v] = {
                "last": int(time.time())
            }
            

        valves[v].ph_level = soil_info['ph_level']
        valves[v].moisture_level = soil_info['moisture_level']
        current_time = int(time.time())

        #If valve k is on and required_moisture_level <= current_moisture_level:
           #turn valve k off

        #If valve k is off and current_moisture_level < required_moisture_level and last_time + interval <= current_time:
           #last_time = current_time
           #turn valve k on

    else:
        logger.warning('Unhandled topic!', extra=msg)

logger.info('Connecting to MQTT server @ %s:%d' , mqtt_host, mqtt_port)

client = mqtt.Client()
client.username_pw_set(username, password)

client.on_connect = on_connect

client.connect(mqtt_host, mqtt_port)


client.loop_forever()


