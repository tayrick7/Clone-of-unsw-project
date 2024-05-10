import pandas as pd
import numpy as np 

def pred_baseon_threshold(model, test_data,threshold):
    test_scores = model.decision_function(test_data)
    num_values_below_threshold = np.sum(test_scores > threshold) # having score higher than threshold are anomalies
    pred = test_scores
    pred[test_scores > threshold] = 0
    pred[test_scores != 0] = 1
    return pred
    
def make_use_reject_anomalies(model, rejected_anomalies,sensitivity,current_threshold):


    test_scores = model.decision_function(rejected_anomalies)

    for anomaly in test_scores:
        current_threshold += anomaly * sensitivity
    new_threshold = current_threshold
    return new_threshold