import React, { Component } from 'react';
import locations from './data/locations.json';
import mapstyles from './data/mapstyles.json';
import SideBar from './components/SideBar'
import './App.css';

class App extends Component {
  state = {
    locations: null,
    styles: null,
    map: null,
    infowindow: null,
    toggleMenu: false,
    borough: 'all',
  }

  componentDidMount() {
    // grabbing the locations and styles from their json files and putting in the state
    this.setState({
      locations: locations,
      mapstyles: mapstyles
    }, this.renderMap)
  }

  renderMap = () => {
    // assinging the initMap to the global method so React can find it
    window.initMap = this.initMap
    this.initScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyB1hMr_sGWDl_e8bK7Fg6YpCrO-eTbIz0E&callback=initMap')
  }

  initScript = (url) => {
    // creating a script tag for the google map and appending it to the body tag
    const body = window.document.getElementsByTagName('body')[0]
    const script = window.document.createElement('script')
    script.src = url
    script.async = true
    script.defer = true
    script.onerror = () => window.alert('There was a problem loading the script. Please refresh the page.')
    body.appendChild(script)
  }

  initMap = () => {
    // initializing the map
    const styles = this.state.mapstyles
    let infowindow = new window.google.maps.InfoWindow()
    let map = new window.google.maps.Map(
      document.getElementById('map'), {
        center: {lat: 40.7128, lng: -74.0060},
        zoom: 10,
        maxZoom: 15,
        mapTypeControl: false,
        styles: styles
      })

    window.gm_authFailure = () => window.alert('Authorization Failed. Please refresh the page or try again later.')

    this.setState({
      map: map,
      infowindow: infowindow
    }, this.initMarkers)
  }

  initMarkers = () => {
    // had a problem with closures. couldn't define. this.bounceMarker inside an event listener,
    // so I added it to the state
    window.bounceMarker = this.bounceMarker

    // creating a marker for every default location in the state and adding an event listener to each
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
    // loops through each location and set's the marker's map to the map div in the DOM
    // also resets the map's bounds to zoom in and out depending on which markers are in view
    let map = this.state.map
    let locations = this.state.locations
    let bounds = new window.google.maps.LatLngBounds()

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
    // loops through all markers and set's their map to null
    let locations = this.state.locations
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
    // takes the individual location and changes the animation type of its marker
    // to bounce, opens the infowindow on that marker, and adds an event listener
    // to the infowindow so that the animation stops when it is closed
    let marker = location.marker
    let map = this.state.map
    let infowindow = this.state.infowindow
    let locations = this.state.locations

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
      infowindow: infowindow,
      toggleMenu: false
    }, this.searchVenue(location))
  }

  filterLocales = (borough) => {
    // changes the available place markers on the map and list view, depending on the selected borough
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
    // grabs the coordinates and location name of the selected place
    // and formats it into a url for an API call
    let point = location.position
    let query = point.lat + ',' + point.lng
    let name = location.name.replace(/\s/g, '+')
    let venueDetailsURL = null
    let id = null
    let url = `https://api.foursquare.com/v2/venues/explore?client_id=QS3H514QHDPTUOALBKTXWKXADRNN4OZBWQCLM5YNMIXZZNFI&client_secret=PCQ2V4XHFQ2K03OTZ522OJ2ZVLARL4KIEBR5M4LJSY1TLTIA&v=20180323&limit=1&intent=match&name=${name}&ll=${query}`

    // fetches the call and formats the response for addedInfo()
    fetch(url)
      .then(response => response.json())
      .then(data => id = data.response.groups[0].items[0].venue.id)
      .then(id => {
        venueDetailsURL = `https://api.foursquare.com/v2/venues/${id}?client_id=QS3H514QHDPTUOALBKTXWKXADRNN4OZBWQCLM5YNMIXZZNFI&client_secret=PCQ2V4XHFQ2K03OTZ522OJ2ZVLARL4KIEBR5M4LJSY1TLTIA&v=20180323`
        return fetch(venueDetailsURL)
      })
      .then(response => response.json())
      .then(data => this.addedInfo(location, data))
      .catch(error => {
        console.log(error)
        return window.alert('Error: Data request failed. Please try again later.')
      })
  }

  addedInfo = (location, data) => {
    let infowindow = this.state.infowindow
    let venue = data.response.venue

    // IF the response is valid, the infowindow is updated to include the additional content
    // otherwise the user is informed that no other information is currently available
    if (venue !== undefined) {
      let image = venue.bestPhoto
      infowindow.setContent(`
        <div>${location.name}</div>
        <div>${venue.hours.status}</div>
        <div><a href="${location.url}">Visit their website</a></div>
        <div id="added-info"><img src="${(image.prefix + image.width + image.suffix)}" alt="${location.name}" id="added-info-img"></div>
      `)
    } else {
      infowindow.setContent(`
        <div>${location.name}</div>
        <div>${location.street}, ${location.cityState}</div>
        <div><a href="${location.url}">Visit their website</a></div>
        <div>No information available, please check again later</div>
      `)
    }
    this.setState({
      infowindow: infowindow
    })
  }

  toggleSwitch = () => {
    // allows the user to toggle the sidebar's list view on and off
    let menu = this.state.toggleMenu
    if (menu === true) {
      this.closeMenu()
    } else {
      this.openMenu()
    }
  }

  openMenu = () => {
    // opens the sidebar and the list view. any markers that were currently selected
    // (and thus bouncing) has its animation set back to null and infowindow closed
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
    // removes the sidebar and overlay and sets the focus back to the menu button
    const menu = window.document.getElementById('menu')
    menu.focus()
    this.setState({
      toggleMenu: false
    })
  }

  render() {
    const { toggleMenu, locations, borough } = this.state
    return (
      <div className="App">
        <header className="App-header">
          <button aria-label="menu button, click for list view" id="menu" onClick={() => this.toggleSwitch()}><i className="fas fa-bars"></i></button>
          <h1>
            Kid Friendly Places In NYC
          </h1>
        </header>
        <main>
          {toggleMenu === true && (
          <SideBar
            locations={locations}
            filter={this.filterLocales}
            closeMenu={this.closeMenu}
            bounceMarker={this.bounceMarker}
            borough={borough} />
          )}

          <section id="map-container">
            <div id="map" role="application" aria-roledescription="map" aria-label="map of new york city attractions"></div>
          </section>
        </main>
        <footer>Images and venue hours provided by <a href="https://foursquare.com/developers/">Foursquare</a></footer>
      </div>
    );
  }
}

export default App;
