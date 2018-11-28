import axios from 'axios';
import Immutable from 'immutable';
import * as convert from 'xml-js';

const FMI_API_KEY = 'acfc8a65-9ac2-45b6-95b9-c9524d711b36';
const CURRENTWEATHER_HISTORY_MINUTES = 30;
const STATIONS_HISTORY_MINUTES = 30;


// fmi::observations::weather::cities::simple
// fmi::forecast::hirlam::surface::point::simple

export function getForecast(location) {
  // console.log('weather-api getForecast location= ', location);
  const cleanedLocation = location.replace(/\s/g, '').split(',');
  const queryLocation = `${cleanedLocation[0]}`;
  // console.log('weather-api getForecast queryLocation= ', queryLocation);
  return axios({
    url: `http://data.fmi.fi/fmi-apikey/${FMI_API_KEY}/wfs?request=getFeature&storedquery_id=fmi::forecast::hirlam::surface::point::simple&place=${queryLocation}`,
    // url: `http://data.fmi.fi/fmi-apikey/${FMI_API_KEY}/wfs?request=getFeature&storedquery_id=fmi::forecast::hirlam::surface::point::simple&place=${'Oulu'}`, // Parainen ei mene läpi
    method: 'GET',
    responseType: 'text',
  })
    .then((apiRequest) => {
      const xml = apiRequest.data;
      const result = convert.xml2json(xml, { compact: true });
      const jsonData = JSON.parse(result);
      const IData = Immutable.fromJS(jsonData);
      const members = IData.getIn(['wfs:FeatureCollection', 'wfs:member']);

      let timebased = Immutable.Map();
      members.forEach((elem) => {
        const time = elem.getIn(['BsWfs:BsWfsElement', 'BsWfs:Time', '_text']);
        const param = elem.getIn(['BsWfs:BsWfsElement', 'BsWfs:ParameterName', '_text']);
        const value = elem.getIn(['BsWfs:BsWfsElement', 'BsWfs:ParameterValue', '_text']);
        const timeElem = timebased.get(time, Immutable.Map({ time }));
        timebased = timebased.set(time, timeElem.set(param, value));
      });
      return timebased.sortBy((v, k) => new Date(k));
    });
}

export function getCurrentWeather(fmisid) {
  const starttime = new Date();
  starttime.setMinutes(starttime.getMinutes() - CURRENTWEATHER_HISTORY_MINUTES);
  console.log('weather-api getCurrentWeather fmisid= ', fmisid);
  return axios({
    url: `http://data.fmi.fi/fmi-apikey/${FMI_API_KEY}/wfs?request=getFeature&storedquery_id=fmi::observations::weather::simple&fmisid=${fmisid}&starttime=${starttime.toISOString()}`,
    method: 'GET',
    responseType: 'text',
  })
    .then((apiRequest) => {
      const xml = apiRequest.data;
      const result = convert.xml2json(xml, { compact: true });
      const jsonData = JSON.parse(result);
      const IData = Immutable.fromJS(jsonData);
      const members = IData.getIn(['wfs:FeatureCollection', 'wfs:member']);

      let timebased = Immutable.Map();
      members.forEach((elem) => {
        const time = elem.getIn(['BsWfs:BsWfsElement', 'BsWfs:Time', '_text']);
        const param = elem.getIn(['BsWfs:BsWfsElement', 'BsWfs:ParameterName', '_text']);
        const value = elem.getIn(['BsWfs:BsWfsElement', 'BsWfs:ParameterValue', '_text']);
        const timeElem = timebased.get(time, Immutable.Map({ time }));
        timebased = timebased.set(time, timeElem.set(param, value));
      });

      return timebased.sortBy((v, k) => new Date(k));
    });
}

export function getStations() {
  const starttime = new Date();
  starttime.setMinutes(starttime.getMinutes() - STATIONS_HISTORY_MINUTES);
  return axios({
    url: `http://data.fmi.fi/fmi-apikey/${FMI_API_KEY}/wfs?request=getFeature&storedquery_id=fmi::ef::stations&starttime=${starttime.toISOString()}`,
    method: 'GET',
    responseType: 'text',
  })
    .then((apiRequest) => {
      const xml = apiRequest.data;
      const result = convert.xml2json(xml, { compact: true });
      const jsonData = JSON.parse(result);
      const IData = Immutable.fromJS(jsonData);
      const members = IData.getIn(['wfs:FeatureCollection', 'wfs:member']);

      const stations = members
        .map((elem) => {
          const fmisid = elem.getIn(['ef:EnvironmentalMonitoringFacility', 'gml:identifier', '_text']);
          const type = elem.getIn(['ef:EnvironmentalMonitoringFacility', 'ef:belongsTo', '_attributes', 'xlink:title'], null);
          const networkid = elem.getIn(['ef:EnvironmentalMonitoringFacility', 'ef:belongsTo', '_attributes', 'xlink:href'], 'networkid=0');
          const name = elem.getIn(['ef:EnvironmentalMonitoringFacility', 'ef:name', '_text']);

          return Immutable.Map({
            fmisid,
            type,
            networkid: networkid.match(/networkid=(\d+)/)[1],
            name: name.replace(' ', ', '),
          });
        })
        .filter((elem) => {
          const networkid = elem.get('networkid');
          return networkid === '224' || networkid === '121' || networkid === '0';
        })
        .sortBy((f) => f.get('name'));

      return stations;
    });
}

export function getStationsDetails(fmisid) {
  const starttime = new Date();
  starttime.setMinutes(starttime.getMinutes() - STATIONS_HISTORY_MINUTES);
  return axios({
    url: `http://data.fmi.fi/fmi-apikey/${FMI_API_KEY}/wfs?request=getFeature&storedquery_id=fmi::ef::stations&fmisid=${fmisid}&starttime=${starttime.toISOString()}`,
    method: 'GET',
    responseType: 'text',
  })
    .then((apiRequest) => {
      const xml = apiRequest.data;
      const result = convert.xml2json(xml, { compact: true });
      const jsonData = JSON.parse(result);
      const IData = Immutable.fromJS(jsonData);
      const IStation = IData.getIn(['wfs:FeatureCollection', 'wfs:member', 'ef:EnvironmentalMonitoringFacility']);

      return Immutable.Map({
        fmisid: IStation.getIn(['gml:identifier', '_text']),
        type: IStation.getIn(['ef:belongsTo', '_attributes', 'xlink:title'], 'Tuntematon'),
        networkid: IStation.getIn(['ef:belongsTo', '_attributes', 'xlink:href'], 'networkid=0').match(/networkid=(\d+)/)[1],
        name: IStation.getIn(['ef:name', '_text']).replace(' ', ', '),
      });
    });
}
