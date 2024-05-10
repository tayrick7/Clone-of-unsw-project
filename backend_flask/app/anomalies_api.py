from flask import Blueprint, current_app
from flask_restx import Api, Resource, fields
import pandas as pd
from flask import request
from datetime import datetime, timezone
from sqlalchemy import text
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

from app.db_models.table_classes import MLDLModel, UserDataset, AnomalyLog, Anomaly, Credentials, ActiveSession
from app.extensions import db
from app.extensions import mlflow
from app.mldl_classes import ModelPipelineCls, FeaturesType
import json
from flask import jsonify
import os
from werkzeug.datastructures import FileStorage
from pathlib import Path

from sqlalchemy import MetaData, Column, Integer, Float, String, Table, text
from sqlalchemy.dialects.mysql import TINYINT



anamolies_api_blueprint = Blueprint('anomalies_api', __name__)
api = Api(anamolies_api_blueprint, doc='/')

### ML DL Model
anamolies_namespace = api.namespace('', description='Test Model for Anomalies')

ML_Test_Data= api.model('ML_Test_Data', {
    'model_name': fields.String(required=True, description='ML DL model name'),
    'model_version': fields.Integer(required=True, description='ML DL model version'),
    'stored_tablename': fields.String(required=True, description='dataset name'),
    'input_threshold': fields.Float(required=False, description='threshold for detection. Eg: 15 for Isolation Forest, 1.3 for Autoencoder')
})

# Anomaly_Log_Data = api.model('Anomaly_Log', {
#     'user_id': fields.Integer(required=True, description='User ID')
# })

Anomalies_Data = api.model('Anomalies_Data', {
    'anomaly_log_id': fields.Integer(required=True, description='Anomaly Log ID')
})


# item_model = api.model('Item', {
#     'label': fields.String(required=True, description='Data processing task'),
#     'checked': fields.Boolean(required=True, description='is task checked?')
# })

# data_preprocessing_model = api.model('DataPreprocessing_checklist', {
#     'items': fields.List(fields.Nested(item_model), required=True, description='List of data preprocessing tasks', example=[
#         {'label': 'drop_duplicate', 'checked': True},
#         {'label': 'pca', 'checked': False},
#         {'label': 'fill_na', 'checked': True}
#     ])
# })

upload_parser = api.parser()
#upload_parser.add_argument('email', type=str, required=True)
upload_parser.add_argument('Session-Token', location='headers', help='Session Token', required=True)
upload_parser.add_argument('file', location='files',
                           type=FileStorage, required=True)


def get_user_from_session(session_token):
    active_session = ActiveSession.query.filter_by(session_token=session_token).first()
    if active_session:
        return active_session.user_id
    else:
        return None

auth_parser = api.parser()
auth_parser.add_argument('Session-Token', location='headers', help='Session Token', required=True)

@anamolies_namespace.route('/test_model_with_dataset')
class TestModel(Resource):
    @anamolies_namespace.expect(ML_Test_Data, auth_parser)
    def post(self):
        try :
            is_PCA = False
            data = request.get_json()
            model_name = data.get('model_name')
            model_version = data.get('model_version')
            input_threshold = data.get('input_threshold')
            # email = data.get('email')
            session_token = request.headers.get('Session-Token')
            user = get_user_from_session(session_token)
            if not user:
                return {'error': 'User not authenticated'}, 401
            stored_tablename = data.get('stored_tablename')
            
            mldlmodel_result = MLDLModel.query.filter_by(model_name=model_name, model_version=model_version).first()
            if not mldlmodel_result:
                return {"error": "Model does not exist in database"}, 400

            # model uri for the above model
            model_uri = "models:/{}/{}".format(model_name, model_version)
            
            # Load the model and access the custom metadata
            # loaded_model = mlflow.pyfunc.load_model(model_uri=model_uri)
            loaded_model = None
            try:
                loaded_model = mlflow.sklearn.load_model(model_uri)
            except Exception as e:
                loaded_model = mlflow.tensorflow.load_model(model_uri)
            
            if not loaded_model:
                return {"error": "Model does not exist in MLFLOW"}, 400

            has_dataset = UserDataset.query.filter_by(stored_tablename=stored_tablename).first()
            if not has_dataset:
                return {'error': 'table not found'}, 404
            model_pipeline_cls = ModelPipelineCls(None)
            select_query = text("SELECT * FROM " + stored_tablename)
            ids = []
            y_test = None
            PCA_components = None
            with db.engine.begin() as conn:
                result = pd.read_sql_query(select_query, conn)
                ids = result['id'].values
                result.drop('id', axis=1, inplace=True)
                model_pipeline_cls.transactions_df = result
                input_len = None
                try:
                    model_info = mlflow.models.get_model_info(model_uri)
                    mlflow_run = mlflow.get_run(model_info.run_id)
                    for k in mlflow_run.data.params.keys():
                        if k == 'PCA_sample':
                            print("PCA model selected!!")
                            PCA_components = int(mlflow_run.data.params[k])
                            is_PCA = True
                    input_len = len(model_info.signature.inputs.to_dict())
                except Exception as e:
                    pass

                if input_len == 9:
                    y_test = model_pipeline_cls.generate_additional_features(FeaturesType.features_type_2)
                else:
                    y_test = model_pipeline_cls.generate_additional_features(FeaturesType.features_type_1)
              
            predictions = model_pipeline_cls.perform_ml_test_pipeline(loaded_model, model_name, is_PCA=is_PCA, input_threshold=input_threshold, PCA_components=PCA_components)
            # predictions = loaded_model.predict(model_pipeline_cls.join_df)


            # Find indices of the specific value
            indices = []
            indices = [ids[index] for index, element in enumerate(predictions) if element == 1]

            indices_dict = {}

            # Store indices in the dictionary if the value is found
            if indices:
                indices_dict[1] = indices

            # predictions = predictions == 1
            report = classification_report(y_test, predictions, output_dict=True)
            report['input_threshold'] = input_threshold
            print("report {}".format(report))
            report = json.dumps(report)

            anomaly_log1 = AnomalyLog(user_dataset_id_fk=has_dataset.user_dataset_id, user_id_fk=user, model_id_fk=mldlmodel_result.model_id, anomaly_log_results=report, created_timestamp= datetime.now(timezone.utc))
            db.session.add(anomaly_log1)
            db.session.commit()
            for id in indices:
                anomaly_instance = Anomaly(anomaly_log_id_fk=anomaly_log1.anomaly_log_id, anomaly_instances_ids=id)
                db.session.add(anomaly_instance)
            db.session.commit()

            return {'message': 'all workflow completes', 'anomaly_log_id': anomaly_log1.anomaly_log_id }, 200
        
        except Exception as e:
            return {'error': str(e)}, 500

