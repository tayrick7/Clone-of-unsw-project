from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import numpy as np 
from sklearn.preprocessing import Normalizer, MinMaxScaler
import pandas as pd
def convert_type(df):
    df = df.astype({col: 'float64' for col in df.select_dtypes('int64').columns})
    df = df.astype({col: 'float64' for col in df.select_dtypes('bool').columns}) 
    df = df.astype('float32')
    return df

def transform_data(df):
    pipeline = Pipeline([('normalizer', Normalizer()),
                     ('scaler', MinMaxScaler())])

    columns_to_transform = ['amt', 'mean_amount', 'std_amount','mean_nb_tx_per_day','nb_terminals','location_different','per_day_difference_count','mean_difference','lat_terminal','log_terminal','lat_customer','log_customer']
    preprocessor = ColumnTransformer([
    ('num', pipeline, columns_to_transform),
    ('pass', 'passthrough', [col for col in df.columns if col not in columns_to_transform])
])
    transformed = preprocessor.fit_transform(df)
    df_transformed = pd.DataFrame(transformed, columns=columns_to_transform + [col for col in df.columns if col not in columns_to_transform])
    return df_transformed

def mad_score(points):
    """https://www.itl.nist.gov/div898/handbook/eda/section3/eda35h.htm """
    m = np.median(points)
    ad = np.abs(points - m)
    mad = np.median(ad)
    
    return 0.6745 * ad / mad
