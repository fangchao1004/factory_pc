import React, { Component } from 'react';
import { Card } from 'antd';
import ScheduleView from './ScheduleView';
import ScheduleCreateView from './ScheduleCreateView'

const storage = window.localStorage;
var userinfo = null
var isAdmin = false;
var tabListNoTitle = [];

const contentListNoTitle = {
    ScheduleView: <ScheduleView />,
    ScheduleCreateView: <ScheduleCreateView />,
};

class ScheduleRoot extends Component {
    state = {
        key: 'ScheduleView',
        noTitleKey: 'ScheduleView',
    }

    componentDidMount() {
        userinfo = storage.getItem('userinfo');
        isAdmin = JSON.parse(userinfo).isadmin === 1;
        tabListNoTitle = isAdmin ? [{
            key: 'ScheduleView',
            tab: '排班表信息',
        }, {
            key: 'ScheduleCreateView',
            tab: '创建排班表'
        }] : [{
            key: 'ScheduleView',
            tab: '排班表信息',
        }]
        this.forceUpdate();
    }

    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }

    render() {
        return (
            <Card
                bodyStyle={{ padding: 10, backgroundColor: '#F1F2F5' }}
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

export default ScheduleRoot;