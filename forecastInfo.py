from datetime import datetime
import traceback
import requests
import dbinfo


city = dbinfo.CITY
api_key = dbinfo.API_KEY
units = dbinfo.UNITS
station = f"https://pro.openweathermap.org/data/2.5/forecast/climate?q={city}&appid={api_key}&units={units}"


# asks the api for a forecast based on the selected time of the user
def main_weather(user_input):
    try:
        # Query to OWM to ask for a 30-Day forecast
        r = requests.get(station)
        result = r.json()

        # Edit the string of predict_dt and convert it to timestamp()
        date = user_input['predict_dt']
        date = date[0:10]
        datetime_object = datetime.strptime(date, '%Y-%m-%d')
        datetime_object = datetime_object.replace(hour=13, minute=0)
        final_date = int(datetime_object.timestamp())

        # Returning the main weather description
        dictionary_weather = dict()
        for key in range(len(result['list'])):
            if result['list'][key]['dt'] == final_date:
                if 'rain' in result['list'][key]:
                    dictionary_weather = {'speed': result['list'][key]['speed'], 'temp': result['list'][key]['temp']['day'],
                                          'rain': result['list'][key]['rain']}
                else:
                    dictionary_weather = {'speed': result['list'][key]['speed'], 'temp': result['list'][key]['temp']['day']}

        if 'rain' in dictionary_weather.keys():
                weather = [dictionary_weather['speed'], dictionary_weather['rain'],
                                   dictionary_weather['temp']]
        else:
                weather = [dictionary_weather['speed'], 0.0, dictionary_weather['temp']]

        return weather

    except:
        print(traceback.format_exc())