/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import * as Bs from 'react-bootstrap';
// import Autocomplete from 'react-autocomplete';
// import Select from 'react-select'; // test autocomplete with this
import AsyncSelect from 'react-select/lib/Async'; // test autocomplete with this
import './style.scss';
import * as weatherApi from '../App/weather-api';

// toimii
// const options = [
//   { value: 'chocolate', label: 'Chocolate' },
//   { value: 'strawberry', label: 'Strawberry' },
//   { value: 'vanilla', label: 'Vanilla' }
// ];

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

export default class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props, context) {
    super(props, context);
    // TEST->
    let storedClicks = 0;

    if (localStorage.getItem('clicks')) {
      // eslint-disable-next-line radix
      storedClicks = parseInt(localStorage.getItem('clicks'));
    } else {
      localStorage.setItem('clicks', 0);
    }

    
    // <- TEST
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    // this.numberList = this.numberList.bind(this);
    this.forecastList = this.forecastList.bind(this);

    this.state = {
      isLoading: false,
      text: '',
      temperature: '',
      items: [],
      value: '',
      selectedOption: null,
      clicks: storedClicks // TEST
    };
    this.click = this.click.bind(this);
  }

  // componentWillMount(nextProps, nextState) {
  //   localStorage.getItem('clicks') && this.setState({
  //     storedClicks: parseInt(localStorage.getItem('clicks'))      
  //   })
  //   // console.log('localstorage clicks=', localstoredClicks);
  // }


  click() {
    const newclick = this.state.clicks + 1;
    // console.log('this.state=', this.state);

    this.setState({ clicks: newclick });
    console.log('Click counter=', newclick);
    // Set it
    localStorage.setItem('clicks', newclick);
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


    this.setState({
      temperature: temp
    });


    setTimeout(() => {
      // Completed of async action, set loading state back
      this.setState({
        isLoading: false,
        items: temperaturesList
      });
    }, 2000);
  }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption });
    console.log('Option selected:', selectedOption);
  }

  // handleChange(e) {
  //   this.setState({ text: e.target.value });
  //   console.log('City= ', e.target.value);
  // }


  forecastList= () => {
    // const listItems = this.temperaturesList.map((t) =>
    const temperaturesList2 = this.state.items;
    console.log('templist2=', temperaturesList2);
    // toimii const temperaturesList = ['2018-10-27T11:00:00Z:', '2018-10-27T12:00:00Z:', '2018-10-27T13:00:00Z:', '2018-10-27T14:00:00Z:'];
    const listItems = Object.entries(temperaturesList2).map(([date, data]) => {
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

  // toggleFavorite() {
  //  //let ls = 
  // }

  render() {
    const { isLoading } = this.state;
    const { selectedOption } = this.state;

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

            <AsyncSelect
              value={selectedOption}
              onChange={this.handleChange}
              // eslint-disable-next-line no-use-before-define
              loadOptions={getWeatherStations}
            />

            {/* <Select
              value={selectedOption}
              onChange={this.handleChange}
              options={options}// toimii
              // options={this.weatherStations}
              // options={!selectedOption ? this.weatherStations() : null}
            /> */}

            <Bs.Button
              style={{ marginLeft: 20 }}
              bsStyle="primary"
              disabled={isLoading}
              onClick={!isLoading ? this.handleClick : null}
            >
              {isLoading ? 'Loading...' : 'Get weather'}
            </Bs.Button>
            <Bs.Button
              style={{ marginLeft: 20 }}
              bsStyle="primary"
              disabled={isLoading}
              // onClick={!isLoading ? this.weatherStations : null}
            >
              {'Save to Favorites'}
            </Bs.Button>

          </section>
          <div>
            <h2>Click the button a few times and refresh page</h2>
            <button onClick={this.click}>Click me</button> Counter {this.state.clicks}
          </div>
          {this.state.temperature && <section style={{ fontSize: 20 }}>Current weather at {this.state.text} is {this.state.temperature} celsius</section>}
          {this.state.temperature && <section>Weather Forecast: {this.forecastList()}</section> }
        </div>
      </article>
    );
  }
}
