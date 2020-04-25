import React, { Component } from 'react';
import { Card } from 'antd';
import BugViewNew from './new/BugViewNew';
import BugViewNewComplete from './new/BugViewNewComplete'
import BugLevelView from './BugLevelView'
import BugMajorView from './BugMajorView'
import BugFreezeView from './BugFreezeView'
import BugDurationView from './BugDurationView'

const tabListNoTitle = [{
    key: 'BugViewNew',
    tab: '所有未完成',
}, {
    key: 'BugViewNewComplete',
    tab: '所有已完成',
}];

const tabListNoTitle2 = [{
    key: 'BugLevelView',
    tab: '缺陷类型管理',
}, {
    key: 'BugMajorView',
    tab: '缺陷专业管理',
}, {
    key: 'BugFreezeView',
    tab: '缺陷状态管理'
}, {
    key: 'BugDurationView',
    tab: '时间区间管理'
}];

const contentListNoTitle = {
    BugViewNew: <BugViewNew />,
    BugViewNewComplete: <BugViewNewComplete />,
    BugLevelView: <BugLevelView />,
    BugMajorView: <BugMajorView />,
    BugFreezeView: <BugFreezeView />,
    BugDurationView: <BugDurationView />,
};

class BugModeRoot extends Component {
    state = {
        key: 'BugViewNew',
        noTitleKey: 'BugViewNew',
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