from flask import Flask
from sqlalchemy import create_engine
import pandas as pd
import dbinfo
import traceback

#dbinfo
user = dbinfo.user
password = dbinfo.password
uri = dbinfo.uri
port = dbinfo.port
db = dbinfo.db


app = Flask(__name__)


@app.route("/")
def index():
    return app.send_static_file("index.html")


#parsing from stations table
@app.route("/stations")
def location():
    engine = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query = "select name, banking, stands, number, post_lat, post_long, address from stations;"
    df = pd.read_sql_query(query, engine)
    # print(df)
    return df.to_json(orient='records')



#parsing from availability table
@app.route("/stands")
def availability():
    engine2 = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query2 = "select status, last_update, station_num, avail_stands, avail_bikes from availability;"
    df2 = pd.read_sql_query(query2, engine2)
    # print(df2)
    return df2.to_json(orient='records')


#parsing from weather table
@app.route("/weather_info")
def weather():
    engine3 = create_engine(f"mysql+mysqlconnector://{user}:{password}@{uri}:{port}/{db}", echo=True)
    query3 = "select windspeed, description, main, temp, rainfall, time from weather;"
    df3 = pd.read_sql_query(query3, engine3)
    # print(df3)
    return df3.to_json(orient='records')


if __name__ == "__main__":
    app.run(debug=True, port=5000)