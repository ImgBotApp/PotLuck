from pymongo import MongoClient
import urllib.parse
from bson import ObjectId
from gridfs import GridFS
from os import walk
import pprint

mongo_uri = ""
username = ""
password = ""
domain = 0

with open('../../Web_App/.env', 'r') as recipe_image_list:
    parsedLine = recipe_image_list.readline().strip().split('=')
    if (parsedLine[0] == "MONGODB_URI"):
        mongo_uri = parsedLine[1]
        username_split = mongo_uri.split('//')[1].split(":")
        username = username_split[0]
        password_split = username_split[1].split('@')
        password = password_split[0]
        domain = password_split[1]

        username = urllib.parse.quote_plus(username)
        password = urllib.parse.quote_plus(password)

client = MongoClient('mongodb://%s:%s@%s/PotLuck' % (username, password, domain))

PotLuck_DB = client.PotLuck

recipes_coll = PotLuck_DB.recipes

fs = GridFS(PotLuck_DB)

recipe_image_list = []

for (dirpath, dirnames, filename) in walk('resized_images_true'):
    recipe_image_list.extend(filename)
    break


