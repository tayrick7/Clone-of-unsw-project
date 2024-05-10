import os
import json
from flask_sqlalchemy import SQLAlchemy as sqlalchemy_flash
from flask_restx import fields

from sqlalchemy.sql import func
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime, timezone

from app.extensions import db, pretrained_model


class Credentials(db.Model):
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_timestamp = Column(DateTime, nullable=False, default=func.utcnow)


    def flask_restx_dict(self):
        return {
            'email': fields.String(required=True, description="The user's email"),
            'password': fields.String(required=True, description='The user password')
        }
        
    def __repr__(self):
        return f'<Credentials {self.email}>'


class UserLog(db.Model):
    userlog_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id_fk = Column(Integer, ForeignKey(Credentials.user_id), nullable=False)
    log_timestamp = Column(DateTime, nullable=False, default=func.utcnow)

    def flask_restx_dict(self):
        return {
            'user_id_fk': fields.String(required=True, description="The user's id")
        }

    def __repr__(self):
        return f'<User Logs: {self.email, self.log_timestamp}>'


class QuestionName(db.Model):
    id = Column(Integer, primary_key=True, autoincrement=True)
    question = Column(String(255), nullable=False)

class SecurityQuestion(db.Model):
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id_fk = Column(Integer, ForeignKey(Credentials.user_id), nullable=False)
    question_id_1_fk = Column(Integer, ForeignKey(QuestionName.id), nullable=False)
    # question_id_1 = Column(Integer, nullable=False)
    answer_1 = Column(String(255), nullable=False)
    question_id_2_fk = Column(Integer, ForeignKey(QuestionName.id), nullable=False)
    # question_id_2 = Column(Integer, nullable=False)
    answer_2 = Column(String(255), nullable=False)

class ActiveSession(db.Model):
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey(Credentials.user_id), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)



class MLDLModel(db.Model):
    model_id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(255), nullable=False)
    model_version = Column(Integer, nullable=False)
    model_features_inputs = Column(String(2000), nullable=False)
    created_timestamp = Column(DateTime, nullable=False, default=func.utcnow)
    # Define a composite unique constraint
    __table_args__ = (db.UniqueConstraint('model_name', 'model_version', name='unique_modelname_version'),)

    def flask_restx_dict(self):
        return {'model_name': fields.String(required=True, description='model name')}

    def __repr__(self):
        return f'<ML/DL Model: {self.model_name, self.model_version}>'

class Pipeline(db.Model):
    pipeline_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id_fk = Column(Integer, ForeignKey(Credentials.user_id), nullable=False)
    pipeline_name = Column(String(255), nullable=False, unique=True)
    model_name = Column(String(255) ,nullable=False)
    preprocessing = Column(String(255), nullable=False)
    # email = Column(String(255), nullable=False)       why?? what is this ### CHIN Comment
    created_timestamp = Column(DateTime, nullable=False, default=func.utcnow)

    def flask_restx_dict(self):
        return {
            'pipeline_name': fields.String(required=True, description='model name')
        }

    def __repr__(self):
        return f'<Pipeline: {self.pipeline_name}>'


    

class UserDataset(db.Model):
    user_dataset_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id_fk = Column(Integer, ForeignKey(Credentials.user_id), nullable=False)
    filename = Column(String(255), nullable=False)
    stored_tablename = Column(String(255), nullable=False, unique=True)
    created_timestamp = Column(DateTime, nullable=False, default=func.utcnow)

    def __repr__(self):
        return f'<Dataset_Filename: {self.filename}, Dataset_stored_tablename: {self.stored_tablename}>'


# class PipelineModel(db.Model):
#     pipeline_model_id = Column(Integer, primary_key=True, autoincrement=True)
#     pipeline_name = Column(String(255), nullable=False, unique=True)
#     model_id_fk = Column(Integer, ForeignKey(MLDLModel.model_id), nullable=False)
#     created_timestamp = Column(DateTime, nullable=False, default=func.utcnow)

#     def flask_restx_dict(self):
#         return {
#             'pipeline_name': fields.String(required=True, description='model name'),
#             'model_id_fk': fields.Integer(required=True, description='model name')
#         }

#     def __repr__(self):
#         return f'<Pipeline Model: {self.pipeline_name}>'


