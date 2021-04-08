from flask import Flask, render_template, request
from sqlalchemy import create_engine
import pandas as pd
import dbinfo
import traceback
import datetime

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


# parsing from stations table
@app.route("/stations")
def location():
    engine = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query = """
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
        ORDER BY s.number;
        """
    df = pd.read_sql_query(query, engine)
    # print(df)
    return df.to_json(orient='records')


# parsing from availability table
@app.route("/stands")
def availability():
    engine2 = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query2 = "select status, last_update, number, avail_stands, avail_bikes from availability;"
    df2 = pd.read_sql_query(query2, engine2)
    # print(df2)
    return df2.to_json(orient='records')


# Retrieve average hourly availability data for selected station
@app.route("/hourlyAvailability/<int:stationNum>")
def hourly_availability(stationNum):
    engine = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    sql = f"""
        SELECT avg(avail_bikes) AS 'avg_bikes', avg(avail_stands) AS 'avg_stands', hour(last_update) AS 'hour'
        FROM availability
        WHERE number = {stationNum} AND weekday(last_update) = {datetime.datetime.now().weekday()} AND hour(last_update) BETWEEN 7 AND 20
        GROUP BY hour(last_update)
        ORDER BY hour(last_update) ASC;
        """
    df = pd.read_sql_query(sql, engine)
    return df.to_json(orient='records')


# parsing from weather table
@app.route("/weather_info")
def weather():
    engine3 = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query3 = "SELECT * FROM weather ORDER BY time DESC LIMIT 1;"
    df3 = pd.read_sql_query(query3, engine3)
    # print(df3)
    return df3.to_json(orient='records')


# parsing from availability table that shows the most recent updated rows from each number
@app.route("/chosen_station/<int:stationNum>")
def station(stationNum):
    engine4 = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query4 = f"""
        SELECT a.number, s.address as address, status, avail_bikes, avail_stands, MAX(last_update) as lastUpdate 
        FROM availability a, stations s
        WHERE a.number = {stationNum} AND a.number = s.number
        GROUP BY a.number;"""
    df4 = pd.read_sql_query(query4, engine4)
    # print(df4)
    return df4.to_json(orient='records')


#Retrieve the average availability for each day of the week for selected station
@app.route("/dailyAvailability/<int:stationNum>")
def daily_availability(stationNum):
    engine5 = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query5 = f"""
        SELECT  avg(avail_bikes) AS 'avg_bikes', avg(avail_stands) AS 'avg_stands', dayname(last_update) AS 'day' FROM availability 
        where number = {stationNum} 
        GROUP BY dayname(last_update) 
        ORDER BY weekday(last_update) ASC;
    """
    df5 = pd.read_sql_query(query5, engine5)
    return df5.to_json(orient='records')


# Get prediction input from user
@app.route("/predictionInput/<int:stationNum>", methods=['POST'])
def data(station_num):
    user_input = request.form.to_dict()
    user_input['station'] = station_num
    # E.g. -> user_input = { predict_dt : "2021-04-22T19:34", station: 107 }
    # Query OWM for forecasted weather in Dublin at this time
    # pass time, station number, and weather into prediction model
    #return user_input


if __name__ == "__main__":
    app.run(debug=True, port=5000)