@anamolies_namespace.route('/get_anomaly_logs')
class AnomalyLogModel(Resource):
    @anamolies_namespace.expect(auth_parser)
    def post(self):
        try :
            # data = request.get_json()
            session_token = request.headers.get('Session-Token')
            user = get_user_from_session(session_token)
            if not user:
                return {'error': 'User not authenticated'}, 401
            print(user)
            anomaly_log_res = AnomalyLog.query.filter_by(user_id_fk=user).all()
            if not anomaly_log_res:
                return {'error': 'no anomaly log found for user'}, 404

            list_obj = []
            for res in anomaly_log_res:
                list_obj.append(res.to_dict())
                # print(res.to_dict())
                        # print(anomaly_log_res)
            return jsonify(list_obj)

            return {'message': 'all good '}, 200
        
        except Exception as e:
            return {'error': str(e)}, 500

@anamolies_namespace.route('/get_anomalies')
class AnomalyModel(Resource):
    @anamolies_namespace.expect(Anomalies_Data, auth_parser)
    def post(self):
        try :
            data = request.get_json()
            session_token = request.headers.get('Session-Token')
            user = get_user_from_session(session_token)
            if not user:
                return {'error': 'User not authenticated'}, 401
            anomaly_log_id = data.get('anomaly_log_id')
            anomaly_log_res = AnomalyLog.query.filter_by(anomaly_log_id=anomaly_log_id).first()
            if not anomaly_log_res:
                return {'error': 'no anomaly log found'}, 404
            anomalies_res = Anomaly.query.filter_by(anomaly_log_id_fk=anomaly_log_res.anomaly_log_id).all()
            anomaly_ids =[]
            for anomaly_data in anomalies_res:
                anomaly_ids.append(anomaly_data.anomaly_instances_ids)
            return {'message': 'all workflow completes', 'anomalies': anomaly_ids}, 200
        
        except Exception as e:
            return {'error': str(e)}, 500
        

# @anamolies_namespace.route('/get_anomalies_detected')
# class Anomaly_detected(Resource):
#     @anamolies_namespace.expect(Anomalies_Data, auth_parser)
#     def post(self):
#         try :
#             session_token = request.headers.get('Session-Token')
#             user = get_user_from_session(session_token)
#             if not user:
#                 return {'error': 'User not authenticated'}, 401
            
#             data = self.read_csv_from_path()
#             if data is None:
#                 return {'error': 'CSV file does not exist'}, 404
#             else:
#                 return {'anomaly_data': data.to_json(orient='records')}, 200
            
        
#         except Exception as e:
#             return {'error': str(e)}, 500
#     def read_csv_from_path(self):
#         current_path = Path.cwd()
#         csv_file_path = current_path / 'model' / 'export_anomaly' / 'anomaly.csv'
#         if csv_file_path.exists():
#             data = pd.read_csv(csv_file_path)
#             print("CSV file has been read successfully.")
#             return data
#         else:
#             return None


# @anamolies_namespace.route('/post_anomalies_reviewed')
# class Anomaly_detected(Resource):
#     @anamolies_namespace.expect(upload_parser)
#     def post(self):
#         try :
#             session_token = request.headers.get('Session-Token')
#             user = get_user_from_session(session_token)
#             if not user:
#                 return {'error': 'User not authenticated'}, 401

#             uploaded_file = request.files['file']
#             if not uploaded_file.filename.endswith('.csv'):
#                 return {'error': 'File uploaded is not a CSV'}, 400

#             df = pd.read_csv(uploaded_file, delimiter=None)
#             return {'data': df.to_json(orient='records')}, 200

#         except Exception as e:
#             return {'error': str(e)}, 500


# @anamolies_namespace.route('/post_datapreprocessing')
# class Anomaly_DataPreprocessing(Resource):
#     @anamolies_namespace.expect(data_preprocessing_model, auth_parser)
#     @anamolies_namespace.expect(data_preprocessing_model)
#     def post(self):
#         session_token = request.headers.get('Session-Token')
#         user = get_user_from_session(session_token)
#         if not user:
#             return {'error': 'User not authenticated'}, 401
       
#         data_checklist = request.json['items']
#         print(data_checklist)
#         checked_item = [item['label'] for item in data_checklist if item['checked']]
#         # if len(checked_item) == 0:
#         #     return {'error': 'No item selected'}, 401
#         return {'checked_DataPreprocessing': checked_item}, 200
