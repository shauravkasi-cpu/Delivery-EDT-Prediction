#!/usr/bin/env python
# coding: utf-8

# In[1]:


import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
import os

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor


# In[2]:


df=pd.read_csv("Porter_DataSet.csv")


# In[3]:


df


# In[4]:


df.isnull().sum()


# In[5]:


df.info()


# In[6]:


df.dropna(inplace=True)


# In[7]:


df.isnull().sum()


# In[8]:


df['created_at'] = pd.to_datetime(df['created_at'], errors='coerce', dayfirst=True)


# In[9]:


df['actual_delivery_time'] = pd.to_datetime(df['actual_delivery_time'], errors='coerce', dayfirst=True)


# In[10]:


df["duration_minutes"]=(df['actual_delivery_time']-df['created_at']).dt.total_seconds()/60


# In[11]:


df["duration_minutes"]


# In[12]:


df.dropna(inplace=True)


# In[13]:


df["duration_minutes"]


# In[14]:


df.drop(index=197412, inplace=True)


# In[15]:


le=LabelEncoder()


# In[16]:


df["order_hour"]=df["created_at"].dt.hour


# In[17]:


df["order_day_of_week"]=df["created_at"].dt.dayofweek


# In[18]:


df["is_weekend"]=df["order_day_of_week"].isin([5,6])


# In[19]:


df["is_weekend"]


# In[20]:


catcols = df.select_dtypes(exclude= "number").columns.tolist()


# In[21]:


catcols


# In[22]:


catcols=['store_primary_category',
 'is_weekend']


# In[23]:


for c in catcols:
    df[c]=le.fit_transform(df[c])


# In[24]:


df.select_dtypes(exclude= "number").columns.tolist()


# In[25]:


df.info()


# In[26]:


df.shape


# In[27]:


#FIX for properties with corrupt properties where duration was below 0
df = df[(df["duration_minutes"] > 0) & (df["duration_minutes"] < 300)]


# In[28]:


x=df.drop(columns=['created_at', 'actual_delivery_time', 'store_id',"duration_minutes" ])


# In[29]:


#StandardScaler
ss=StandardScaler()
x_scaled=ss.fit_transform(x)


# In[30]:


y=df["duration_minutes"]


# In[31]:


X_train, X_test, y_train, y_test = train_test_split(x_scaled, y, test_size=0.2, random_state=42)


# In[32]:


model=XGBRegressor(n_estimators=1000, learning_rate=0.1, max_depth=4, random_state=42)


# In[33]:


model.fit(X_train,y_train)


# In[34]:


y_pred=model.predict(X_test)


# In[35]:


y_pred


# In[36]:


mean_absolute_error(y_pred,y_test)


# In[37]:


# Save model, scaler, and feature columns for the API backend
import os, pickle

os.makedirs("backend", exist_ok=True)

with open("backend/model.pkl", "wb") as fp:
    pickle.dump(model, fp)

with open("backend/scaler.pkl", "wb") as fp:
    pickle.dump(ss, fp)

feature_columns = list(x.columns)
with open("backend/feature_columns.pkl", "wb") as fp:
    pickle.dump(feature_columns, fp)

print("Model, scaler, and feature columns saved to backend/")
print(f"   MAE: {mean_absolute_error(y_pred, y_test):.2f} minutes")
print(f"   R2 : {r2_score(y_test, y_pred):.4f}")
print(f"   Features: {feature_columns}")
