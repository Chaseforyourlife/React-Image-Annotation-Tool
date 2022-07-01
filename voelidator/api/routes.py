import json as JSON
from shutil import get_unpack_formats
from flask import make_response, render_template, jsonify,request,make_response
from pymysql import NULL
from voidtools.db.rw import write_df_to_db
from voidtools.bid.react_bid_puller import bidpuller
#from voidtools.
from pandas import read_json
from sqlalchemy import false, null
import pandas as pd
import numpy as np
import datetime


from api import app

import os


from api.static import variables as VARS
from api.static import functions as FUNCS
from api.static import classes as CLASSES

@app.route("/regions")
def regions():
    print("REGIONS")
    data = {"data":[{
        "name": region_name,
        "url": "/regions/" + region_name
    } for region_name in VARS.region_mapping.keys()]}
    return data

@app.route("/regions/<region_name>")
def region(region_name):
    print("BRANDS")
    brand_names = FUNCS.get_brands(region_name)
    data = {"data":[{
        "name": brand_name,
        #"num_annotated":FUNCS.get_num_brand_unannotated(region_name,brand_name,annotated=True),
        #"target_vehicle_count":FUNCS.get_num_brand_map_ids(region_name,brand_name)*VARS.vehicle_count_target,
        #"num_ready_to_annotate":FUNCS.get_num_brand_unannotated(region_name,brand_name)
    } for brand_name in brand_names]}
    return data



@app.route("/regions/<region_name>/stats")
def region_stats(region_name):
    print("BRANDS Stats")
    brand_names = FUNCS.get_brands(region_name)
    data = {"data":[{
        "name": brand_name,
        "num_annotated":FUNCS.get_num_brand_unannotated(region_name,brand_name,annotated=True),
        "target_vehicle_count":FUNCS.get_num_brand_map_ids(region_name,brand_name)*VARS.vehicle_count_target,
        "num_ready_to_annotate":FUNCS.get_num_brand_unannotated(region_name,brand_name)
    } for brand_name in brand_names]}
    return data

@app.route("/regions/<region_name>/<brand_name>")
@app.route("/regions/<region_name>/<brand_name>/<map_id>/bid/stats")
def brand(region_name,brand_name,map_id=None):
    brand_object = CLASSES.Make(region_name,brand_name)
    map_id_list = [map_id] if map_id else brand_object.get_map_ids()
    data = {"data":[{
        "map_id": map_id,
        "model": brand_object.get_model(map_id),
        "num_annotated": brand_object.get_num_annotated(map_id),
        "num_ready_to_annotate": brand_object.get_num_ready_to_annotate(map_id),
        "target_num":VARS.vehicle_count_target
        #"num_stored": brand_object.get_num_stored(region_name,brand_name,map_id),
        #"url": os.path.join("/regions" , region_name , brand_name)
    } for map_id in map_id_list]}
    return data

#Recieves data from bid pull form
@app.route("/regions/<region_name>/<brand_name>/<map_id>/bid/upload_bid_form", methods=['POST'])
def upload_bid_form(region_name,brand_name,map_id):
    form = request.get_json()
    print(form)
    bidpuller(map_id,form['worksiteString'],form['startDate'],form['startDate'])
    return make_response({'hi':'hi'})

@app.route("/regions/<region_name>/<brand_name>/<map_id>/bid/check_emails", methods=['POST'])
def check_emails(region_name,brand_name,map_id):
    form = request.get_json()
    print(form)
    bidpuller(map_id,form['worksiteString'],form['startDate'],form['startDate'])
    return make_response({"emailNum":1,"emailOfNum":2})


@app.route("/regions/<region_name>/<brand_name>/<map_id>/images")
def map_id(region_name,brand_name,map_id):
    data = {"data":[{
        "worksite": image.worksite,
        "capture_time": image.capture_time,
        "image":image.image,
        "position":count%4,
        "index":count//4,
        "undone":0
    } for count,image in enumerate(FUNCS.get_map_id_images(map_id))]}
    return data

