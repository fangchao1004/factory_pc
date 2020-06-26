import React, { Component } from 'react';
import { Card } from 'antd';
import BugAboutMeView from './new/BugAboutMeViewNew';
import BugAboutMeCompletedView from './new/BugAboutMeCompletedViewNew'

const tabListNoTitle = [{
    key: 'BugAboutMeView',
    tab: '相关未完成',
}, {
    key: 'BugAboutMeCompletedView',
    tab: '相关已完成',
}];

const contentListNoTitle = {
    BugAboutMeView: <BugAboutMeView />,
    BugAboutMeCompletedView: <BugAboutMeCompletedView />,
};

class BugAboutMeModeRoot extends Component {
    state = {
        key: 'BugAboutMeView',
        noTitleKey: 'BugAboutMeView',
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

export default BugAboutMeModeRoot;