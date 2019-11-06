import React, { Component } from 'react'
import HttpApi from '../../util/HttpApi';
import { Table } from 'antd';

export default class StaffList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: null
    }
  }
  componentDidMount() {
    this.init()
  }
  init = async () => {
    let person = []
    let res = await this.getUserInfo()
    // console.log(res)
    res.map(item => {
      item.key = item.id;
      return item
    })
    this.setState({
      dataSource:res
    })

  }
  getUserInfo = () => {
    return new Promise((resolve, reject) => {
      let result = [];
      HttpApi.getUserInfo({ effective: 1 }, data => {
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
        title: "登录账号",
        dataIndex: "username",
      },
      {
        title: "姓名",
        dataIndex: "name",
 
      },
      {
        title: "密码",
        dataIndex: "password",
       
        render: (text, record) => {
          let result = '/'
          if (text.length > 6) {
            result = text;
          }
          return <div>{result}</div>
        }
      },
      {
        title: "联系方式",
        dataIndex: "phonenumber",
      },
      {
        title: "专业",
        dataIndex: "remark",
      },
    ]
    return (
      <div>
        <Table columns={columns} dataSource={this.state.dataSource}></Table>
      </div>
    )
  }
}

