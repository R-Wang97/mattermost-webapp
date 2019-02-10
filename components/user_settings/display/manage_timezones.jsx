// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import {updateUser} from 'actions/user_actions.jsx';

import SettingItemMax from 'components/setting_item_max.jsx';
import {getBrowserTimezone} from 'utils/timezone';

export default class ManageTimezones extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            useAutomaticTimezone: props.useAutomaticTimezone,
            automaticTimezone: props.automaticTimezone,
            manualTimezone: props.manualTimezone,
            isSaving: false,
        };
    }

    timezoneNotChanged = () => {
        const {
            useAutomaticTimezone,
            automaticTimezone,
            manualTimezone,
        } = this.state;

        const {
            useAutomaticTimezone: oldUseAutomaticTimezone,
            automaticTimezone: oldAutomaticTimezone,
            manualTimezone: oldManualTimezone,
        } = this.props;

        return (
            useAutomaticTimezone === oldUseAutomaticTimezone &&
            automaticTimezone === oldAutomaticTimezone &&
            manualTimezone === oldManualTimezone
        );
    };

    changeTimezone = () => {
        if (this.timezoneNotChanged()) {
            this.props.updateSection('');
            return;
        }

        this.submitUser();
    };

    submitUser = () => {
        const {user} = this.props;
        const {
            useAutomaticTimezone,
            automaticTimezone,
            manualTimezone,
        } = this.state;

        const timezone = {
            useAutomaticTimezone: useAutomaticTimezone.toString(),
            automaticTimezone,
            manualTimezone,
        };

        const updatedUser = {
            ...user,
            timezone,
        };

        updateUser(
            updatedUser,
            () => this.props.updateSection(''),
            (err) => {
                let serverError;
                if (err.message) {
                    serverError = err.message;
                } else {
                    serverError = err;
                }
                this.setState({serverError, isSaving: false});
            }
        );
    };

    handleAutomaticTimezone = (e) => {
        const useAutomaticTimezone = e.target.checked;
        let automaticTimezone = '';

        if (useAutomaticTimezone) {
            automaticTimezone = getBrowserTimezone();
        }

        this.setState({
            useAutomaticTimezone,
            automaticTimezone,
        });
    };

    handleManualTimezoneChange = (e) => {
        this.setState({manualTimezone: e.target.value});
    };

    render() {
        const {timezones} = this.props;
        const {
            useAutomaticTimezone,
            automaticTimezone,
        } = this.state;

        const options = [];
        timezones.forEach((timezone) => {
            options.push(
                <option
                    key={timezone}
                    value={timezone}
                >
                    {timezone}
                </option>
            );
        });

        let serverError;
        if (this.state.serverError) {
            serverError = <label className='has-error'>{this.state.serverError}</label>;
        }

        const inputs = [];

        const noTimezonesFromServer = timezones.length === 0;
        const automaticTimezoneInput = (
            <div className='checkbox'>
                <label>
                    <input
                        id='automaticTimezoneInput'
                        type='checkbox'
                        checked={useAutomaticTimezone}
                        onChange={this.handleAutomaticTimezone}
                        disabled={noTimezonesFromServer}
                    />
                    <FormattedMessage
                        id='user.settings.timezones.automatic'
                        defaultMessage='Set automatically'
                    />
                </label>
            </div>
        );
        inputs.push(automaticTimezoneInput);

        const displayTimezone = useAutomaticTimezone ? automaticTimezone : this.state.manualTimezone;
        const manualTimezoneInput = (
            <div key='manualTimezone'>
                <div className='padding-top'>
                    <select
                        id='displayTimezone'
                        ref='timezone'
                        className='form-control'
                        value={displayTimezone}
                        onChange={this.handleManualTimezoneChange}
                        disabled={useAutomaticTimezone}
                    >
                        {options}
                    </select>
                    {serverError}
                </div>
            </div>
        );
        inputs.push(manualTimezoneInput);

        inputs.push(
            <div>
                <br/>
                <FormattedHTMLMessage
                    id='user.settings.timezones.promote'
                    defaultMessage='Select the time zone used for timestamps in the user interface and email notifications.'
                />
            </div>
        );

        return (
            <SettingItemMax
                title={
                    <FormattedMessage
                        id='user.settings.display.timezone'
                        defaultMessage='Timezone'
                    />
                }
                containerStyle='timezone-container'
                width='medium'
                submit={this.changeTimezone}
                saving={this.state.isSaving}
                inputs={inputs}
                updateSection={this.props.updateSection}
            />
        );
    }
}

ManageTimezones.propTypes = {
    user: PropTypes.object.isRequired,
    updateSection: PropTypes.func.isRequired,
    useAutomaticTimezone: PropTypes.bool.isRequired,
    automaticTimezone: PropTypes.string.isRequired,
    manualTimezone: PropTypes.string.isRequired,
    timezones: PropTypes.array.isRequired,
};
