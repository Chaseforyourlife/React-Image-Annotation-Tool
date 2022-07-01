
from msilib.schema import Error

from sqlalchemy import false
from api.static import variables as VARS
from api.static import classes as CLASSES
from voidtools.db.rw import read_to_df,send_sql
import pandas as pd
from voidtools.bid.constants import ENDPOINT_URL, SECRET_KEY, ACCESS_KEY
from voidtools.MMIC.annotation_sheet import verify_dvc_remote
import PIL
import logging
import boto3
import io
import numpy as np
import base64
import os

#VARIABLES#
logger = logging.getLogger(__name__)

def delete_annotation(worksite,capture_time):
    send_sql(f'''delete from ground_truth_map_id where ground_truth_map_id.md5 in
    (select ground_truth_map_id.md5 from ground_truth_map_id 
    join hec_image on ground_truth_map_id.md5 = hec_image.md5 
    join qcd_run on qcd_run.worksite=hec_image.worksite and qcd_run.capture_time=hec_image.capture_time
    Where qcd_run.worksite = '{worksite}' AND qcd_run.capture_time = '{capture_time}');''')
    return

def get_brands(region_name):
    #get region map number
    map_number = VARS.region_mapping[region_name]
    #set sql command
    sql_command = f'''SELECT DISTINCT make FROM specification 
    WHERE map_id >= {map_number}00000 AND map_id < {map_number+1}00000'''
    #get df from sql database
    brands_frame = read_to_df(sql_command)
    return brands_frame['make'].values.tolist()

#rebuild is always the name
def get_md5_image_list(md5_list,dvc_remote_name="rebuild"):
    print("GET_MD5_IMAGE_LIST")
    #create empty image_list
    image_list = list()
    logger.info(f"Starting to extract images for {md5_list[:5]}...")
    
    dvc_remote = verify_dvc_remote(dvc_remote_name)
    print("dvc_remote:",dvc_remote)
    s3_client = boto3.resource(
        "s3",
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        endpoint_url=ENDPOINT_URL,
    )
    for md5 in md5_list:
        image_path = "/".join([dvc_remote.replace("s3://remotes/",""), md5[:2], md5[2:]])
        bucket = s3_client.Bucket(name='remotes')
        bucket_object = bucket.Object(image_path)
        file_stream = io.BytesIO()
        '''
        print("bucket_object: ",bucket_object)
        print("file_stream:",file_stream)
        print("image_path:",image_path)
        print("bucket:",bucket)
        print("file_stream.getvalues():",file_stream.getvalue())
        '''
        bucket_object.download_fileobj(file_stream)
        base64Image = base64.b64encode(file_stream.getvalue()).decode()
        #bytes_object = io.BytesIO(file_stream.getvalue())
        #print(bytes_object)
        
        image_list.append(base64Image)
    return image_list

def get_map_id_images(map_id,show_bad=false):
    #make empty list to fill with Image Objects
    all_Images = list()
    ##Get dataframe of annotated images for particular map_id
    #if show_bad is false
    if not show_bad:
        frame = read_to_df(f'''SELECT DISTINCT hec_image.md5, hec_image.cam_view, qcd_run.worksite,qcd_run.capture_time,ground_truth_map_id.map_id,ground_truth_map_id.bad_image,specification.make
        FROM qcd_run 
        JOIN hec_image 
        ON qcd_run.worksite = hec_image.worksite
        AND qcd_run.capture_time = hec_image.capture_time
        JOIN ground_truth_map_id
        ON hec_image.md5 = ground_truth_map_id.md5
        JOIN specification
        ON ground_truth_map_id.map_id = specification.map_id
        WHERE specification.map_id = {map_id}
        AND ground_truth_map_id.bad_image = 0
        ORDER BY worksite,capture_time,cam_view''')
    #if show_bad is true
    else:
        frame = read_to_df(f'''SELECT DISTINCT hec_image.md5, hec_image.cam_view,qcd_run.worksite,qcd_run.capture_time,ground_truth_map_id.map_id,ground_truth_map_id.bad_image,specification.make
        FROM qcd_run 
        JOIN hec_image 
        ON qcd_run.worksite = hec_image.worksite
        AND qcd_run.capture_time = hec_image.capture_time
        JOIN ground_truth_map_id
        ON hec_image.md5 = ground_truth_map_id.md5
        JOIN specification
        ON ground_truth_map_id.map_id = specification.map_id
        WHERE specification.map_id = {map_id}
        ORDER BY worksite,capture_time,cam_view''')
    

    #get list of md5s
    worksite_list = frame['worksite']
    capture_time_list = frame['capture_time']
    md5_list = frame['md5'].values.tolist()
    image_list = get_md5_image_list(md5_list)
    for count,image in enumerate(image_list):
        temp_image = CLASSES.Image(image,worksite_list[count],capture_time_list[count])
        all_Images.append(temp_image)
    return all_Images

'''
def get_local_map_id_images(region_name,brand_name,map_id):
    dir_path = f'api/static/SHValData/{region_name}/Val_{brand_name.replace(" ","")}/{map_id}'
    #check if map_id folder exists
    if os.path.isdir(dir_path):
        return len(os.listdir(dir_path))
    #if map_id folder doesn't exist, create the folder
    else:
        os.mkdir(dir_path)
'''
def get_unannotated_images_from_database(map_id):
    base_sql_command = f'''SELECT DISTINCT hec_image.cam_view, hec_image.md5,qcd_run.worksite,qcd_run.capture_time,customer_map_id.map_id
            FROM qcd_run
            JOIN customer_map_id
            ON qcd_run.capture_time = customer_map_id.capture_time
            AND qcd_run.worksite = customer_map_id.worksite
            JOIN hec_image
            ON qcd_run.capture_time = hec_image.capture_time
            AND qcd_run.worksite = hec_image.worksite
            LEFT JOIN ground_truth_map_id
            ON hec_image.md5 = ground_truth_map_id.md5
            WHERE ground_truth_map_id.md5 IS NULL
            AND customer_map_id.map_id = {map_id}
            '''
    #TODO: SWITCH TO PANDAS COMMANDS
    worksites = read_to_df(base_sql_command + '\n AND hec_image.cam_view = \'FL\' ORDER BY worksite,capture_time')['worksite'].values.tolist()
    capture_times = read_to_df(base_sql_command + '\n AND hec_image.cam_view = \'FL\' ORDER BY worksite,capture_time')['capture_time'].values.tolist()
    md5s_fl = read_to_df(base_sql_command + '\nAND hec_image.cam_view = \'FL\' ORDER BY worksite,capture_time')['md5'].values.tolist()
    md5s_fr = read_to_df(base_sql_command + '\nAND hec_image.cam_view = \'FR\' ORDER BY worksite,capture_time')['md5'].values.tolist()
    md5s_rl = read_to_df(base_sql_command + '\nAND hec_image.cam_view = \'RL\' ORDER BY worksite,capture_time')['md5'].values.tolist()
    md5s_rr = read_to_df(base_sql_command + '\nAND hec_image.cam_view = \'RR\' ORDER BY worksite,capture_time')['md5'].values.tolist()
    md5_fl = get_md5_image_list(md5s_fl)
    md5_fr = get_md5_image_list(md5s_fr)
    md5_rl = get_md5_image_list(md5s_rl)
    md5_rr = get_md5_image_list(md5s_rr)
    if(not(len(md5_fl) == len(md5_fr) == len(md5_rl) == len(md5_rr))):
        raise(Error('PROBLEM'))
    return (worksites,capture_times,md5_fl,md5_fr,md5_rl,md5_rr,md5s_fl,md5s_fr,md5s_rl,md5s_rr)

#gives option of getting num_brand_annotated by specifying annotated = True
def get_num_brand_unannotated(region_name,brand_name,annotated=False):
    map_number = VARS.region_mapping[region_name]
    base_sql_command = f'''
        SELECT COUNT(*) FROM
        (SELECT DISTINCT qcd_run.worksite,qcd_run.capture_time,customer_map_id.map_id,specification.make
        FROM qcd_run
        JOIN customer_map_id
        ON qcd_run.capture_time = customer_map_id.capture_time
        AND qcd_run.worksite = customer_map_id.worksite
        JOIN hec_image
        ON qcd_run.capture_time = hec_image.capture_time
        AND qcd_run.worksite = hec_image.worksite
        JOIN specification
        ON specification.map_id = customer_map_id.map_id
        LEFT JOIN ground_truth_map_id
        ON hec_image.md5 = ground_truth_map_id.md5
        WHERE ground_truth_map_id.md5 IS {'NULL' if annotated == False else 'NOT NULL'}
        AND specification.make = '{brand_name}'
        AND specification.map_id >= {map_number}00000 
        AND specification.map_id < {map_number+1}00000) q'''
    frame = read_to_df(base_sql_command)
    return int(frame.loc[0])

def get_num_brand_map_ids(region_name,brand_name):
    map_number = VARS.region_mapping[region_name]
    sql_command = (f'''SELECT COUNT(*) FROM
        (SELECT DISTINCT map_id 
        FROM specification
        WHERE make = '{brand_name}' 
        AND map_id >= {map_number}00000 
        AND map_id <  {map_number+1}00000) q''')
    count = int(read_to_df(sql_command).loc[0])
    return count

    