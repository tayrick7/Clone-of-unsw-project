#!/usr/bin/env python3
import subprocess
import os

def is_process_running(process_name):
    try:
        completed = subprocess.run(['tasklist', '/FI', f'IMAGENAME eq {process_name}.exe'], check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError:
        return False



process_init_files = ".\\bash\\cp_features_creation.py"
process_init_folders = ".\\bash\\create_skeleton_folder.py"

processes_list = []
processes_list.append(process_init_files)
processes_list.append(process_init_folders)


for proc_name in processes_list:
    if is_process_running(proc_name):
        print('The script {} is already running.'.format(proc_name))
    else:
        subprocess.Popen(['python', proc_name])
        print('Running script {}.'.format(proc_name))

process_backend = ".\\backend_flask\\main.py"

os.system(f'python {process_backend}')
