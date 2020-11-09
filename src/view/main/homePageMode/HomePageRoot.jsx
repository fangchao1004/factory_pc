import React, { Component } from 'react';
import { Card } from 'antd';
import HomePageView from './HomePageView';
import BugsPageView from './BugsPageView';
import MonitorView from './MonitorView';
import WorkTable from './workTable/WorkTable';

const tabListNoTitle = [
    {
        key: 'WorkTable',
        tab: '工作台',
    },
    {
        key: 'MonitorView',
        tab: '数据监控',
    }, {
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
            key: 'WorkTable',
            noTitleKey: 'WorkTable',
        }
        contentListNoTitle = {
            HomePageView: <HomePageView {...props} />,
            BugsPageView: <BugsPageView />,
            MonitorView: <MonitorView />,
            WorkTable: <WorkTable />
        };
    }
    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }
    render() {
        return (
            <Card
                bordered={false}
                style={{ width: '100%' }}
                bodyStyle={{ backgroundColor: '#F1F2F5', padding: 10 }}
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