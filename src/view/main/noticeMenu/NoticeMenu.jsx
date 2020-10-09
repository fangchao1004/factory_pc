import React, { Component } from 'react';
import { Tabs, Badge } from 'antd';
import TaskNoticeList from './TaskNoticeList'
import BugNoticeList from './BugNoticeList'
import WarnNoticeList from './WarnNoticeList'
const { TabPane } = Tabs;
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
            WarnNoticeList: <WarnNoticeList {...props} />,
        };
    }
    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }
    render() {
        return (
            <Tabs defaultActiveKey="1" size={'small'} style={{ width: 320 }}  >
                <TabPane tab={<Badge count={this.props.data.unreadBugs.length}>缺陷</Badge>} key="1">
                    <BugNoticeList {...this.props} />
                </TabPane>
                <TabPane tab={<Badge count={this.props.data.unreadWarns.length}>报警</Badge>} key="2">
                    <WarnNoticeList  {...this.props} />
                </TabPane>
            </Tabs >
        );
    }
}