import React, { Component } from 'react';
import { Table } from 'antd'
import HttpApi from './HttpApi';

export default class TestView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: 1,
            bugsData: [],
            bugsCounts: 0,
        }
    }
    componentDidMount() {
        this.init();
    }
    init = async () => {
        let bugsCounts = await this.getBugsCount();
        let bugsData = await this.getBugsInfo(1);
        // console.log('bugsData:', bugsData, bugsCounts);
        bugsData = bugsData.map((item, index) => { item.key = index; return item })
        this.setState({ bugsData, bugsCounts })
    }
    getBugsCount = () => {
        return new Promise((resolve, reject) => {
            let sql = `select count(*) count from bugs where effective = 1`;
            let result = 0;
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data[0].count }
                resolve(result);
            })
        })
    }
    getBugsInfo = (currentPage) => {
        return new Promise((resolve, reject) => {
            let sql = `select * from bugs
            where effective = 1
            order by id desc
            limit ${(currentPage - 1) * 10},10`;
            let result = [];
            HttpApi.obs({ sql }, (res) => {
                if (res.data.code === 0) { result = res.data.data }
                resolve(result);
            })
        })
    }
    handleTableChange = async (currentPage) => {
        // console.log('currentPage:', currentPage);
        let bugsData = await this.getBugsInfo(currentPage);
        bugsData = bugsData.map((item, index) => { item.key = index; return item })
        // console.log('bugsData:',bugsData);
        this.setState({ currentPage, bugsData })
    }
    render() {
        const { currentPage, bugsCounts } = this.state;
        const paginationProps = {
            page: currentPage,
            onChange: (page) => this.handleTableChange(page),
            total: bugsCounts,
        }
        const columns = [
            { key: 'id', dataIndex: 'id', title: 'id' },
            {
                key: 'content', dataIndex: 'content', title: 'content'
            },
        ]
        return (
            <Table
                dataSource={this.state.bugsData}
                columns={columns}
                pagination={paginationProps}
            />
        );
    }
}