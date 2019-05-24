import React, { Component } from 'react';
import { Card } from 'antd';
import TaskFromMeView from './TaskFromMeView';
import TaskToMeView from './TaskToMeView'

const tabListNoTitle = [{
    key: 'TaskFromMeView',
    tab: '我分配的任务',
}, {
    key: 'TaskToMeView',
    tab: '分配我的任务'
}];

const contentListNoTitle = {
    TaskFromMeView: <TaskFromMeView />,
    TaskToMeView: <TaskToMeView />
};

class UserModeRoot extends Component {
    state = {
        key: 'TaskFromMeView',
        noTitleKey: 'TaskFromMeView',
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