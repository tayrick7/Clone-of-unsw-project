#!/usr/bin/env python3
import subprocess
import os
import sys
import shutil


# Define the paths
transactions_df_file = './model/data/transactions_df.csv'
customer_df_file = './model/data/customer_profiles_table.csv'
terminal_df_file = './model/data/terminal_profiles_table.csv'
# Check if the file does not exist
if not os.path.isfile(transactions_df_file) or not os.path.isfile(customer_df_file) or not os.path.isfile(terminal_df_file):
    print("Dataset not found at ./model/data")
    print("Please download dataset at: https://www.kaggle.com/datasets/cgrodrigues/credit-card-transactions-synthetic-data-generation/data?select=transactions_df.csv")
    print("Put dataset at folder: ./model/data")
    sys.exit()


dest_terminal_df_file = './backend_flask/app/flatfiles/terminal_profiles_table.csv'
dest_customer_df_file = './backend_flask/app/flatfiles/customer_profiles_table.csv'
# Check if the file does not exist
if not os.path.isfile(dest_terminal_df_file):
    print("Copying ML feature creation function files....")
    # Copy the files
    shutil.copy(customer_df_file, dest_customer_df_file)
    shutil.copy(terminal_df_file, dest_terminal_df_file)

def is_process_running(process_name):
    try:
        # Run pgrep and check process name
        subprocess.run(['pgrep', '-f', process_name], check=True)
        return True  # pgrep will exit with 0 if it found the process
    except subprocess.CalledProcessError:
        return False  # pgrep did not find the process, so exit code will be non-zero

process_init_files = "./bash/cp_features_creation.py"
process_init_folders = "./bash/create_skeleton_folder.py"

processes_list = []
processes_list.append(process_init_files)
processes_list.append(process_init_folders)

# Usage
for proc_name in processes_list:
    if is_process_running(proc_name):
        print('The script {} is already running.'.format(proc_name))
    else:
        subprocess.Popen([proc_name])
        print('Running script {}.'.format(proc_name))

# Path to the script to be executed
process_backend = "./backend_flask/main.py"

# Execute the script
os.system(f'python3 {process_backend}')
