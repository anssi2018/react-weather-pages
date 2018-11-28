/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import * as Bs from 'react-bootstrap';
import AsyncSelect from 'react-select/lib/Async'; // test autocomplete with this
// import AsyncSelect from 'react-select';
import Moment from 'moment';
// import Async from 'react-select/lib/Async';
import './style.scss';
import * as weatherApi from '../App/weather-api';


// eslint-disable-next-line no-underscore-dangle
const _stations = {
  result: null,
};

async function getWeatherStations(str) {
  // get Weather stations from Api only once
  if (!_stations.result) {
    _stations.result = await weatherApi.getStations();
  }
  const stations = _stations.result;
  console.log('stations=', stations);
  str = str.toLowerCase();
  const stationListItems = stations
    .filter((item) => {
      const name = item.get('name').toLowerCase();
      return name.search(str) === 0; // >-1 search from the middle, 0 search from beginning
    })
    .map((item) => {
      const name = item.get('name');
      const id = item.get('fmisid');
      return { value: id, label: name };
    });

  console.log('stationListItems=', stationListItems);
  return stationListItems;
}

// Save to Favorites/Remove from Favorites button
// FavoritesPage uses this as well for removing favorite cities
export function clickSaveToFavorites(selectedOption) {
  if (selectedOption != null) {
    const newFavorite = selectedOption;

    // console.log('new favorite city= ', newFavorite.label);
    // console.log('new favorite value= ', newFavorite.value);
    const oldItems = JSON.parse(localStorage.getItem('favorite') || '[]');

    // returns favorite value and label if found from oldItems list
    const result = oldItems.filter((obj) => obj.value === newFavorite.value)[0];
    console.log('result= ', result);

    if (result) {
      console.log('City is in a list, Removing City');
      const updatedList = oldItems.filter((item) => item.value !== newFavorite.value);

      console.log('updatedList= ', updatedList);
      localStorage.setItem('favorite', JSON.stringify(updatedList));

      return true;
    }

    console.log('City not found, Saving...');
    if (newFavorite !== '') { // You cant save empty string
      oldItems.push(newFavorite); // add new favorite to list
      localStorage.setItem('favorite', JSON.stringify(oldItems));

      // favoritesaved={this.state.isAlreadySaved}

      return true;
    }
  }
  return false;
}

function hoursWithLeadingZeros(dt) {
  return (dt.getHours() < 10 ? '0' : '') + dt.getHours();
}

async function getWeatherData(selectedOption) {
  // console.log('selectedOption= ', selectedOption);
  if (selectedOption !== null) {
    const city = selectedOption;
    // console.log('HomePage city= ', city.label);

    const apiCall = await weatherApi.getForecast(city.label);
    const temperaturesList = apiCall.toJS();
    // console.log('temperaturesList=', temperaturesList);

    return temperaturesList;
  }
  return {};
}

