from datetime import datetime
import traceback
import json
import requests

# api key info
city = "Dublin,ie"
api_key = "bd7d1521214da9913bfd5624b8c3d6d0"
units = "metric"
station = f"https://pro.openweathermap.org/data/2.5/forecast/climate?q={city}&appid={api_key}&units={units}"


# asks the api for a forecast based on the selected time of the user
def main_weather(user_input):
    try:
        #making a query to request for a 30 day forecast
        r = requests.get(station)
        result = r.json()

        # slicing characters to get the day of the date, convert it to date() then replace the default time to 12PM, convert it to timestamp()
        date = user_input['predict_dt']
        date = date[0:10]
        datetime_object = datetime.strptime(date, '%Y-%m-%d')
        datetime_object = datetime_object.replace(hour=13, minute=0)
        final_date = int(datetime_object.timestamp())

        # getting the forecast based on the user input
        weather = {}
        for i in range(len(result['list'])):
            if result['list'][i]['dt'] == final_date:
                weather = result['list'][i]

        return weather['weather'][0]['main']
    except:
        print(traceback.format_exc())