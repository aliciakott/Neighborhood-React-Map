import React from 'react'
import PropTypes from 'prop-types'

function SideBar(props) {
  const {locations, filter, closeMenu, bounceMarker, borough} = props

  // JSX map() function loops through the locations array and creates a new list item and button
  return (
    <section id="sidebar-container">
      <div id="sidebar">
        <select value={borough} aria-label="filter locations by neighborhood" id="neighborhoods-select" onChange={(event) => filter(event.target.value)}>
          <option value="all">All Neighborhoods</option>
          <option value="brooklyn">Brooklyn</option>
          <option value="bronx">The Bronx</option>
          <option value="manhattan">Manhattan</option>
          <option value="staten island">Staten Island</option>
          <option value="queens">Queens</option>
        </select>

        <ul id="list-locales">
          {locations.map(location => (
            <li key={location.name}><button className="button-link" onClick={() => bounceMarker(location)}>{location.name}</button></li>
          ))}
        </ul>
      </div>

      <div id="sidebar-overlay" onClick={() => closeMenu()}>
      </div>
    </section>
  )
}

SideBar.propTypes = {
  // verifies that the props are the correct data type
  borough: PropTypes.string.isRequired,
  locations: PropTypes.array.isRequired,
  bounceMarker: PropTypes.func.isRequired,
  closeMenu: PropTypes.func.isRequired,
  filter: PropTypes.func.isRequired
}

export default SideBar
