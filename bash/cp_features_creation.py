#!/usr/bin/env python3
import os
import shutil


# Define the paths
source_feature_engineer = './model/Feature_engineer.py'
source_feature_engineer2 = './model/chin_notebooks/Feature_engineer2.py'
source_autoencoder_util = './model/AutoEncoder_util.py'
source_reject_anomalies = './model/reject_anomalies.py'
source_data_preprocessing_method = './model/Data_preprocessing_method.py'
source_result_display = './model/result_display.py'
dest_feature_engineer = './backend_flask/app/classes/Feature_engineer.py'
dest_feature_engineer2 = './backend_flask/app/classes/Feature_engineer2.py'
dest_autoencoder_util = './backend_flask/app/classes/AutoEncoder_util.py'
dest_reject_anomalies = './backend_flask/app/classes/reject_anomalies.py'
dest_data_preprocessing_method = './backend_flask/app/classes/Data_preprocessing_method.py'
dest_result_display = './backend_flask/app/classes/result_display.py'

# Check if the file does not exist
if os.path.isfile(source_feature_engineer):
    print("Copying ML feature creation function files....")
    # Copy the files
    shutil.copy(source_feature_engineer, dest_feature_engineer)
    shutil.copy(source_feature_engineer2, dest_feature_engineer2)
    shutil.copy(source_autoencoder_util, dest_autoencoder_util)
    shutil.copy(source_reject_anomalies, dest_reject_anomalies)
    shutil.copy(source_data_preprocessing_method, dest_data_preprocessing_method)
    shutil.copy(source_result_display, dest_result_display)



