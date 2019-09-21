import React, { Component } from 'react';
import { Card } from 'antd';
import AllAttendanceView from './AllAttendanceView'

const tabListNoTitle = [{
    key: 'AllAttendanceView',
    tab: '考勤信息',
}];

const contentListNoTitle = {
    AllAttendanceView: <AllAttendanceView />,
};

class AttendanceModeRoot extends Component {
    state = {
        key: 'AllAttendanceView',
        noTitleKey: 'AllAttendanceView',
    }

    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }

    render() {
        return (
            <div>
                <Card
                    bordered={false}
                    style={{ width: '100%' }}
                    tabList={tabListNoTitle}
                    activeTabKey={this.state.noTitleKey}
                    onTabChange={(key) => { this.onTabChange(key); }}
                >
                    {contentListNoTitle[this.state.noTitleKey]}
                </Card>
            </div>
        );
    }
}

export default AttendanceModeRoot;