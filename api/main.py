from flask import Flask, make_response
from flask_restful import reqparse, abort, Api, Resource
from pymongo import MongoClient
from flask_cors import CORS

from bson.json_util import loads, dumps

def output_json(obj, code, headers=None):
    """
    This is needed because we need to use a custom JSON converter
    that knows how to translate MongoDB types to JSON.
    """
    resp = make_response(dumps(obj), code)
    resp.headers.extend(headers or {})
 
    return resp

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


DEFAULT_REPRESENTATIONS = {'application/json': output_json}

api= Api(app)
api.representations = DEFAULT_REPRESENTATIONS

client = MongoClient()
db = client.green

class Crops(Resource):
	def get(self):
		crops = db.crops.find()		
		crops = map(lambda x:x, crops)
		return crops


class Valves(Resource):
    def get(self):
        valves = db.valves.find()
        valves = map(lambda x:x, valves)
        return valves



class ValveInfo(Resource):
    def get(self, valve_name):
        valve_info = db.valve_info.find_one({'valve_name': valve_name})
        return valve_info

class ValveInfoList(Resource):
    def get(self):
        valve_infos = []
        valves = map(lambda x:x,  db.valves.find())
        for valve in valves:
            print valve
            valve_info = db.valve_info.find_one({'valve_name': valve['valve_name']})
            valve_infos.append(valve_info)

        return valve_infos


class ValveCropMapping(Resource):
    def post(self,valve_name,crop_type):
       #Get valve and update its crop type. 
       print valve_name
       print crop_type
       db.valve_info.update_one({'valve_name': valve_name}, {'$set':{'crop': crop_type}},upsert=True)
       valve_info = db.valve_info.find_one({'valve_name': valve_name})
       return valve_info


api.add_resource(Crops, '/crops')
api.add_resource(Valves, '/valves')
api.add_resource(ValveInfoList, '/valve_infos')
api.add_resource(ValveInfo, '/valve_info/<string:valve_name>')
api.add_resource(ValveCropMapping, '/valve/<string:valve_name>/crop/<string:crop_type>')


if __name__ == '__main__':
    app.run(debug=True)
