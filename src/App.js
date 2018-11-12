import React, { Component } from 'react';
import locations from './data/locations.json';
import mapstyles from './data/mapstyles.json';
import SideBar from './components/SideBar'
import './App.css';

class App extends Component {
  state = {
    locations: [],
    styles: [],
    map: {},
    infowindow: {},
    toggleMenu: false,
    borough: 'all',
    //events: []
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

  initScript = (url) => {
    const body = window.document.getElementsByTagName('body')[0]
    const script = window.document.createElement('script')
    script.src = url
    script.async = true
    script.defer = true
    body.appendChild(script)
  }

  initMap = () => {
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
    this.setState({
      map: map,
      infowindow: infowindow
    }, this.initMarkers)
  }

  initMarkers = () => {
    window.bounceMarker = this.bounceMarker
    let locations = this.state.locations
    locations.map(location => {
      let marker = new window.google.maps
        .Marker({ position: location.position })

      marker.addListener('click',
        () => window.bounceMarker(location))

      location.marker = marker
      return null
    })
    this.setState({
      locations: locations,
    }, this.showMarkers)
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

  hideMarkers = () => {
    var locations = this.state.locations
    locations.map(location => {
      location.marker.setMap(null)
      location.marker.setAnimation(null)
      return null
    })
    this.setState({
      locations: locations
    })
  }

  bounceMarker = (location) => {
    var marker = location.marker
    var map = this.state.map
    var infowindow = this.state.infowindow
    var locations = this.state.locations

    locations.map(location => {
      location.marker.setAnimation(null)
      if (location.marker === marker) {
        location.marker.setAnimation(window.google.maps.Animation.BOUNCE)
        infowindow.setContent(`
          <div>${location.name}</div>
          <div><a href="${location.url}">Visit their website</a></div>`)
        infowindow.open(map, marker)
        infowindow.addListener('closeclick', () => {
          location.marker.setAnimation(null)
        })
      }
      return null
    })

    this.setState({
      locations: locations,
      toggleMenu: false
    }, this.searchVenue(location))
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
    var infowindow = this.state.infowindow
    var venue = data.response.venue

    if (venue !== undefined) {
      var image = venue.bestPhoto
      infowindow.setContent(`
        <div>${location.name}</div>
        <div>${venue.hours.status}</div>
        <div><a href="${location.url}">Visit their website</a></div>
        <div id="added-info"><img src="${(image.prefix + image.width + image.suffix)}" alt="${location.name}" id="added-info-img"></div>
      `)
    }
    this.setState({
      infowindow: infowindow
    })
  }

  toggleSwitch = () => {
    let menu = this.state.toggleMenu
    if (menu === true) {
      this.closeMenu()
    } else {
      this.openMenu()
    }
  }

  openMenu = () => {
    let infowindow = this.state.infowindow
    infowindow.close()

    let locations = this.state.locations
    locations.map(location => {
      location.marker.setAnimation(null)
      return null
    })

    this.setState({
      locations: locations,
      toggleMenu: true
    })
  }

  closeMenu = () => {
    let menu = window.document.getElementById('menu')
    menu.focus()
    this.setState({
      toggleMenu: false
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <button aria-label="menu button, click for list view" id="menu" onClick={() => this.toggleSwitch()}><i className="fas fa-bars"></i></button>
          <h1>
            Kid Friendly Places In NYC
          </h1>
        </header>
        <main>
          {this.state.toggleMenu === true && (
          <SideBar
            locations={this.state.locations}
            filter={this.filterLocales}
            closeMenu={this.closeMenu}
            bounceMarker={this.bounceMarker}
            borough={this.state.borough} />
          )}

          <section id="map-container">
            <div id="map" role="application" aria-roledescription="map" aria-label="map of new york city attractions"></div>
          </section>

        </main>
      </div>
    );
  }
}

export default App;
