import React, { Component } from 'react';
import { Card } from 'antd';
import TimeView from './TimeView'
import TimeView2 from './TimeView2'

const tabListNoTitle = [{
    key: 'TimeView',
    tab: '巡检时间段(当前)',
}, {
    key: 'TimeView2',
    tab: '巡检时间段(交替)',
}];

const tabListNoTitle2 = [];

const contentListNoTitle = {
    TimeView: <TimeView />,
    TimeView2: <TimeView2 />,
};

class TimeModeRoot extends Component {
    state = {
        key: 'TimeView',
        noTitleKey: 'TimeView',
        isAdmin: JSON.parse(window.localStorage.getItem('userinfo')).isadmin
    }

    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }

    render() {

        var tabs
        if (this.state.isAdmin) {
            tabs = tabListNoTitle.concat(tabListNoTitle2)
        } else {
            tabs = tabListNoTitle
        }

        return (
            <Card
                bordered={false}
                style={{ width: '100%' }}
                tabList={tabs}
                activeTabKey={this.state.noTitleKey}
                onTabChange={(key) => { this.onTabChange(key); }}
            >
                {contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );
    }
}

export default TimeModeRoot;