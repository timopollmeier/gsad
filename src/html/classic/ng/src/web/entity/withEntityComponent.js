/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import logger from 'gmp/log.js';
import {is_defined, is_function} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';

const log = logger.getLogger('web.entity.withEntityComponent');

export const set_handlers = (handlers, props) => {
  const set_handler = (name, named, handler) => {
    if (process.env.NODE_ENV !== 'production' && !is_defined(name)) {
      log.error('No name for entity handler set');
    }
    handlers[name] = is_function(named) || is_defined(props[named]) ? handler :
      undefined;
    return set_handler;
  };
  return set_handler;
};


export const handle_promise = (promise, props, success, error) => {
  let onSuccess;
  let onError;

  if (is_function(success)) {
    onSuccess = (...args) => success(props, ...args);
  }
  else {
    onSuccess = props[success];
  }

  if (is_function(error)) {
    onError = (...args) => error(props, ...args);
  }
  else {
    onError = props[error];
  }
  return promise.then(onSuccess, onError);
};

export const DEFAULT_MAPPING = {
  onCreate: 'onEntityCreateClick',
  onCreateError: 'onCreateError',
  onCreated: 'onCreated',
  onClone: 'onEntityCloneClick',
  onCloneError: 'onCloneError',
  onCloned: 'onCloned',
  onDelete: 'onEntityDeleteClick',
  onDeleteError: 'onDeleteError',
  onDeleted: 'onDeleted',
  onSave: 'onEntitySaveClick',
  onSaveError: 'onSaveError',
  onSaved: 'onSaved',
  onDownload: 'onEntityDownloadClick',
  onDownloadError: 'onDownloadError',
  onDownloaded: 'onDownloaded',
};

const withEntityComponent = (name, mapping) => Component => {

  mapping = {
    ...DEFAULT_MAPPING,
    ...mapping,
  };

  class EntityComponentWrapper extends React.Component {

    constructor(...args) {
      super(...args);

      const {gmp} = this.context;

      this.cmd = gmp[name];

      this.handleEntityClone = this.handleEntityClone.bind(this);
      this.handleEntityDelete = this.handleEntityDelete.bind(this);
      this.handleEntityDownload = this.handleEntityDownload.bind(this);
      this.handleEntitySave = this.handleEntitySave.bind(this);
    }

    handleEntityDelete(entity) {
      const {onDeleted, onDeleteError} = mapping;
      const promise = this.cmd.delete(entity);

      return handle_promise(promise, this.props, onDeleted, onDeleteError);
    }

    handleEntityClone(entity) {
      const {onCloned, onCloneError} = mapping;
      const promise = this.cmd.clone(entity);

      return handle_promise(promise, this.props, onCloned, onCloneError);
    }

    handleEntitySave(data) {
      let promise;

      if (is_defined(data.id)) {
        const {onSaved, onSaveError} = mapping;
        promise = this.cmd.save(data);
        return handle_promise(promise, this.props, onSaved, onSaveError);
      }

      const {onCreated, onCreateError} = mapping;
      promise = this.cmd.create(data);
      return handle_promise(promise, this.props, onCreated, onCreateError);

    }

    handleEntityDownload(entity) {
      const {onDownloaded, onDownloadError} = mapping;

      const promise = this.cmd.export(entity).then(response => {
        const filename = name + '-' + entity.id + '.xml';
        return {filename, data: response.data};
      });

      return handle_promise(promise, this.props, onDownloaded, onDownloadError);
    }

    render() {
      const {
        onClone,
        onCloned,
        onCreate,
        onCreated,
        onDelete,
        onDeleted,
        onSave,
        onSaved,
        onDownload,
        onDownloaded,
      } = mapping;

      const handlers = {};

      set_handlers(handlers, this.props)(
        onCreate, onCreated, this.handleEntitySave,
      )(
        onClone, onCloned, this.handleEntityClone
      )(
        onDelete, onDeleted, this.handleEntityDelete
      )(
        onSave, onSaved, this.handleEntitySave,
      )(
        onDownload, onDownloaded, this.handleEntityDownload,
      );

      return (
        <Component
          {...handlers}
          {...this.props}
        />
      );
    }
  }

  EntityComponentWrapper.propTypes = {
    onError: PropTypes.func,
  };

  EntityComponentWrapper.contextTypes = {
    gmp: PropTypes.gmp.isRequired,
  };

  return EntityComponentWrapper;
};

export default withEntityComponent;

// vim: set ts=2 sw=2 tw=80:
