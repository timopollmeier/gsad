/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import Select from 'web/components/form/select';

/* eslint-disable max-len */
import {CertBundCreatedDisplay} from 'web/pages/certbund/dashboard/createddisplay';
import {CertBundCvssDisplay} from 'web/pages/certbund/dashboard/cvssdisplay';
import {CvesCreatedDisplay} from 'web/pages/cves/dashboard/createddisplay';
import {CvesSeverityClassDisplay} from 'web/pages/cves/dashboard/severityclassdisplay';
import {HostsModifiedDisplay} from 'web/pages/hosts/dashboard/modifieddisplay';
import {HostsTopologyDisplay} from 'web/pages/hosts/dashboard/topologydisplay';
import {HostsVulnScoreDisplay} from 'web/pages/hosts/dashboard/vulnscoredisplay';
import {NvtsSeverityClassDisplay} from 'web/pages/nvts/dashboard/severityclassdisplay';
import {OsSeverityClassDisplay} from 'web/pages/operatingsystems/dashboard/severityclassdisplay';
import {OsVulnScoreDisplay} from 'web/pages/operatingsystems/dashboard/vulnscoredisplay';
import {ReportsHighResultsDisplay} from 'web/pages/reports/dashboard/highresultsdisplay';
import {ReportsSeverityDisplay} from 'web/pages/reports/dashboard/severityclassdisplay';
import {ResultsSeverityDisplay} from 'web/pages/results/dashboard/severityclassdisplay';
import {TasksSeverityDisplay} from 'web/pages/tasks/dashboard/severityclassdisplay';
import {TasksStatusDisplay} from 'web/pages/tasks/dashboard/statusdisplay';
/* eslint-enable max-len */

const MAX_TITLE_LENGTH = 50;

export const DEFAULT_DISPLAYS = [
  [
    TasksSeverityDisplay.displayId,
    TasksStatusDisplay.displayId,
  ], [
    CvesCreatedDisplay.displayId,
    NvtsSeverityClassDisplay.displayId,
  ],
];

const SCAN_DEFAULT_DISPLAYS = [
  [
    ResultsSeverityDisplay.displayId,
    ReportsSeverityDisplay.displayId,
  ], [
    TasksStatusDisplay.displayId,
    ReportsHighResultsDisplay.displayId,
    TasksSeverityDisplay.displayId,
  ],
];

const ASSET_DEFAULT_DISPLAYS = [
  [
    HostsVulnScoreDisplay.displayId,
    HostsTopologyDisplay.displayId,
    OsVulnScoreDisplay.displayId,
  ], [
    OsSeverityClassDisplay.displayId,
    HostsModifiedDisplay.displayId,
  ],
];

const SECINFO_DEFAULT_DISPLAYS = [
  [
    NvtsSeverityClassDisplay.displayId,
    CvesCreatedDisplay.displayId,
    CvesSeverityClassDisplay.displayId,
  ], [
    CertBundCreatedDisplay.displayId,
    CertBundCvssDisplay.displayId,
  ],
];

const EMPTY_DISPLAYS = [];

const NewDashboardDialog = ({
  onClose,
  onSave,
}) => (
  <SaveDialog
    buttonTitle={_('Add')}
    title={_('Add new Dashboard')}
    width="550px"
    minHeight={165}
    minWidth={340}
    defaultValues={{
      title: _('Unnamed'),
      defaultDisplays: DEFAULT_DISPLAYS,
    }}
    onClose={onClose}
    onSave={onSave}
  >
    {({
      values,
      onValueChange,
    }) => (
      <React.Fragment>
        <FormGroup
          title={_('Dashboard Title')}
          titleSize={4}
        >
          <TextField
            grow
            name="title"
            maxLength={MAX_TITLE_LENGTH}
            value={values.title}
            onChange={onValueChange}
          />
        </FormGroup>
        <FormGroup
          title={_('Initial Displays')}
          titleSize={4}
        >
          <Select
            name="defaultDisplays"
            items={[{
              label: _('Default'),
              value: DEFAULT_DISPLAYS,
            }, {
              label: _('Scan Displays'),
              value: SCAN_DEFAULT_DISPLAYS,
            }, {
              label: _('Asset Displays'),
              value: ASSET_DEFAULT_DISPLAYS,
            }, {
              label: _('SecInfo Displays'),
              value: SECINFO_DEFAULT_DISPLAYS,
            }, {
              label: _('Empty'),
              value: EMPTY_DISPLAYS,
            }]}
            value={values.defaultDisplays}
            onChange={onValueChange}
          />
        </FormGroup>
      </React.Fragment>
    )}
  </SaveDialog>
);

NewDashboardDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default NewDashboardDialog;

// vim: set ts=2 sw=2 tw=80: