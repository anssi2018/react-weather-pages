/*
 * FavoritesPage
 *
 * List all the favorites
 */
import React from 'react';
import { Helmet } from 'react-helmet';
import * as Bs from 'react-bootstrap';
import Moment from 'moment';
import './style.scss';
import { clickSaveToFavorites } from '../HomePage/HomePage';
import * as weatherApi from '../App/weather-api';


export default class FavoritesPage extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.state = {
      temperature: '',
      favoritesList: JSON.parse(localStorage.getItem('favorite') || '[]'),
      items: [],
      selectedOption: null
    };
  }


  // eslint-disable-line react/prefer-stateless-function
  // Since state and props are static,
  // there's no need to re-render this component
  // shouldComponentUpdate() {
  //   return false;
  // }

  // eslint-disable-next-line class-methods-use-this
  hoursWithLeadingZeros(dt) {
    return (dt.getHours() < 10 ? '0' : '') + dt.getHours();
  }

  // List must be updated after City is removed
  updateFavoritesList() {
    this.setState({
      favoritesList: JSON.parse(localStorage.getItem('favorite') || '[]')
    });
  }

  // returns list of temperature forecast
  forecastList= () => {
    const temperaturesList2 = this.state.items;
    console.log('templist2=', temperaturesList2);

    const listItems = Object.entries(temperaturesList2).map(([date, data]) => {
      console.log(date, data.Temperature);

      date = new Date(date);

      const findate = Moment(date).format('DD-MM-YYYY');
      const shorttime = Moment(date).format('hh:mm');

      return <li key={date.toString()}>Date: {findate} Time: {shorttime} Temperature: {data.Temperature} celsius</li>;
    });
    return (
      <ul>{listItems}</ul>
    );
  }

  // Weather button
  async handleClick(item) {
    this.setState({
      selectedOption: item
    });

    if (item != null) {
      const city = item;
      const apiCall = await weatherApi.getForecast(city.label);
      const temperaturesList = apiCall.toJS();

      const today = new Date();
      const hours = this.hoursWithLeadingZeros(today);

      const formatteddate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}T${hours}:00:00Z`;

      // const temperature = apiCall.getIn(['2018-10-26T20:00:00Z', 'Temperature']);
      const temp = apiCall.getIn([formatteddate, 'Temperature']);

      // const temp2 = apiCall.getIn([formatteddate, 'time']);
      // console.log('time2=', temp2);

      this.setState({
        temperature: temp,
        items: temperaturesList,
      });
    }
  }

  render() {
    const favoritesList = this.state.favoritesList;
    const { selectedOption } = this.state;

    console.log('FavoritesPage state= ', favoritesList);

    return (
      <article>
        <div className="favorites-page">
          <Helmet>
            <title>Favorites Page</title>
            <meta
              name="description"
              content="Favorites page of React.js Weather application"
            />
          </Helmet>
          <h1>List of Favorites</h1>
          <div>
            {favoritesList.map((item, id) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={id}>
                <ul> {item.label}
                  <Bs.Button
                    style={{
                      background: 'blue',
                      marginLeft: 20,
                      borderRadius: 10,
                      color: 'white'
                    }}
                    onClick={() => {
                      // console.log('item**=', item);
                      this.handleClick(item);
                    }}
                  >
                  weather
                  </Bs.Button>
                  <Bs.Button
                    onClick={() => {
                      clickSaveToFavorites(item); // removes City
                      this.updateFavoritesList();
                    }}
                    style={{
                      marginLeft: 20,
                      backgroundColor: '#EA1313',
                      color: 'white',
                      borderRadius: 10
                    }}
                  >
                  remove
                  </Bs.Button>
                </ul>
              </div>))}
            {Object.keys(this.state.temperature).length !== 0 && <section style={{ fontSize: 20 }}>Current weather at {selectedOption.label} is {this.state.temperature} celsius</section>}
            {Object.keys(this.state.temperature).length !== 0 && <section><h1>Weather Forecast:</h1> {this.forecastList()}</section>}
          </div>
        </div>
      </article>
    );
  }
}
