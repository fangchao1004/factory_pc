import React, { Component } from 'react'
import { Row, Col, Table, Button } from 'antd'
import HttpApi from '../../util/HttpApi'

class StaffTypeView extends Component {
    state = { levels: null }

    componentDidMount() {
        this.getUsersData()
    }

    async getUsersData() {
        let levelsData = await this.getUserLevelList()
        this.setState({ levels: levelsData.map(level => { level.key = level.id; return level }) })
    }

    getUserLevelList() {
        return new Promise((resolve, reject) => {
            HttpApi.getUserLevel({}, data => {
                if (data.data.code === 0) {
                    resolve(data.data.data)
                }
            })
        })
    }

    render() {
        const columns = [
            {
                title: '编号',
                dataIndex: 'id',
                render: (text) => (
                    <div>{text}</div>
                )
            },
            {
                title: '职位名称',
                dataIndex: 'name',
                render: (text) => (
                    <div>{text}</div>
                )
            },
            {
                title: '操作',
                dataIndex: 'actions',
                width: 150,
                render: (text) => (
                    <div style={{ textAlign: 'center' }}><Button type="primary">删除</Button></div>
                )
            }
        ];

        return (
            <div>
                <Row>
                    <Col span={6}>
                        <Button type="primary" style={{ marginBottom: 16 }}>
                            添加类型
                         </Button>
                    </Col>
                </Row>
                <Table
                    size={'small'}
                    bordered
                    dataSource={this.state.levels}
                    columns={columns}
                />
            </div>
        )
    }
}

export default StaffTypeView;