
from api.static import variables as VARS
from voidtools.db.rw import read_to_df

class Image():
    def __init__(self,image,worksite=None,capture_time=None,md5=None,image_name=None):
        self.image = image
        self.worksite = worksite
        self.capture_time = capture_time
        self.md5 = md5
        self.image_name = image_name

        

    def get_worksite(self):
        self.worksite = None

    