import React, { Component } from 'react';
import { Card } from 'antd';
import TaskFromMeView from './TaskFromMeView';
import TaskToMeView from './TaskToMeView'

const tabListNoTitle = [
    {
        key: 'TaskToMeView',
        tab: '分配我的任务'
    }, {
        key: 'TaskFromMeView',
        tab: '我分配的任务',
    }];

const contentListNoTitle = {
    TaskFromMeView: <TaskFromMeView />,
    TaskToMeView: <TaskToMeView />
};

class TaskModeRoot extends Component {
    state = {
        key: 'TaskToMeView',
        noTitleKey: 'TaskToMeView',
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

export default TaskModeRoot;