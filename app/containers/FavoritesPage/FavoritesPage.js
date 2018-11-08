/*
 * FavoritesPage
 *
 * List all the favorites
 */
import React from 'react';
import { Helmet } from 'react-helmet';
import './style.scss';

export default class FavoritesPage extends React.Component {
  // eslint-disable-line react/prefer-stateless-function

  // Since state and props are static,
  // there's no need to re-render this component
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div className="favorites-page">
        <Helmet>
          <title>Favorites Page</title>
          <meta
            name="description"
            content="Favorites page of React.js Weather application"
          />
        </Helmet>
        <h1>List of Favorites</h1>
      </div>
    );
  }
}
