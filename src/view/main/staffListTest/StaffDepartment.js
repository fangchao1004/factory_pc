import React, { Component } from 'react'
import HttpApi from '../../util/HttpApi'
import { Table,Button } from "antd"

export default class StaffDepartment extends Component {
  constructor() {
    super()
    this.state = {
      dataSource: null
    }
  }
  componentDidMount() {
    this.init()
  }
  init = async () => {
    let res = await this.getUserLevel()
    // console.log(res)
    res.map(item => {
      item.key = item.id;
      return item
    })
    this.setState({
      dataSource: res
    })
  }
  getUserLevel = () => {
    return new Promise((resolve, reject) => {
      let result = [];
      HttpApi.getUserLevel({ effective: 1 }, data => {
        if (data.data.code === 0) {
          result = data.data.data
        }
        resolve(result);
      })
    })
  }
  render() {
    const columns = [
      {
        title: "部门列表",
        dataIndex: "name"
      },
      {
        title: "操作",
        dataIndex: "icon",
        render: (text, record) => {
          return (
            <Button type="primary">操作</Button>
          )
        }
      }
    ]
    return (
      <div>
        <Table columns={columns} dataSource={this.state.dataSource}></Table>
      </div>
    )
  }
}
