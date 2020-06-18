import React, { Component } from 'react';
import { Tabs } from 'antd';
import TaskNoticeList from './TaskNoticeList'
import BugNoticeList from './BugNoticeList'
const { TabPane } = Tabs;

const tabListNoTitle = [{
    key: 'BugNoticeList',
    tab: '缺陷',
},
{
    key: 'TaskNoticeList',
    tab: '任务',
}
];
export default class NoticeMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 'BugNoticeList',
            noTitleKey: 'BugNoticeList',
        }
        this.contentListNoTitle = {
            BugNoticeList: <BugNoticeList  {...props} />,
            TaskNoticeList: <TaskNoticeList {...props} />,
        };
    }
    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }
    render() {
        return (
            <Tabs defaultActiveKey="1" size={'small'} style={{ width: 350 }} >
                <TabPane tab="缺陷" key="1">
                    <BugNoticeList {...this.props} />
                </TabPane>
                {/* <TabPane tab="Tab2" key="2">
                    <TaskNoticeList />
                </TabPane> */}
            </Tabs>
        );
    }
}