/* Copyright (C) 2018 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import logger from 'gmp/log';

import {first} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import Icon from 'web/components/icon/icon';

import IconDivider from 'web/components/layout/icondivider';

import TriggerAlertDialog from 'web/pages/reports/triggeralertdialog';

import AlertComponent from 'web/pages/alerts/component';

import {
  loadReportComposerDefaults,
  renewSessionTimeout,
  saveReportComposerDefaults,
} from 'web/store/usersettings/actions';

import {getReportComposerDefaults} from 'web/store/usersettings/selectors';

const log = logger.getLogger('web.report.alertactions');

class AlertActions extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      alerts: [],
      showTriggerAlertDialog: false,
    };

    this.handleAlertChange = this.handleAlertChange.bind(this);
    this.handleTriggerAlert = this.handleTriggerAlert.bind(this);
    this.onAlertCreated = this.onAlertCreated.bind(this);
    this.handleOpenTriggerAlertDialog = this.handleOpenTriggerAlertDialog.bind(this); /* eslint-disable-line max-len */
    this.handleCloseTriggerAlertDialog = this.handleCloseTriggerAlertDialog.bind(this); /* eslint-disable-line max-len */
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  componentDidMount() {
    const {gmp} = this.props;
    this.props.loadReportComposerDefaults();
    gmp.alerts.getAll().then(response => {
      const {data: alerts} = response;
      const alertId = first(alerts).id;
      this.setState({
        alerts,
        alertId,
      });
    });
  }

  handleAlertChange(alertId) {
    this.setState({alertId});
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  handleTriggerAlert(state) {
    const {
      alertId,
      applyOverrides,
      includeNotes,
      includeOverrides,
      storeAsDefault,
    } = state;
    const {
      filter,
      gmp,
      report,
      showErrorMessage,
      showSuccessMessage,
    } = this.props;

    filter.set('notes', includeNotes);
    filter.set('overrides', includeOverrides);
    filter.set('apply_overrides', applyOverrides);

    this.handleInteraction();

    if (storeAsDefault) {
      const defaults = {
        applyOverrides,
        includeNotes,
        includeOverrides,
      };
      this.props.saveReportComposerDefaults(defaults)
      .then(this.props.loadReportComposerDefaults());
    }

    gmp.report.alert({
      report_id: report.id,
      alert_id: alertId,
      filter: filter.simple(),
    }).then(response => {
      showSuccessMessage(_('Running the alert was successful'));
      this.setState({showTriggerAlertDialog: false});
    }, error => {
        log.error('Failed running alert', error);
        showErrorMessage(_('Failed to run alert.'));
        this.setState({showTriggerAlertDialog: false});
      }
    );
  }

  handleOpenTriggerAlertDialog() {
    this.setState({
      ...this.props.reportComposerDefaults,
      showTriggerAlertDialog: true,
    });
  }

  handleCloseTriggerAlertDialog() {
    this.setState({
      showTriggerAlertDialog: false,
    });
  }

  onAlertCreated(response) {
    const {alerts} = this.state;
    const {gmp} = this.props;
    gmp.alert.get({id: response.data.id}).then(resp => {
      const alert = resp.data;
      this.setState({
        alerts: [alert, ...alerts],
        alertId: alert.id,
      });
    });
  }

  handleValueChange(value, name) {
    this.setState({[name]: value});
  }

  render() {
    const {
      filter,
      showError,
      onInteraction,
    } = this.props;
    const {
      alerts,
      alertId,
      applyOverrides,
      includeNotes,
      includeOverrides,
      showTriggerAlertDialog,
      storeAsDefault,
    } = this.state;
    return (
      <AlertComponent
        onCreated={this.onAlertCreated}
        onError={showError}
        onInteraction={onInteraction}
      >
        {({create}) => (
          <React.Fragment>
            <IconDivider>
              <Icon
                img="start.svg"
                title={_('Trigger Alert')}
                onClick={this.handleOpenTriggerAlertDialog}
              />
            </IconDivider>
            {showTriggerAlertDialog &&
              <TriggerAlertDialog
                alertId={alertId}
                alerts={alerts}
                applyOverrides={applyOverrides}
                filter={filter}
                includeNotes={includeNotes}
                includeOverrides={includeOverrides}
                storeAsDefault={storeAsDefault}
                onAlertChange={this.handleAlertChange}
                onClose={this.handleCloseTriggerAlertDialog}
                onNewAlertClick={create}
                onSave={this.handleTriggerAlert}
                onValueChange={this.handleValueChange}
              />
            }
          </React.Fragment>
        )}
      </AlertComponent>
    );
  }
}

AlertActions.propTypes = {
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  loadReportComposerDefaults: PropTypes.func.isRequired,
  report: PropTypes.model.isRequired,
  reportComposerDefaults: PropTypes.obj,
  saveReportComposerDefaults: PropTypes.func.isRequired,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, {gmp}) => {
  return {
    onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
    loadReportComposerDefaults: () => dispatch(
      loadReportComposerDefaults(gmp)()),
    saveReportComposerDefaults: defaults =>
      dispatch(saveReportComposerDefaults(gmp)(defaults)),
  };
};

const mapStateToProps = rootState => {
  return {reportComposerDefaults: getReportComposerDefaults(rootState)};
};

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(AlertActions);

// vim: set ts=2 sw=2 tw=80:
