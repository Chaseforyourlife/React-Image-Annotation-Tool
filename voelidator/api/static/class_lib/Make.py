#from api.static import functions as FUNCS
from api.static import variables as VARS
from voidtools.db.rw import read_to_df
import os

class Make():
    def __init__(self,region_name,brand_name):
        self.brand_name = brand_name
        self.region_name = region_name
        self.map_number = VARS.region_mapping[region_name]

    def get_map_ids(self):
        temp_frame = read_to_df(f'''SELECT DISTINCT map_id 
        FROM specification
        WHERE make = '{self.brand_name}' 
        AND map_id >= {self.map_number}00000 
        AND map_id <  {self.map_number+1}00000
        ORDER BY map_id ASC''')
        return temp_frame['map_id'].values.tolist()

    def get_num_annotated(self,map_id):
        return len(read_to_df(f'''SELECT DISTINCT qcd_run.worksite,qcd_run.capture_time,ground_truth_map_id.map_id,ground_truth_map_id.bad_image,specification.make
        FROM qcd_run 
        JOIN hec_image 
        ON qcd_run.worksite = hec_image.worksite
        AND qcd_run.capture_time = hec_image.capture_time
        JOIN ground_truth_map_id
        ON hec_image.md5 = ground_truth_map_id.md5
        JOIN specification
        ON ground_truth_map_id.map_id = specification.map_id
        WHERE specification.map_id = {map_id}
        AND ground_truth_map_id.bad_image = 0'''))
    
    def get_num_stored(self,region_name,brand_name,map_id):
        brand_name = brand_name.replace(' ','')
        dir_path = f'api/static/SHValData/{region_name}/Val_{brand_name}/{map_id}'
        #check if map_id folder exists
        if os.path.isdir(dir_path):
            return len(os.listdir(dir_path))
        #if map_id folder doesn't exist, create the folder
        else:
            os.mkdir(dir_path)
            return 0

    def get_num_ready_to_annotate(self,map_id):
        return len(read_to_df(f'''SELECT DISTINCT qcd_run.worksite,qcd_run.capture_time,customer_map_id.map_id
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
            AND customer_map_id.map_id = {map_id}'''))
    
        

    def get_model(self,map_id):
        return read_to_df(f'''SELECT map_id,model FROM specification
            WHERE map_id = {map_id}''')['model'][0]

    def get_start_end_year(self,map_id):
        frame = read_to_df(f'''SELECT start_year,end_year FROM specification
            WHERE map_id = {map_id}''')
        return frame['start_year'][0],frame['end_year'][0]