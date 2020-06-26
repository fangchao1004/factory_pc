import React, { Component } from 'react';
import { Card } from 'antd';
import TimeView from './TimeView'
import InspectCountByTime from './InspectCountByTime'

const tabListNoTitle = [{
    key: 'TimeView',
    tab: '巡检时间段',
}, {
    key: 'InspectCountByTime',
    tab: '漏检统计',
}
];
class TimeModeRoot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 'TimeView',
            noTitleKey: 'TimeView',
            isAdmin: JSON.parse(window.localStorage.getItem('userinfo')).isadmin
        }
        this.contentListNoTitle = {
            TimeView: <TimeView {...props} />,
            InspectCountByTime: <InspectCountByTime {...props} />,
        };
    }
    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }
    render() {
        return (
            <Card
                bodyStyle={{ padding: 10 }}
                bordered={false}
                style={{ width: '100%' }}
                tabList={tabListNoTitle}
                activeTabKey={this.state.noTitleKey}
                onTabChange={(key) => { this.onTabChange(key); }}
            >
                {this.contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );
    }
}
export default TimeModeRoot;