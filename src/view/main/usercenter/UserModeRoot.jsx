import React, { Component } from 'react';
import { Card } from 'antd';
import StaffView from './TaskFromMeView';
import StaffTypeView from './TaskToMeView'

const tabListNoTitle = [{
    key: 'StaffView',
    tab: '我分配的任务',
}, {
    key: 'StaffTypeView',
    tab: '分配我的任务'
}];

const contentListNoTitle = {
    StaffView: <StaffView />,
    StaffTypeView: <StaffTypeView />
};

class UserModeRoot extends Component {
    state = {
        key: 'StaffView',
        noTitleKey: 'StaffView',
    }

    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }

    render() {
        return (
            <div>
                <Card
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

export default UserModeRoot;