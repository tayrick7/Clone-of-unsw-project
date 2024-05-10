from flask import Blueprint
from flask_restx import Api, Resource, fields
import pandas as pd
from flask import request
from sqlalchemy import text
from datetime import datetime, timezone

from app.db_models.table_classes import Pipeline, ActiveSession
from app.extensions import db
from sqlalchemy.exc import IntegrityError


pipelines_api_blueprint = Blueprint('pipelines_api', __name__)
api = Api(pipelines_api_blueprint, doc='/')

### Business Pipeline 
pipeline_namespace = api.namespace('', description='Business Pipelines')
Pipeline_model= api.model('Pipeline', {
    'pipeline_name': fields.String(required=True, description='business pipeline name'),
    'model_name': fields.String(required=True, description="selected model's name")
})

item_model = api.model('Item', {
    'label': fields.String(required=True, description='Data processing task'),
    'checked': fields.Boolean(required=True, description='is task checked?')
})

# data_preprocessing_model = api.model('DataPreprocessing_checklist', {
#     'items': fields.List(fields.Nested(item_model), required=True, description='List of data preprocessing tasks', example=[
#         {'label': 'drop_duplicate', 'checked': True},
#         {'label': 'pca', 'checked': False},
#         {'label': 'fill_na', 'checked': True}
#     ])
# })

combined_model = api.model('Combined', {
    'pipeline_name': fields.String(required=True, description='business pipeline name'),
    'model_name': fields.String(required=True, description="selected model's name"),
    'items': fields.List(fields.Nested(item_model), required=True, description='List of data preprocessing tasks', example=[
        {'label': 'drop_duplicate', 'checked': True},
        {'label': 'pca', 'checked': False},
        {'label': 'fill_na', 'checked': True}
    ])
})

get_pipe= api.model('get_pipe', {
    'pipeline_name': fields.String(required=True, description='business pipeline name')
})

auth_parser = api.parser()
auth_parser.add_argument('Session-Token', location='headers', help='Session Token', required=True)

def get_user_from_session(session_token):
    active_session = ActiveSession.query.filter_by(session_token=session_token).first()
    if active_session:
        return active_session.user_id
    else:
        return None

@pipeline_namespace.route('/create_pipeline')
class PipelineResource(Resource):
    @pipeline_namespace.expect(combined_model, auth_parser)
    def post(self):
        session_token = request.headers.get('Session-Token')
        user = get_user_from_session(session_token)
        if not user:
            return {'error': 'User not authenticated'}, 401
        data = request.get_json()
        pipeline_name = data.get('pipeline_name')
        model_name = data.get('model_name')
        created_timestamp = datetime.now(timezone.utc)
        data_checklist = request.json['items']
        checked_item = [item['label'] for item in data_checklist if item['checked']]

        if not pipeline_name:
            return {"error": "pipeline name is required"}, 400
        if not model_name:
            return {"error": "Model choice is required"}, 400
        if not data_checklist:
            return {"error": "Data-preprocessing is required"}, 400

        pipeline_query_result = Pipeline.query.filter_by(pipeline_name=pipeline_name).first()
        if pipeline_query_result:
            return {"error": "Pipeline already exists"}, 400

        else:
            try:
                preprocessing = ', '.join(checked_item)
                new_biz_pipeline = Pipeline(pipeline_name=pipeline_name, model_name=model_name, preprocessing =preprocessing, user_id_fk = user,
                                            created_timestamp=created_timestamp)
                db.session.add(new_biz_pipeline)
                db.session.commit()
                return {'message': 'Business Pipeline added successfully'}, 201
            except IntegrityError:
                return {'message': 'You have to first add Machine learning algorithm to our database'}, 500

@pipeline_namespace.route('/get_certain_pipeline')
class get_certain_pipelines(Resource):
    @pipeline_namespace.expect(get_pipe, auth_parser)
    def post(self):
        session_token = request.headers.get('Session-Token')
        user = get_user_from_session(session_token)
        if not user:
            return {'error': 'User not authenticated'}, 401
        data = request.get_json()
        pipeline_name = data.get('pipeline_name')
        selected_pipeline = Pipeline.query.filter_by(pipeline_name=pipeline_name, user_id_fk = user).first()
        if not selected_pipeline:
            return {'error': 'Pipeline not found'}, 404
        else:
            pipeline_details = {
                'pipeline_name': selected_pipeline.pipeline_name,
                'model_name': selected_pipeline.model_name,
                'preprocessing': selected_pipeline.preprocessing
            }
        return pipeline_details




@pipeline_namespace.route('/get_all_pipelines')
class GetPipelines(Resource):
    def get(self):
        select_query = text("SELECT * FROM pipeline")
        try:
            with db.engine.begin() as conn:
                result = pd.read_sql_query(select_query, conn)
                if result.empty:
                    return  {'message': 'Listed all pipelines', 'pipeline_list': []}, 200
                result['created_timestamp'] = result['created_timestamp'].dt.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
                pipeline_list = result.to_dict(orient='records')
                return {'message': 'Listed all pipelines', 'pipeline_list': pipeline_list}, 200

        except Exception as e:
            return {'error': f'Error: {e}'}, 500



@pipeline_namespace.route('/delete_pipeline')
class DeletePipelines(Resource):
    @pipeline_namespace.expect(get_pipe, auth_parser)
    def post(self):
        session_token = request.headers.get('Session-Token')
        user = get_user_from_session(session_token)
        if not user:
            return {'error': 'User not authenticated'}, 401
        data = request.get_json()
        pipeline_name = data.get('pipeline_name')
        selected_pipeline = Pipeline.query.filter_by(pipeline_name=pipeline_name,user_id_fk = user).first()
        if not selected_pipeline:
            return {'error': 'Pipeline not found'}, 404
        else:
            db.session.delete(selected_pipeline)
            db.session.commit()
            return {'message': f'Pipeline {pipeline_name} has been deleted successfully.'}, 200