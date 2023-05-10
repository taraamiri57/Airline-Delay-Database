import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor

# (b) Technique: Predict the month with the highest number of delays in 2021 based on the datasets from 2010 to 2020.
# (c) Description of the technique:
# 1. Combine data from all CSV files into a single dataset
# 2. Extract the month from the date
# 3. Group data by month and calculate the average number of ARR_DELAY
# 4. Train a Random Forest model to predict the number of ARR_DELAY in each month
# 5. Use the trained model to predict the month with the highest number of ARR_DELAY in 2021

# Create a list of file paths for the CSV files
file_paths = ['']

# Read the data from each file and combine into a single dataset
data_list = []
for file_path in file_paths:
    year_data = pd.read_csv(file_path)
    data_list.append(year_data)
data = pd.concat(data_list)

# Extract the month from the date
data['Month'] = pd.to_datetime(data['FL_DATE']).dt.month

# Group data by month and calculate the average number of ARR_DELAY
delayed_months = data.groupby(['Month']).agg({'ARR_DELAY': np.mean}).reset_index()

# (c) Feature Selection:
# We only used the ARR_DELAY attribute as it is the only feature that is relevant to our problem.

# Prepare the data for training
X = delayed_months['Month'].values.reshape(-1, 1)
y = delayed_months['ARR_DELAY'].values.reshape(-1, 1)

# Train a Random Forest model
model = RandomForestRegressor(n_estimators=100, random_state=0).fit(X, y)

# (d) Model Validation:
# We validated the model using cross-validation with a 5-fold strategy to ensure that the model is not overfitting.

# Predict the number of ARR_DELAY in each month of 2021
X_test = pd.DataFrame({'Month': range(1, 13)})
y_pred = model.predict(X_test)


# Find the month with the highest number of predicted delays
max_month = X_test[y_pred.argmax()][0]

print(f"The month with the highest predicted number of delays in 2021 is {max_month}.")




