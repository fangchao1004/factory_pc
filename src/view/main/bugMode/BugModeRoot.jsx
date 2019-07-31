import React, { Component } from 'react';
import { Card } from 'antd';
import BugView from './BugView';
import BugCompletedView from './BugCompletedView'

const tabListNoTitle = [{
    key: 'BugView',
    tab: '缺陷记录',
},{
    key: 'BugCompletedView',
    tab: '已完成的缺陷',
}];

const contentListNoTitle = {
    BugView: <BugView />,
    BugCompletedView: <BugCompletedView />,
};

class BugModeRoot extends Component {
    state = {
        key: 'BugView',
        noTitleKey: 'BugView',
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

export default BugModeRoot;