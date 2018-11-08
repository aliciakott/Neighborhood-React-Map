import React, { Component } from 'react';
import locations from './data/locations.json'
import './App.css';

class App extends Component {
  state = {
    locations: [],
    map: {},
    modalOpen: false,
    events: []
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
    let locations = this.state.locations
    let infowindow = new window.google.maps.InfoWindow()
    let map = new window.google.maps.Map(
      document.getElementById('map'), {
        center: {lat: 39.9526, lng: -75.1652},
        zoom: 13,
        mapTypeControl: false
      })

    locations.map(location => {
      let marker = new window.google.maps.Marker({
        position: location.position,
        animation: window.google.maps.Animation.DROP
      })
      marker.addListener('click', function() {
        infowindow.setContent(location.name)
        infowindow.open(map, marker)
      })
      location.marker = marker
      return null
    })

    this.setState({
      locations: locations,
      map: map
    }, this.showMarkers)
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
    this.hideMarkers()
    if (dropmenu === 'all') {
      this.setState({
        locations: locations
      }, this.showMarkers)
    } else {
      this.setState({
        locations: locations.filter(location => location.neighborhood === dropmenu)
      }, this.showMarkers)
    }
  }

  hideMarkers = () => {
    var locations = this.state.locations
    locations.map(location => location.marker.setMap(null))
    this.setState({
      locations: locations
    })
  }

  showMarkers = () => {
    var map = this.state.map
    var locations = this.state.locations
    var bounds = new window.google.maps.LatLngBounds()
    locations.map(location => {
      location.marker.setMap(this.state.map)
      bounds.extend(location.position)
    })
    map.fitBounds(bounds)
    this.setState({
      locations: locations
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>
            Kid Friendy Places in the Greater Philadelphia Area
          </h1>
        </header>
        <main>
          <section id="sidebar">
            <div id="">
              <select aria-label="filter locations by neighborhood" id="neighborhoods-select" onChange={(event) => this.filterLocales(event.target.value)}>
                <option value="all">All Neighborhoods</option>
                <option value="center city">Center City</option>
                <option value="south jersey">South Jersey</option>
                <option value="west philadelphia">West Philadelphia</option>
              </select>

              <ul id="list-locales">
                {this.state.locations.map(location => (
                  <li key={location.name}>{location.name}</li>
                ))}
              </ul>
            </div>
          </section>

          <section id="map-container">
            <div id="map" role="application" aria-roledescription="map" aria-label="map of greater philadelphia"></div>
          </section>

          <section id="modal-container">
            <div id="modal"></div>
          </section>
        </main>
      </div>
    );
  }
}

export default App;
