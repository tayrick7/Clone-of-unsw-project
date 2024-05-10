#!/usr/bin/env python3
from flask import Flask, render_template
from flask_cors import CORS
from flask_restx import Api
from datetime import datetime, timezone

from app.user_api import user_api_blueprint as user_bp
from app.mldl_api import mldl_api_blueprint as mldl_bp
from app.pipelines_api import pipelines_api_blueprint as pipeline_bp
from app.dataset_api import dataset_api_blueprint as dataset_bp
from app.anomalies_api import anamolies_api_blueprint as anamolies_bp
from app.extensions import db
from app.db_models.table_classes import create_samples
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy import inspect
from app.db_models.table_classes import MLDLModel
from app.extensions import mlflow
import json



# this is detect mlflow registered model and update backend database.
def scheduled_task():
    with app.app_context():
            for reg_models in mlflow.search_registered_models():
                model_name = reg_models.name
                model_version = reg_models.latest_versions[0].version
                # if app.config['DEBUG']:
                # print("model name = {} , version  = {}".format(model_name, model_version))
                # print(reg_models)

                mldl_model_res = MLDLModel.query.filter_by(model_name=model_name, model_version= model_version).first()
                if not mldl_model_res:
                    features_list = []
                    model_uri = "models:/{}/{}".format(model_name, model_version)
                    model_info = mlflow.models.get_model_info(model_uri)
                    try:
                        data_json = model_info.signature.inputs.to_json()
                        data = json.loads(data_json)
                        for x in data:
                            features_list.append(x['name'])
                        features_list = ', '.join(str(item) for item in features_list)
                    except Exception as e:
                        features_list = 'PCA'

                    mldl_model_res = MLDLModel.query.filter_by(model_name=model_name).first()
                    if mldl_model_res:
                        #   model exists, so, update the model veresion
                        # mldl_model_res.model_version = model_version
                        # model exist, version does not. So, model still has to be added
                        new_MLDL_model = MLDLModel(model_name=model_name, model_version=model_version, model_features_inputs=features_list,  created_timestamp=datetime.now(timezone.utc))
                        db.session.add(new_MLDL_model)
                        db.session.commit()
                        print("ADD MLDL model= {} updated version={}".format(model_name, model_version))
                    else:
                        
                        
                        # add model record to backend database
                        new_MLDL_model = MLDLModel(model_name=model_name, model_version=model_version, model_features_inputs=features_list,  created_timestamp=datetime.now(timezone.utc))
                        db.session.add(new_MLDL_model)
                        db.session.commit()
                        print("new MLDL model= {} added".format(model_name))

                    


app = Flask(__name__)
app.config.from_pyfile("config.py")
CORS(app)

bp_dict = {'user_bp': '/api/',
           'mldl_bp': '/api/model/',
           'pipeline_bp': '/api/pipeline/',
           'dataset_bp': '/api/dataset/',
           'anomalies_bp' : '/api/anomalies'}

app.register_blueprint(user_bp, url_prefix=bp_dict['user_bp'])
app.register_blueprint(mldl_bp, url_prefix=bp_dict['mldl_bp'])
app.register_blueprint(pipeline_bp, url_prefix=bp_dict['pipeline_bp'])
app.register_blueprint(dataset_bp, url_prefix=bp_dict['dataset_bp'])
app.register_blueprint(anamolies_bp, url_prefix=bp_dict['anomalies_bp'])


@app.route('/')
def index_page():
    return render_template('index.html', utc_dt = datetime.now(timezone.utc), bp_dict = bp_dict)


if __name__ == "__main__":
    
    # init the db extension
    db.init_app(app)

    # scheduler - check mlflow registered model
    scheduler = BackgroundScheduler()
    scheduler.add_job(scheduled_task, 'interval', seconds=5)
    scheduler.start()

    with app.app_context():
        # Create an inspector object
        inspector = inspect(db.engine)

        # Check if a table exists
        table_name = 'credentials'
        table_exists = inspector.has_table(table_name)

        if not table_exists:
            db.create_all()
            create_samples()

    app.run(host="0.0.0.0", port=8000, debug=True)