function parseTemperatureFromList(temperaturesList) {
  // if (temperaturesList !== {}) { THIS DOES NOT WORK!
  if (Object.keys(temperaturesList).length !== 0) {
    const today = new Date();
    const hours = hoursWithLeadingZeros(today);

    const formatteddate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}T${hours}:00:00Z`;

    // console.log('time=', hours);
    // console.log('formatteddate=', formatteddate);

    // const temperature = apiCall.getIn(['2018-10-26T20:00:00Z', 'Temperature']);
    const temp = temperaturesList[formatteddate].Temperature;
    // console.log('temperature=', temp);

    // const temp2 = temperaturesList[formatteddate].time;
    // console.log('time2=', temp2);

    return temp;
  }
  return {};
}


export default class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props, context) {
    super(props, context);

    this.handleChange = this.handleChange.bind(this);
    this.forecastList = this.forecastList.bind(this);

    this.state = {
      isLoading: false,
      temperature: '',
      items: [],
      selectedOption: null,
      isAlreadySaved: false
    };
  }

  // drop down list change
  handleChange = (selectedOption) => {
    this.setState({ selectedOption, isAlreadySaved: false, temperature: '' });

    const oldItems = JSON.parse(localStorage.getItem('favorite') || '[]');

    // returns favorite value and label if found from oldItems list
    const result = oldItems.filter((obj) => obj.value === selectedOption.value)[0];

    if (result) {
      console.log('City is already in a localStorage list, button color-> danger');
      this.setState({
        isAlreadySaved: true // used for changing button color
      });
    } else {
      console.log('City not found from localStorage list, button color -> primary');
      this.setState({
        isAlreadySaved: false // used for changing button color
      });
    }
  }

  forecastList= () => {
    const temperaturesList2 = this.state.items;
    console.log('templist2=', temperaturesList2);

    // toimii const temperaturesList = ['2018-10-27T11:00:00Z:', '2018-10-27T12:00:00Z:', '2018-10-27T13:00:00Z:', '2018-10-27T14:00:00Z:'];
    const listItems = Object.entries(temperaturesList2).map(([date, data]) => {
      console.log(date, data.Temperature);

      date = new Date(date);

      const findate = Moment(date).format('DD-MM-YYYY');
      // console.log('ftime=', Moment(date).format('hh:mm'));
      const shorttime = Moment(date).format('hh:mm');

      // moment().format('MMMM Do YYYY, h:mm:ss a');
      // Moment(data.used).format("DD/MM/YYYY hh:mm")
      // ftime = Moment(ftime, 'hh:mm');

      return <li key={date.toString()}>Date: {findate} Time: {shorttime} Temperature: {data.Temperature} celsius</li>;
    });
    return (
      <ul>{listItems}</ul>
    );
  }


  render() {
    const { isLoading } = this.state;
    const { selectedOption } = this.state;
    const bsStyleDanger = 'danger';
    const bsStylePrimary = 'primary';
    const btntxtSave = 'Save to Favorites';
    const btntxtRemove = 'Remove from Favorites';

    const handleClick = async () => {
      const temperaturesList = await getWeatherData(this.state.selectedOption);
      const temp = parseTemperatureFromList(temperaturesList);

      this.setState({
        temperature: temp,
        items: temperaturesList,
      });
    };

    return (
      <article>
        <Helmet>
          <title>Home Page</title>
          <meta name="description" content="A React.js Weather application homepage" />
        </Helmet>
        <h1>Weather page</h1>
        <div className="home-page">
          <section className="centered">
            {/* <input style={{ marginRight: 20 }} type="text" name="city" placeholder="City..." onChange={this.handleChange}></input> */}

            <AsyncSelect
              value={selectedOption}
              placeholder="Select City..."
              onChange={this.handleChange}
              loadOptions={getWeatherStations}
            />

            <Bs.Button
              style={{ marginLeft: 20, marginTop: 20 }}
              bsStyle="primary"
              disabled={isLoading}
              onClick={() => {
                // console.log('temp=', temp);
                if (handleClick(this.state.selectedOption)) {
                  this.setState({
                    selectedOption: this.state.selectedOption
                  });
                }
              }}
            >
              {isLoading ? 'Loading...' : 'Get weather'}
            </Bs.Button>
            <Bs.Button
              style={{ marginLeft: 20, marginTop: 20 }}
              bsStyle={this.state.isAlreadySaved ? bsStyleDanger : bsStylePrimary}
              disabled={isLoading}
              onClick={() => {
                if (clickSaveToFavorites(this.state.selectedOption)) {
                  this.setState({
                    isAlreadySaved: !this.state.isAlreadySaved
                  });
                }
              }}
              // favoritesaved={this.state.isAlreadySaved} // favorites page -> props.favoriteSaved
            >
              {this.state.isAlreadySaved ? btntxtRemove : btntxtSave}
            </Bs.Button>

          </section>
          {console.log('state.temperature', this.state.temperature)}
          {/* {this.state.temperature && <section style={{ fontSize: 20 }}>Current weather at {selectedOption.label} is {this.state.temperature} celsius</section>} */}
          {Object.keys(this.state.temperature).length !== 0 && <section style={{ fontSize: 20 }}>Current weather at {selectedOption.label} is {this.state.temperature} celsius</section>}
          {Object.keys(this.state.temperature).length !== 0 && <section><h1>Weather Forecast:</h1> {this.forecastList()}</section>}
        </div>
      </article>
    );
  }
}
