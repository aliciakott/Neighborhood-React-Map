import React, { Component } from 'react';
import locations from './data/locations.json';
import mapstyles from './data/mapstyles.json';
import './App.css';

class App extends Component {
  state = {
    locations: [],
    map: {},
    styles: [],
    modalOpen: false,
    events: []
  }

  componentDidMount() {
    this.setState({
      locations: locations,
      mapstyles: mapstyles
    }, this.renderMap)
  }

  renderMap = () => {
    window.initMap = this.initMap
    this.initScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyB1hMr_sGWDl_e8bK7Fg6YpCrO-eTbIz0E&callback=initMap')
  }

  initMap = () => {
    let locations = this.state.locations
    let styles = this.state.mapstyles
    let infowindow = new window.google.maps.InfoWindow()
    let map = new window.google.maps.Map(
      document.getElementById('map'), {
        center: {lat: 40.7128, lng: -74.0060},
        zoom: 10,
        maxZoom: 15,
        mapTypeControl: false,
        styles: styles
      })

    locations.map(location => {
      let marker = new window.google.maps.Marker({
        position: location.position,
        animation: window.google.maps.Animation.DROP
      })
      marker.addListener('click', function() {
        marker.setAnimation(window.google.maps.Animation.BOUNCE)
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

  filterLocales = (borough) => {
    this.hideMarkers()
    if (borough === 'all') {
      this.setState({
        locations: locations
      }, this.showMarkers)
    } else {
      this.setState({
        locations: locations.filter(location => location.neighborhood === borough)
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
      location.marker.setMap(map)
      bounds.extend(location.position)
      return null
    })
    map.fitBounds(bounds)
    this.setState({
      locations: locations,
      map: map
    })
  }

  searchEvents = (location) => {
    //this.searchEvents(location)
    var query = location.street.replace(/\s/g, '+').concat('+', location.cityState.replace(/\s/g, '+'))
    var locations = this.state.locations

    var test = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q="central%20park%20zoo"&api-key=f2da235b5a6241c4a20fc2346b73a111'
    var header = new Headers()
    var request = new Request(test, { method: 'GET', header })
    fetch(request).then(response => response.json())
      .then(data => console.log(data))

    locations.map((l) => {
      l.marker.setAnimation(null)
      if (l.name === location.name) {
        l.marker.setAnimation(window.google.maps.Animation.BOUNCE)
        this.setState({
          locations: locations
        })
      }
      return null
    })
  }

  openModal = () => {
    this.setState({
      modalOpen: true
    })
  }

  closeModal = () => {
    let select = window.document.getElementById('neighborhoods-select')
    select.focus()
    this.setState({
      modalOpen: false
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>
            Kid Friendly Places In NYC
          </h1>
        </header>
        <main>
          <section id="sidebar">
            <div id="">
              <select aria-label="filter locations by neighborhood" id="neighborhoods-select" onChange={(event) => this.filterLocales(event.target.value)}>
                <option value="all">All Neighborhoods</option>
                <option value="brooklyn">Brooklyn</option>
                <option value="bronx">The Bronx</option>
                <option value="manhattan">Manhattan</option>
                <option value="staten island">Staten Island</option>
                <option value="queens">Queens</option>
              </select>

              <ul id="list-locales">
                {this.state.locations.map(location => (
                  <li key={location.name}><button className="button-link" onClick={() => this.openModal()}>{location.name}</button></li>
                ))}
              </ul>
            </div>
          </section>

          <section id="map-container">
            <div id="map" role="application" aria-roledescription="map" aria-label="map of new york city attractions"></div>
          </section>

          <section>
          {this.state.modalOpen === true &&
            (<div id="modal-container">
              <div id="modal"><button onClick={() => this.closeModal()}>close window</button></div>
            </div>)
          }
          </section>
        </main>
      </div>
    );
  }
}

export default App;
