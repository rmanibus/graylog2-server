// @flow strict
import * as React from 'react';
import { useCallback } from 'react';
import { useField } from 'formik';
import moment from 'moment';

import DateTime from 'logic/datetimes/DateTime';
import { ButtonToolbar, DropdownButton, MenuItem } from 'components/graylog';
import { Icon } from 'components/common';

import PropTypes from 'views/components/CustomPropTypes';
import type { TimeRange } from 'views/logic/queries/Query';

const migrationStrategies = {
  absolute: (oldTimerange: TimeRange) => ({
    type: 'absolute',
    from: new DateTime(moment().subtract(oldTimerange.type === 'relative' ? oldTimerange.range : 300, 'seconds')),
    to: new DateTime(moment()),
  }),
  relative: () => ({ type: 'relative', range: 300 }),
  keyword: () => ({ type: 'keyword', keyword: 'Last five minutes' }),
};

const migrateTimeRangeToNewType = (oldTimerange: TimeRange, type: string): TimeRange => {
  const oldType = oldTimerange.type;

  if (type === oldType) {
    return oldTimerange;
  }

  return migrationStrategies[type](oldTimerange);
};

type Props = {
  disabled: boolean,
};

export default function TimeRangeTypeSelector({ disabled }: Props) {
  const [{ value, onChange, name }] = useField('timerange');
  const { type } = value;
  const onSelect = useCallback((newType) => onChange({
    target: {
      value: migrateTimeRangeToNewType(value, newType),
      name,
    },
  }), [onChange, value]);
  return (
    <ButtonToolbar className="extended-search-timerange-chooser pull-left">
      <DropdownButton bsStyle="info"
                      disabled={disabled}
                      title={<Icon name="clock-o" />}
                      onSelect={onSelect}>
        <MenuItem eventKey="relative"
                  active={type === 'relative'}>
          Relative
        </MenuItem>
        <MenuItem eventKey="absolute"
                  active={type === 'absolute'}>
          Absolute
        </MenuItem>
        <MenuItem eventKey="keyword"
                  active={type === 'keyword'}>
          Keyword
        </MenuItem>
      </DropdownButton>
    </ButtonToolbar>
  );
}

TimeRangeTypeSelector.propTypes = {
  disabled: PropTypes.bool,
};

TimeRangeTypeSelector.defaultProps = {
  disabled: false,
};