@app.route("/regions/<region_name>/<brand_name>/<map_id>/images/undo", methods=['POST'])
def undo(region_name,brand_name,map_id):
    info = request.get_json()
    print(info)
    FUNCS.delete_annotation(info['worksite'],info['capture_time'])
    print("DONEEEEE")
    '''
    print("BRANDS")
    brand_names = FUNCS.get_brands(region_name)
    data = {"data":[{
        "name": brand_name,
        "url": os.path.join("/regions" , region_name , brand_name)
    } for brand_name in brand_names]}
    return data
    '''
    return make_response({"done":1})

@app.route("/regions/<region_name>/<brand_name>/<map_id>/annotate/get_unannotated_images_from_database")
def get_unannotated_images_from_database(region_name,brand_name,map_id):
    worksites,capture_times,FL,FR,RL,RR,md5s_fl,md5s_fr,md5s_rl,md5s_rr = FUNCS.get_unannotated_images_from_database(map_id)
    #TODO: can convert to working with the IMAGE class in CLASSES
    vehicle_class = CLASSES.Make(region_name,brand_name)
    start_year,end_year = vehicle_class.get_start_end_year(map_id)
    data = {"data":
        [{
            "worksite":worksites[i],
            "capture_time":capture_times[i],
            "FL":[FL[i]],
            "FR":[FR[i]],
            "RL":[RL[i]],
            "RR":[RR[i]],
            "MD5_FL":[md5s_fl[i]],
            "MD5_FR":[md5s_fr[i]],
            "MD5_RL":[md5s_rl[i]],
            "MD5_RR":[md5s_rr[i]],
            "annotated": 0,
            "notes":'Good'
        } for i in range(len(worksites))],
        "data_info":{
            "name":""+brand_name +" "+vehicle_class.get_model(map_id)+" "+str(start_year)+"-"+str(end_year)
        }
    }
    
    return data
    
'''
app.route("/regions/<region_name>/<brand_name>/<map_id>/annotate/get_all_image_urls")
def get_all_image_urls(region_name,brand_name,map_id):
    base_path = f'api/static/SHValData/{region_name}/Val_{brand_name}/{map_id}'
    all_vehicle_strings = os.listdir(base_path)
    data={"data":[
        {
            "vehicle_string":vehicle_string,
            "FL":[image_url  for image_url in os.listdir(base_path +'/'+ vehicle_string) if "FrontLeft" in image_url],
            "FR":[image_url  for image_url in os.listdir(base_path +'/'+ vehicle_string) if "FrontRight" in image_url],
            "RL":[image_url for image_url in os.listdir(base_path +'/'+ vehicle_string) if "RearLeft" in image_url],
            "RR":[image_url for image_url in os.listdir(base_path +'/'+ vehicle_string) if "RearRight" in image_url]
        }
    for vehicle_string in all_vehicle_strings]}
    print(data)
    return(data)
'''
@app.route("/regions/<region_name>/<brand_name>/<map_id>/annotate/save", methods=["POST"])
def save_annotations_to_database(region_name,brand_name,map_id):
    print("SAVE FUNCTION ROUTE")
    data = request.get_json()
    print(data[0].keys())


    ##create dataframe
    #make empty list for data that will go into dataframe
    pd_data = list()
    for vehicle in data:
        for location in ['FL','FR','RL','RR']:
            i_md5 = vehicle['MD5_'+location][0]
            i_map_id = map_id if vehicle['notes'] == 'Good' else 0
            i_blame = datetime.datetime.now()
            i_bad_image = 1 if vehicle['notes'] != 'Good' else 0
            i_notes = vehicle['notes'] if vehicle['notes'] != 'Good' else np.nan
            i_alias = f"{brand_name} annotated by React"
            if vehicle['annotated'] == 1:
                pd_data.append([i_md5,i_map_id,i_blame,i_bad_image,i_notes,i_alias])
    frame = pd.DataFrame(pd_data, columns =['md5','map_id','blame','bad_image','notes','alias'])
    print(pd_data)
    print(frame)
  
    #merge dataframe into sql database
    write_df_to_db(frame,{"blame":{"if_row_exists":"update"},"ground_truth_map_id":{"if_row_exists":"update"}})
    print('Data Save')
    return make_response(get_unannotated_images_from_database(region_name,brand_name,map_id))

