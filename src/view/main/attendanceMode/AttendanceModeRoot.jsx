import React, { Component } from 'react';
import { Card } from 'antd';
import AttendanceView from './AttendanceView';
import AllAttendanceView from './AllAttendanceView'

const storage = window.localStorage;
var userinfo = null
var isAdmin = false;
var tabListNoTitle = [];

const contentListNoTitle = {
    AttendanceView: <AttendanceView />,
    AllAttendanceView: <AllAttendanceView />,
};

class AttendanceModeRoot extends Component {
    state = {
        key: 'AttendanceView',
        noTitleKey: 'AttendanceView',
    }

    componentDidMount() {
        userinfo = storage.getItem('userinfo');
        isAdmin = JSON.parse(userinfo).isadmin === 1;
        tabListNoTitle = isAdmin ? [{
            key: 'AttendanceView',
            tab: '个人考勤信息',
        }, {
            key: 'AllAttendanceView',
            tab: '全部考勤信息'
        }] : [{
            key: 'AttendanceView',
            tab: '个人考勤信息',
        }]
        this.forceUpdate();
    }

    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }

    render() {
        return (
            <Card
                bordered={false}
                style={{ width: '100%' }}
                tabList={tabListNoTitle}
                activeTabKey={this.state.noTitleKey}
                onTabChange={(key) => { this.onTabChange(key); }}
            >
                {contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );
    }
}

export default AttendanceModeRoot;