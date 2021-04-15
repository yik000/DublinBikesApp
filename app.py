from flask import Flask, render_template, request
from sqlalchemy import create_engine
import pandas as pd
import dbinfo
import datetime
import forecastInfo
import pickle
import numpy as np


# Load prediction model
with open('model.pkl', 'rb') as handle:
    model = pickle.load(handle)


# dbinfo
user = dbinfo.USER
password = dbinfo.PASS
uri = dbinfo.DBURI
port = dbinfo.PORT
db = dbinfo.DBNAME


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html", mapApiKey=dbinfo.MAPKEY)


# Query from stations table to get most recent data based on user input
@app.route("/stations")
def location():
    engine_station = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query_station = """
        SELECT DISTINCT s.*, a1.avail_stands, a1.avail_bikes, a1.last_update
        FROM stations s, availability a1
        INNER JOIN
            (
            SELECT number, max(last_update) as last_update
            FROM availability 
            GROUP BY number
            ) a2
            ON a1.number = a2.number AND a1.last_update = a2.last_update
        WHERE s.number = a1.number
        ORDER BY s.name ASC;
        """
    df = pd.read_sql_query(query_station, engine_station)
    return df.to_json(orient='records')


# Query from availability table
@app.route("/stands")
def availability():
    engine_available = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query_available = "select status, last_update, number, avail_stands, avail_bikes from availability;"
    df_stands = pd.read_sql_query(query_available, engine_available)
    return df_stands.to_json(orient='records')


# Retrieve average hourly availability data for selected station
@app.route("/hourlyAvailability/<int:station_num>")
def hourly_availability(station_num):
    engine_hourly = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query_hourly = f"""
        SELECT avg(avail_bikes) AS 'avg_bikes', avg(avail_stands) AS 'avg_stands', hour(last_update) AS 'hour'
        FROM availability
        WHERE number = {station_num} AND weekday(last_update) = {datetime.datetime.now().weekday()} AND hour(last_update) BETWEEN 7 AND 20
        GROUP BY hour(last_update)
        ORDER BY hour(last_update) ASC;
        """
    df_hourly = pd.read_sql_query(query_hourly, engine_hourly)
    return df_hourly.to_json(orient='records')


# Query to get the most recent forecast from weather table
@app.route("/weather_info")
def weather():
    engine_c_weather = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query_c_weather = "SELECT * FROM weather ORDER BY time DESC LIMIT 1;"
    df_weather = pd.read_sql_query(query_c_weather, engine_c_weather)
    return df_weather.to_json(orient='records')


# Query from availability table to obtain most recent data from each station
@app.route("/chosen_station/<int:station_num>")
def station(station_num):
    engine_station_avail = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query_station_avail = f"""
        SELECT a.number, s.address as address, status, avail_bikes, avail_stands, MAX(last_update) as lastUpdate 
        FROM availability a, stations s
        WHERE a.number = {station_num} AND a.number = s.number
        GROUP BY a.number;"""
    df_chosen_station = pd.read_sql_query(query_station_avail, engine_station_avail)
    return df_chosen_station.to_json(orient='records')


# Retrieve the average availability for each day of the week for selected station
@app.route("/dailyAvailability/<int:station_num>")
def daily_availability(station_num):
    engine_daily = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query_daily = f"""
        SELECT  avg(avail_bikes) AS 'avg_bikes', avg(avail_stands) AS 'avg_stands', dayname(last_update) AS 'day' FROM availability 
        where number = {station_num} 
        GROUP BY dayname(last_update) 
        ORDER BY weekday(last_update) ASC;
    """
    df_average = pd.read_sql_query(query_daily, engine_daily)
    return df_average.to_json(orient='records')


# Get prediction input from user
@app.route("/predictionInput/<int:station_num>", methods=['POST'])
def data(station_num):
    user_input = request.form.to_dict()
    user_input['station'] = station_num
    # Call forecastInfo to return main description forecast based on selected date
    weather = forecastInfo.main_weather(user_input)
    weather = np.asarray(weather)
    weather = weather.reshape(1, -1)
    # pass station number and weather into prediction model
    result = model[station_num].predict(weather)

    return str(result)[1:-1]


if __name__ == "__main__":
    app.run(debug=True, port=5000)
