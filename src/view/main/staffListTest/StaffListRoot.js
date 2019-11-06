import React, { Component } from 'react'
import StaffList from './StaffList'
import StaffDepartment from './StaffDepartment'
import {Card} from 'antd'
const tabListNoTitle = [{
  key: 'StaffList',
  tab: '员工列表',
}, {
    key: 'StaffDepartment',
  tab: '部门列表',
  }];
const contentListNoTitle = {
  StaffList: <StaffList />,
  StaffDepartment: <StaffDepartment />,
};

export default class StaffListRoot extends Component {
  state = {
    key: 'StaffList',
    noTitleKey: 'StaffList',
  }

  onTabChange = (key) => {
    this.setState({ noTitleKey: key });
  }
  render() {
    return (
      <div>
        <Card
          bordered={false}
          style={{ width: '100%' }}
          tabList={tabListNoTitle}
          activeTabKey={this.state.noTitleKey}
          onTabChange={(key) => { this.onTabChange(key); }}
        >
          {contentListNoTitle[this.state.noTitleKey]}
        </Card>
       </div>
    )
  }
}
