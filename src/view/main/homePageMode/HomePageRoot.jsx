import React, { Component } from 'react';
import { Card } from 'antd';
import HomePageView from './HomePageView';
import BugsPageView from './BugsPageView';

const tabListNoTitle = [{
    key: 'HomePageView',
    tab: '巡检统计',
},{
    key: 'BugsPageView',
    tab: '缺陷统计',
}];

const contentListNoTitle = {
    HomePageView: <HomePageView />,
    BugsPageView: <BugsPageView />
};

class HomePageRoot extends Component {
    state = {
        key: 'HomePageView',
        noTitleKey: 'HomePageView',
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

export default HomePageRoot;