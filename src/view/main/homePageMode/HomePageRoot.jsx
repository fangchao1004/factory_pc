import React, { Component } from 'react';
import { Card } from 'antd';
import HomePageView from './HomePageView';
import BugsPageView from './BugsPageView';

const tabListNoTitle = [{
    key: 'HomePageView',
    tab: '巡检统计',
}, {
    key: 'BugsPageView',
    tab: '缺陷统计',
}];

var contentListNoTitle

class HomePageRoot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 'HomePageView',
            noTitleKey: 'HomePageView',
        }
        contentListNoTitle = {
            HomePageView: <HomePageView {...props} />,
            BugsPageView: <BugsPageView />
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
                {contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );
    }
}

export default HomePageRoot;