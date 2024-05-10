
import numpy as np 
import pandas as pd
from datetime import datetime
from app.classes import Feature_engineer, Feature_engineer2
from app.classes.reject_anomalies import pred_baseon_threshold
from app.classes.AutoEncoder_util import mad_score
from app.classes.Data_preprocessing_method import apply_PCA
from enum import Enum
import os

class FeaturesType(Enum):
    features_type_1 = 1
    features_type_2 = 2

class MLDL_Class:
    def __init__(self, ml_dl_name: str):
        self.ml_dl_name = ml_dl_name
    
    def generate_additional_features(self):
        raise NotImplementedError("Subclasses must implement this method")

    def perform_ml_test_pipeline(self):
        raise NotImplementedError("Subclasses must implement this method")

class ModelPipelineCls(MLDL_Class):
    def __init__(self, cc_dataframe: pd.DataFrame) -> None:
        self.join_df = pd.DataFrame()
        self.transactions_df = cc_dataframe
    
    def _is_isolation_forest(self, text:str, words):
        # Remove all spaces from the text
        normalized_text = text.replace(" ", "").lower()
        # Check if each word is in the normalized text
        return all(word in normalized_text for word in words)
    
    def generate_additional_features(self, feature_type:FeaturesType):
        y_test = None
        if feature_type == FeaturesType.features_type_1:
            terminal_profiles_df = pd.read_csv("./backend_flask/app/flatfiles/terminal_profiles_table.csv")
            customer_profiles_df = pd.read_csv("./backend_flask/app/flatfiles/customer_profiles_table.csv")
            self.join_df = pd.merge(self.transactions_df, terminal_profiles_df, on='terminal_id', how='inner') #join dataset base on key value
            self.join_df = pd.merge(self.join_df, customer_profiles_df, on='customer_id', how='inner')
            self.join_df, y_test = Feature_engineer.feature_engineer_steps(self.join_df)
            self.join_df = Feature_engineer.remove_unwanted_col(self.join_df)
        else:
            self.join_df, y_test = Feature_engineer2.perform_features_generation_pipeline(self.transactions_df)
            
        return y_test
    
    def perform_ml_test_pipeline(self, mlflow_loaded_model, model_name: str, is_decision_function: bool=False, is_PCA: bool=False, PCA_components: int= 5, input_threshold: float=15):
        is_autoencoder = False
        test_df = self.join_df.copy()
        if self._is_isolation_forest(model_name,  words = ["isolation", "forest"]):
            print("is Isolation Forest")
            is_decision_function = True
        elif self._is_isolation_forest(model_name, words = ["autoencoder"]):
            print("is AutoEncoder")
            is_autoencoder = True
        predictions = None
        # print(self.join_df.columns.tolist())
        if is_decision_function:
            if is_PCA:
                print("is PCA! Component={}".format(PCA_components))
                test_df = apply_PCA(test_df, PCA_components)
                
            test_scores = mlflow_loaded_model.decision_function(test_df)
            test_threshold = np.percentile(test_scores, input_threshold) #default set 15% of data are anomalies
            predictions = pred_baseon_threshold(mlflow_loaded_model, test_df, test_threshold) #using threshold to determine anomalies
        elif is_autoencoder:
            if is_PCA:
                print("is PCA! Component={}".format(PCA_components))
                test_df = apply_PCA(test_df, PCA_components)
            
            reconstructions = mlflow_loaded_model.predict(test_df)
            mse = np.mean(np.power(test_df - reconstructions, 2), axis=1)
            threshold = input_threshold
            z_scores = mad_score(mse)
            predictions = z_scores > threshold
        else:
            print("is Random Forest?")
            # Random Forest should come here
            predictions = mlflow_loaded_model.predict(test_df)
        return predictions
     