import React, { Component } from 'react';
import locations from './data/locations.json';
import mapstyles from './data/mapstyles.json';
import './App.css';

class App extends Component {
  state = {
    locations: [],
    styles: [],
    map: {},
    infowindow: {},
    toggleMenu: false,
    borough: 'all',
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
    window.bounceMarker = this.bounceMarker
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
        icon: '',
        labelContent: '<i class="fas fa-map-marker-alt" style="color:#F7F7F7;"></i>',
        labelAnchor: new window.google.maps.Point(22, 50)
      })

      marker.addListener('click', function() {
        window.bounceMarker(location)
      })

      location.marker = marker
      return null
    })

    this.setState({
      locations: locations,
      map: map,
      infowindow: infowindow
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
        locations: locations,
        borough: 'all'
      }, this.showMarkers)
    } else {
      this.setState({
        locations: locations.filter(location => location.neighborhood === borough),
        borough: borough
      }, this.showMarkers)
    }
  }

  hideMarkers = () => {
    var locations = this.state.locations
    locations.map(location => {
      location.marker.setMap(null)
      location.marker.setAnimation(null)
    })
    this.setState({
      locations: locations
    })
  }

  showMarkers = () => {
    var map = this.state.map
    var locations = this.state.locations
    var bounds = new window.google.maps.LatLngBounds()
    locations.map(location => {
      bounds.extend(location.position)
      location.marker.setAnimation(window.google.maps.Animation.DROP)
      window.setTimeout(function() {
        location.marker.setMap(map)
      }, 1000)
      return null
    })
    map.fitBounds(bounds)
    this.setState({
      locations: locations,
      map: map
    })
  }

  searchVenue = (location) => {
    var point = location.position
    var query = point.lat + ',' + point.lng
    var venueDetailsURL = null
    var id = null
    var url = `https://api.foursquare.com/v2/venues/explore?client_id=QS3H514QHDPTUOALBKTXWKXADRNN4OZBWQCLM5YNMIXZZNFI&client_secret=PCQ2V4XHFQ2K03OTZ522OJ2ZVLARL4KIEBR5M4LJSY1TLTIA&v=20180323&ll=${query}`

    fetch(url)
      .then(response => response.json())
      .then(data => id = data.response.groups[0].items[0].venue.id)
      .then(id => {
        venueDetailsURL = `https://api.foursquare.com/v2/venues/${id}?client_id=QS3H514QHDPTUOALBKTXWKXADRNN4OZBWQCLM5YNMIXZZNFI&client_secret=PCQ2V4XHFQ2K03OTZ522OJ2ZVLARL4KIEBR5M4LJSY1TLTIA&v=20180323`
        fetch(venueDetailsURL)
          .then(response => response.json())
          .then(data => {
            this.addedInfo(location, data)
          })
        })
        //.catch(error => console.log(error))
      .catch(error => console.log(error))

  }

  addedInfo = (location, data) => {
    var locations = this.state.locations
    var infowindow = this.state.infowindow
    var venue = data.response.venue
    var image = venue.bestPhoto
    infowindow.setContent(`
      <div id="added-info">
      <div>${location.name}</div>
      <div>${venue.hours.status}</div>
      <div><a href="${location.url}">Visit their website</a></div>
      <div><img src="${image.prefix + image.width + image.suffix}" alt="${location.name}" height="auto"></div>
      </div>
    `)

    infowindow.addListener('closeclick', function() {
      locations.filter(l => l.name = location.name).map(location => {
        location.marker.setAnimation(null)
        infowindow.setContent(null)
      })
    })
  }

  openMenu = () => {
    var infowindow = this.state.infowindow
    infowindow.close()
    // and set marker animation to null
    this.setState({
      toggleMenu: true
    })
  }

  closeMenu = () => {
    let select = window.document.getElementById('neighborhoods-select')
    select.focus()
    this.setState({
      toggleMenu: false
    })
  }

  bounceMarker = (location) => {
    var marker = location.marker
    var map = this.state.map
    var infowindow = this.state.infowindow
    infowindow.setContent(null)

    var locations = this.state.locations
    locations.map(location => {
      location.marker.setAnimation(null)
      if (location.marker === marker) {
        location.marker.setAnimation(window.google.maps.Animation.BOUNCE)
        infowindow.setContent(`<div>${location.name}</div>`)
        infowindow.open(map, marker)
      }
    })

    this.setState({
      locations: locations,
      toggleMenu: false
    }, this.searchVenue(location))
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <i className="fas fa-bars" id="menu" onClick={() => this.openMenu()}></i>
          <h1>
            Kid Friendly Places In NYC
          </h1>
        </header>
        <main>
          {this.state.toggleMenu === true &&
          (<section id="sidebar-container">
            <div id="sidebar">
              <select value={this.state.borough} aria-label="filter locations by neighborhood" id="neighborhoods-select" onChange={(event) => this.filterLocales(event.target.value)}>
                <option value="all">All Neighborhoods</option>
                <option value="brooklyn">Brooklyn</option>
                <option value="bronx">The Bronx</option>
                <option value="manhattan">Manhattan</option>
                <option value="staten island">Staten Island</option>
                <option value="queens">Queens</option>
              </select>

              <ul id="list-locales">
                {this.state.locations.map(location => (
                  <li key={location.name}><button className="button-link" onClick={() => this.bounceMarker(location)}>{location.name}</button></li>
                ))}
              </ul>
            </div>
            <div id="sidebar-overlay" onClick={() => this.closeMenu()}>
            </div>
          </section>)}

          <section id="map-container">
            <div id="map" role="application" aria-roledescription="map" aria-label="map of new york city attractions"></div>
          </section>

        </main>
      </div>
    );
  }
}

export default App;
