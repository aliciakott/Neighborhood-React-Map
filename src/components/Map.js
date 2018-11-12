import React, { Component } from 'react';

class Map extends Component {

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
    window.bounceMarker = this.props.bounceMarker
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


  render() {
    return (

    )
  }
}

export default Map