class AnomalyLog(db.Model):
    anomaly_log_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id_fk = Column(Integer, ForeignKey(Credentials.user_id), nullable=False)
    user_dataset_id_fk = Column(Integer, ForeignKey(UserDataset.user_dataset_id), nullable=False)
    model_id_fk = Column(Integer, ForeignKey(MLDLModel.model_id), nullable=False)
    anomaly_log_results = Column(String(2000), nullable=False)
    created_timestamp = Column(DateTime, nullable=False, default=func.utcnow)

    def to_dict(self):
        anomaly_log_results_json = self.anomaly_log_results
        anomaly_log_results_json = json.loads(anomaly_log_results_json)
        return {
            'anomaly_log_id': self.anomaly_log_id,
            'user_id_fk': self.user_id_fk,
            'user_dataset_id_fk': self.user_dataset_id_fk,
            'model_id_fk': self.model_id_fk,
            'anomaly_log_results': anomaly_log_results_json,
            'created_timestamp': self.created_timestamp.isoformat()  # Format datetime for JSON serialization
        }

    def __repr__(self):
        return f'<Anomaly Log ID and Dataset ID: {self.anomaly_log_id, self.user_dataset_id_fk}>'


class Anomaly(db.Model):
    anomaly_id = Column(Integer, primary_key=True, autoincrement=True)
    anomaly_log_id_fk = Column(Integer, ForeignKey(AnomalyLog.anomaly_log_id), nullable=False)
    anomaly_instances_ids = Column(Integer, nullable=False)

    def __repr__(self):
        return f'<Anomaly ID and Instance ID: {self.anomaly_id, self.anomaly_instances_ids}>'


def create_samples():
    
    # new users
    new_user1 = Credentials(email= 'user1', password = 'pass1', created_timestamp= datetime.now(timezone.utc))
    new_user2 = Credentials(email= 'user2', password = 'pass2', created_timestamp= datetime.now(timezone.utc))
    new_user3 = Credentials(email= 'user3', password = 'pass3', created_timestamp= datetime.now(timezone.utc))
 
    db.session.add(new_user1)
    db.session.add(new_user2)
    db.session.add(new_user3)
    db.session.commit()
    user1 = Credentials.query.filter_by(email = new_user1.email).first()

    # user logs
    new_user_log1 = UserLog(user_id_fk = user1.user_id, log_timestamp = datetime.now(timezone.utc))
    new_user_log2 = UserLog(user_id_fk = user1.user_id, log_timestamp = datetime.now(timezone.utc))
    db.session.add(new_user_log1)
    db.session.add(new_user_log2)
    db.session.commit()
    
    # ML DL Model
    # new_MLDL_model1 = MLDLModel(model_name=pretrained_model[1]['model_name'], model_version=pretrained_model[1]['version'], created_timestamp=datetime.now(timezone.utc))
    # new_MLDL_model2 = MLDLModel(model_name=pretrained_model[2]['model_name'], model_version=pretrained_model[2]['version'], created_timestamp=datetime.now(timezone.utc))
    # new_MLDL_model3 = MLDLModel(model_name=pretrained_model[3]['model_name'], model_version=pretrained_model[3]['version'], created_timestamp=datetime.now(timezone.utc))
    # new_MLDL_model4 = MLDLModel(model_name=pretrained_model[4]['model_name'], model_version=pretrained_model[4]['version'], created_timestamp=datetime.now(timezone.utc))
    # db.session.add(new_MLDL_model1)
    # db.session.add(new_MLDL_model2)
    # db.session.add(new_MLDL_model3)
    # db.session.add(new_MLDL_model4)
    # db.session.commit()

    # Questions Model
    questions = [
        'What is your favorite color?',
        'What is your favorite animal?',
        'What is your favorite phone brand?',
        'What is your favorite car brand?',
        'What is your favorite city?',
        "What is your first pet's name?"
    ]

    for question_text in questions:
        existing_question = QuestionName.query.filter_by(question=question_text).first()
        if existing_question is None:
            new_question = QuestionName(question=question_text)
            db.session.add(new_question)
    db.session.commit()

    security_questions1 = SecurityQuestion(user_id_fk=new_user1.user_id, question_id_1_fk=1, answer_1="hello", question_id_2_fk=2, answer_2="world")
    security_questions2 = SecurityQuestion(user_id_fk=new_user2.user_id, question_id_1_fk=1, answer_1="hello", question_id_2_fk=2, answer_2="world")
    security_questions3 = SecurityQuestion(user_id_fk=new_user3.user_id, question_id_1_fk=1, answer_1="hello", question_id_2_fk=2, answer_2="world")
    db.session.add(security_questions1)
    db.session.add(security_questions2)
    db.session.add(security_questions3)
    db.session.commit()