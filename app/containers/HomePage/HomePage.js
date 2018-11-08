/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import * as reactBootstrap from 'react-bootstrap';
import './style.scss';
import * as weatherApi from '../App/weather-api';


export default class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props, context) {
    super(props, context);

    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    // this.numberList = this.numberList.bind(this);
    this.forecastList = this.forecastList.bind(this);

    this.state = {
      isLoading: false,
      text: '',
      temperature: '',
      items: []

      // time: ''

    };
  }


  async handleClick() {
    this.setState({ isLoading: true });

    // const city = this.state.text;
    // console.log('state= ', this.state);

    const city = this.state.text;
    console.log('HomePage city= ', city);

    const apiCall = await weatherApi.getForecast(city);
    const temperaturesList = apiCall.toJS();
    console.log('temperaturesList=', temperaturesList);
    // console.log('HomePage handleClick apiCall= ', apiCall);

    const today = new Date();
    const formatteddate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}T${today.getHours()}:00:00Z`;
    console.log('time=', today.getHours());

    // const temperature = apiCall.getIn(['2018-10-26T20:00:00Z', 'Temperature']);
    const temp = apiCall.getIn([formatteddate, 'Temperature']);
    console.log('temperature=', temp);

    const temp2 = apiCall.getIn([formatteddate, 'time']);
    console.log('time2=', temp2);

    // const temp2 = apiCall.get();ei toimi

    // const tempArray = await weatherApi.getForecast

    this.setState({
      temperature: temp
      // time: temp2
    });


    setTimeout(() => {
      // Completed of async action, set loading state back
      this.setState({
        isLoading: false,
        items: temperaturesList
      });
    }, 2000);
  }

  handleChange(e) {
    this.setState({ text: e.target.value });
    console.log('City= ', e.target.value);
  }

  // toimii!
  // numberList = () => {
  //   const numbers = [1, 2, 3, 4, 5, 6, 7];
  //   const listItems = numbers.map((number) =>
  //     <li key={number.toString()}>{number}</li>
  //   );
  //   return (
  //     <ul>{listItems}</ul>
  //   );
  // }
  // eslint-disable-next-line class-methods-use-this
  async weatherStations() {
    const apiCall2 = await weatherApi.getStations();
    const wstations = apiCall2.toJS();
    const listItems = Object.entries(wstations).map(([ date, data ]) => {
      console.log('wstations=', data);
    });
    return (
      <ul>{listItems}</ul>
    );
  }

  // forecastList = () => {
  forecastList= () => {
    // const listItems = this.temperaturesList.map((t) =>
    const temperaturesList2 = this.state.items;
    console.log('templist2=', temperaturesList2);
    // toimii const temperaturesList = ['2018-10-27T11:00:00Z:', '2018-10-27T12:00:00Z:', '2018-10-27T13:00:00Z:', '2018-10-27T14:00:00Z:'];
    const listItems = Object.entries(temperaturesList2).map(([ date, data ]) => {
      console.log(date, data.Temperature);
      
      date = new Date(date);
      // String(date).split('+')[0];
      // const d = Object.date.split('T')[0];
      // console.log('date=', String(date).split(' '));

      // str.substring(0,tomorrow.toLocaleString().indexOf(':')-3);
      // date.substring(0, date.toLocaleString().indexOf(':') - 3);

      // console.log('date=', date.substring(0, date.toLocaleTimeString().indexOf(':') - 3));
      // date = dateTime.split(' ', 4).join(' ');
      // console.log('date=', String(date).split(' ', 5).join(' '));
      // console.log('date=', String(date).split(' ', 5).join(' '));
      // console.log('time=', String(date). );
      const ftime = data.time.split('T')[1].split('Z')[0];
      const fdate = data.time.split('T')[0];

      return <li key={date.toString()}>Date: {fdate} Time: {ftime} Temperature: {data.Temperature} celsius</li>;
      // return <li key={date.toString()}>{date.toLocaleTimeString('en-US', { hour12: false })} {data.Temperature} </li>;
    });
    return (
      <ul>{listItems}</ul>
    );
  }

  render() {
    const { isLoading } = this.state;

    return (
      <article>
        <Helmet>
          <title>Home Page</title>
          <meta name="description" content="A React.js Weather application homepage" />
        </Helmet>
        <h1>Weather page</h1>
        <div className="home-page">
          <section className="centered">

            <input style={{ marginRight: 20 }} type="text" name="city" placeholder="City..." onChange={this.handleChange}></input>

            <reactBootstrap.Button
              bsStyle="primary"
              disabled={isLoading}
              onClick={!isLoading ? this.handleClick : null}
            >
              {isLoading ? 'Loading...' : 'Get weather'}
            </reactBootstrap.Button>

          </section>
          {this.state.temperature && <section style={{ fontSize: 20 }}>Current weather at {this.state.text} is {this.state.temperature} celsius</section>}
          {this.state.temperature && <section>Weather Forecast: {this.forecastList()}</section> }
          {/* <section>{this.weatherStations()}</section> */}
        </div>
      </article>
    );
  }
}

