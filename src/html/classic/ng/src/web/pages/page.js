/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import glamorous from 'glamorous';

import logger from '../../log.js';
import {is_defined} from '../../utils.js';

import PropTypes from '../proptypes.js';

import MenuBar from '../components/bar/menubar.js';

import StickyContainer from '../components/sticky/container.js';

import Footer from '../components/structure/footer.js';
import Header from '../components/structure/header.js';
import Main from '../components/structure/main.js';

const log = logger.getLogger('web.page');

const Div = glamorous.div({
  height: '100%',
});

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {};
  }

  componentDidMount() {
    let {gmp} = this.context;

    gmp.user.currentCapabilities().then(response => {
      let capabilities = response.data;
      log.debug('User capabilities', capabilities);
      this.setState({capabilities});
    });
  }

  getChildContext() {
    return {
      capabilities: this.state.capabilities,
    };
  }

  render() {
    let {children} = this.props;
    let {capabilities} = this.state;

    if (!is_defined(capabilities)) {
      // only show content after caps have been loaded
      // this avoids ugly re-rendering of parts of the ui (e.g. the menu)
      return null;
    }

    return (
      <Div>
        <Header/>
        <StickyContainer>
          <MenuBar/>
          <Main>
            {children}
          </Main>
          <Footer/>
        </StickyContainer>
      </Div>
    );
  }
}

Page.childContextTypes = {
  capabilities: PropTypes.capabilities,
};

Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default Page;

// vim: set ts=2 sw=2 tw=80: