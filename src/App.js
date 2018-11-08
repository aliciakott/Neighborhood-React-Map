import React, { Component } from 'react';
import locations from './data/locations.json'
import './App.css';

class App extends Component {
  state = {
    locations : []
  }

  componentDidMount() {
    this.setState({
      locations: locations
    }, this.renderMap)
  }

  renderMap = () => {
    window.initMap = this.initMap
    this.initScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyB1hMr_sGWDl_e8bK7Fg6YpCrO-eTbIz0E&callback=initMap')
  }

  initMap = () => {
    let map = new window.google.maps.Map(
      document.getElementById('map'), {
        center: {lat: 39.9526, lng: -75.1652},
        zoom: 13,
        mapTypeControl: false
      })
    let infowindow = new window.google.maps.Infowindow()
    this.state.locations.map(location => {
      let marker = new window.google.maps.Marker({
        position: location.position,
        map: map
      })
      let content = location.name
      marker.addListener('click', function() {
        infowindow.setContent(content)
        infowindow.open(map, marker)
      })
    })
  }

  initScript = (url) => {
    const body = window.document.getElementsByTagName('body')[0]
    const script = window.document.createElement('script')
    script.src = url
    script.async = true
    script.defer = true
    body.appendChild(script)
  }

  filterLocales = (dropmenu) => {
    if (dropmenu === 'all') {
      this.setState({
        locations: locations
      })
    } else {
      this.setState({
        locations: locations.filter(location => location.neighborhood === dropmenu)
      })
    }
  }

  hideMarkers = () => {

  }

  showMarkers = () => {

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>
            Kid Friendy Places in Philadelphia
          </h1>
        </header>
        <main>
          <section id="location-selection">
            <div id="">
              <select id="" onChange={(event) => this.filterLocales(event.target.value)}>
                <option value="all">All Neighborhoods</option>
                <option value="center city">Center City</option>
                <option value="south jersey">South Jersey</option>
                <option value="west philadelphia">West Philadelphia</option>
              </select>
            </div>

            <div>
              <ul id="list-locales">
                {this.state.locations.map(location => (
                  <li key={location.name}>{location.name}</li>
                ))}
              </ul>
            </div>
          </section>

          <section id="map-container">
            <div id="map"></div>
            <div id="added-info"></div>
          </section>
        </main>
      </div>
    );
  }
}

export default App;
