import React, { Component } from 'react';
import { Card } from 'antd';
import BugView from './BugView';
import BugCompletedView from './BugCompletedView'
import BugLevelView from './BugLevelView'
import BugTypeRemarkView from './BugTypeRemarkView'
import BugMajorView from './BugMajorView'

const tabListNoTitle = [{
    key: 'BugView',
    tab: '所有未完成',
}, {
    key: 'BugCompletedView',
    tab: '所有已完成',
}];

const tabListNoTitle2 = [{
    key: 'BugLevelView',
    tab: '缺陷类型管理',
}, {
    key: 'BugTypeRemarkView',
    tab: '备注类型管理',
}, {
    key: 'BugMajorView',
    tab: '缺陷专业管理',
}];

const contentListNoTitle = {
    BugView: <BugView />,
    BugCompletedView: <BugCompletedView />,
    BugLevelView: <BugLevelView />,
    BugTypeRemarkView: <BugTypeRemarkView />,
    BugMajorView: <BugMajorView />,
};

class BugModeRoot extends Component {
    state = {
        key: 'BugView',
        noTitleKey: 'BugView',
        isAdmin: JSON.parse(window.localStorage.getItem('userinfo')).isadmin,
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
                bodyStyle={{ padding: 20 }}
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

export default BugModeRoot;