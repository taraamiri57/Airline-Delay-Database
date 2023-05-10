import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.impute import SimpleImputer

# Load the data
data = pd.read_csv('')

# Define the features and target variables
data['Month'] = pd.to_datetime(data['FL_DATE']).dt.month
data['Day'] = pd.to_datetime(data['FL_DATE']).dt.day

X = data[['Month', 'Day', 'ORIGIN', 'DEST', 'DISTANCE']]
X = pd.get_dummies(X, columns=['ORIGIN', 'DEST'])
y = data['ARR_DELAY']

# Impute missing values in X using mean imputation
imputer = SimpleImputer(strategy='mean')
X = imputer.fit_transform(X)

# Train a Linear Regression model
model = LinearRegression()
model.fit(X, y)

# Predict the delay for each destination airport
dest_probs = data[['DEST', 'ARR_DELAY']]
dest_probs['predicted_delay'] = model.predict(X)
dest_probs = dest_probs.groupby(['DEST'])['predicted_delay'].mean().reset_index()

# Sort the data by predicted delay
dest_probs_sorted = dest_probs.sort_values('predicted_delay', ascending=False)

# Get the 10 destinations with the highest predicted delay
highest_delay_destinations = dest_probs_sorted.head(10)

# Get the 10 destinations with the lowest predicted delay
lowest_delay_destinations = dest_probs_sorted.tail(10)

# Print the results
print("10 Destinations with the highest predicted delay:")
print(highest_delay_destinations)
print("\n")
print("10 Destinations with the lowest predicted delay:")
print(lowest_delay_destinations)
