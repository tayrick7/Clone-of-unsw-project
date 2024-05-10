#! /bin/bash

# check if there is exisitng gitignore in root project folder
if test -f ./.gitignore; then
    rm .gitignore
fi

touch .gitignore


# folders or files to be ignored by git
gitignore_text=$(echo ".gitignore";
echo "*venv/*"; 

echo "**/__pycache__/*"; 
echo "**/model/data/*"; 
echo "**/mlflow_postgres/*";
echo "**/mlflow_tracking_server/*";
echo "**/frontend-react/node_modules/*";
echo "**/mysql_db/playground/*";
echo "**/model/.ipynb_checkpoints";
echo "**/model/mlruns/*";
echo "**/model/*.png";
echo "**/mlruns/*";
echo "**/backend_flask/app/classes/*";
echo "**/backend_flask/app/flatfiles/*";
echo "**/model/saved_model/*";
echo "**/model/export_anomaly/*";
echo "**/model/result/*";
echo "**/model/chin_notebooks/archive/*";
echo "**/model/chin_notebooks/credit_card_synthetic_data/*";
echo "**/model/chin_notebooks/.ipynb_checkpoints"; 
echo "**/model/chin_notebooks/playground.ipynb"; 
echo "*backend_flask/playground/*"; 
echo "*.project/*";)
echo "$gitignore_text" >> .gitignore