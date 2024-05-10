#!/usr/bin/env python3
import os

# List of directories to create
directories = [
    'backend_flask',
    'backend_flask/app/classes',
    'backend_flask/app/flatfiles',
    'frontend_react',
    'model',
    'model/export_anomaly',
    'model/data',
    'model/saved_model',
    'mlflow_tracking_server'
]

# Loop through the list and create each directory if it does not already exist
for directory in directories:
    os.makedirs(directory, exist_ok=True)
