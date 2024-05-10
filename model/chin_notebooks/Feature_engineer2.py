
import numpy as np 
import pandas as pd
from datetime import datetime
from enum import Enum

def _remove_some_features(cc_trans_df:pd.DataFrame, remove_post_ts: bool=True):
    data = cc_trans_df
    # Separate features (F1, F2, F3) and target (TARGET)
    columns =  list(cc_trans_df.columns)

    # Entries you want to remove
    entries_to_remove = ['transaction_id', 'customer_id', 'bin', 'entry_mode', 
                        'terminal_id', 'fraud', 'fraud_scenario',
                        'terminal_id_nb_tx_1day_window', 'terminal_id_risk_1day_window',
                        'terminal_id_nb_tx_7day_window', 'terminal_id_risk_7day_window',
                        'terminal_id_nb_tx_30day_window', 'terminal_id_risk_30day_window'
                        ]
    target = 'fraud'
    # Remove the entries
    features = [col for col in columns if col not in entries_to_remove]

    X = data[features]
    if remove_post_ts:
        X = X.drop(columns=['post_ts'])
    y = None
    try:
        y = data[target]
    except Exception as e:
        pass
    return X, y

def _is_weekend(tx_datetime):

    # Transform date into weekday (0 is Monday, 6 is Sunday)
    weekday = tx_datetime.weekday()
    # Binary value: 0 if weekday, 1 if weekend
    is_weekend = weekday>=5
    
    return int(is_weekend)

def _is_night(tx_datetime):
    
    # Get the hour of the transaction
    tx_hour = tx_datetime.hour
    # Binary value: 1 if hour less than 6, and 0 otherwise
    is_night = tx_hour<=6
    
    return int(is_night)

def _get_customer_spending_behaviour_features(customer_transactions, windows_size_in_days=[1,7,30]):
    
    # Let us first order transactions chronologically
    customer_transactions=customer_transactions.sort_values('post_ts')
    
    # The transaction date and time is set as the index, which will allow the use of the rolling function 
    customer_transactions.index=customer_transactions.post_ts
    
    # For each window size
    for window_size in windows_size_in_days:
        
        # Compute the sum of the transaction amounts and the number of transactions for the given window size
        SUM_AMOUNT_TX_WINDOW=customer_transactions['amt'].rolling(str(window_size)+'d').sum()
        NB_TX_WINDOW=customer_transactions['amt'].rolling(str(window_size)+'d').count()
    
        # Compute the average transaction amount for the given window size
        # NB_TX_WINDOW is always >0 since current transaction is always included
        AVG_AMOUNT_TX_WINDOW=SUM_AMOUNT_TX_WINDOW/NB_TX_WINDOW
    
        # Save feature values
        customer_transactions['customer_id_nb_tx_'+str(window_size)+'day_window']=list(NB_TX_WINDOW)
        customer_transactions['customer_id_avg_amount_'+str(window_size)+'day_window']=list(AVG_AMOUNT_TX_WINDOW)
    
    # Reindex according to transaction IDs
    customer_transactions.index=customer_transactions.transaction_id
        
    # And return the dataframe with the new features
    return customer_transactions

def _get_count_risk_rolling_window(terminal_transactions, delay_period=7, windows_size_in_days=[1,7,30], feature="terminal_id"):
    
    terminal_transactions=terminal_transactions.sort_values('post_ts')
    
    terminal_transactions.index=terminal_transactions.post_ts
    
    NB_FRAUD_DELAY=terminal_transactions['fraud'].rolling(str(delay_period)+'d').sum()
    NB_TX_DELAY=terminal_transactions['fraud'].rolling(str(delay_period)+'d').count()
    
    for window_size in windows_size_in_days:
    
        NB_FRAUD_DELAY_WINDOW=terminal_transactions['fraud'].rolling(str(delay_period+window_size)+'d').sum()
        NB_TX_DELAY_WINDOW=terminal_transactions['fraud'].rolling(str(delay_period+window_size)+'d').count()
    
        NB_FRAUD_WINDOW=NB_FRAUD_DELAY_WINDOW-NB_FRAUD_DELAY
        NB_TX_WINDOW=NB_TX_DELAY_WINDOW-NB_TX_DELAY
    
        RISK_WINDOW=NB_FRAUD_WINDOW/NB_TX_WINDOW
        
        terminal_transactions[feature+'_nb_tx_'+str(window_size)+'day_window']=list(NB_TX_WINDOW)
        terminal_transactions[feature+'_risk_'+str(window_size)+'day_window']=list(RISK_WINDOW)
        
    terminal_transactions.index=terminal_transactions.transaction_id
    
    # Replace NA values with 0 (all undefined risk scores where NB_TX_WINDOW is 0) 
    terminal_transactions.fillna(0,inplace=True)
    
    return terminal_transactions

def perform_features_generation_pipeline(cc_trans_df, remove_post_ts: bool=True):
    cc_trans_df['post_ts'] = pd.to_datetime(cc_trans_df['post_ts'])
    cc_trans_df['during_weekend']=cc_trans_df.post_ts.apply(_is_weekend)
    cc_trans_df['during_night']=cc_trans_df.post_ts.apply(_is_night)
    cc_trans_df=cc_trans_df.groupby('customer_id', group_keys=True).apply(_get_customer_spending_behaviour_features, include_groups=False)
    cc_trans_df=cc_trans_df.sort_values('post_ts').reset_index(drop=True)
    cc_trans_df=cc_trans_df.groupby('terminal_id', group_keys=True).apply(_get_count_risk_rolling_window, include_groups=False)
    cc_trans_df=cc_trans_df.sort_values('post_ts').reset_index(drop=True)
    X, y = _remove_some_features(cc_trans_df, remove_post_ts=remove_post_ts)
    return X, y
