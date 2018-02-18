import paho.mqtt.client as mqtt
import logging
import json
import time
from pymongo import MongoClient

logger = logging.getLogger('soilmanager_backend')
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

m = MongoClient()
db= m.green

logger.info('Starting soilmanager_backend...')

mqtt_host = '198.58.96.40'
mqtt_port = 8880
username = 'teamrocket'
password = 'blastoff'

soil_info_topic = 'soilmanager/soil_info'


valves = {
}


def get_valve_info(valve_name):
    valve_info = db.valve_info.find_one({'valve_name': valve_name})
    return valve_info

def get_required_moisture_level(crop_type):
    crop = db.crops.find_one({'name': crop_type})
    return crop['moisture_level']

def get_interval(crop_type):
    crop = db.crops.find_one({'name': crop_type})
    return crop['interval']


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
        print soil_info
        valve_name = soil_info['valve']
        valve_info = get_valve_info(valve_name)
        interval = get_interval(valve_info['crop'])

        valve_info['ph_level'] = soil_info['ph_level']
        valve_info['moisture_level'] = soil_info['moisture_level']
        current_time = int(time.time())
        valve_info['last_updated'] = current_time = current_time

        if 'status' not in valve_info:
            valve_info['status'] = 'off'

        if 'last_time' not in valve_info:
            valve_info['last_on'] = 0

        required_moisture_level = get_required_moisture_level(valve_info['crop'])
        current_moisture_level =float(valve_info['moisture_level'])
        last_on = valve_info['last_on']

        if valve_info['status'] == 'on' and required_moisture_level <= current_moisture_level:
            valve_info['status'] = 'off'
            logger.info('Turning valve off!')
            client.publish('soilmanager/%s/control' % valve_name, payload="off")


        if valve_info['status'] == 'off' and current_moisture_level < required_moisture_level and last_on + interval <= current_time:
            valve_info['status'] = 'on'
            logger.info('Turning valve on!')
            client.publish('soilmanager/%s/control' % valve_name, payload="on")


        db.valve_info.save(valve_info)    

    else:
        logger.warning('Unhandled topic!', extra=msg)

logger.info('Connecting to MQTT server @ %s:%d' , mqtt_host, mqtt_port)

client = mqtt.Client()
client.username_pw_set(username, password)

client.on_connect = on_connect
client.on_message = on_message

client.connect(mqtt_host, mqtt_port)


client.loop_forever()


