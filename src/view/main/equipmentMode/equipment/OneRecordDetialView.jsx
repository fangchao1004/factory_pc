import React, { Component } from 'react';
import { Descriptions, Button, Modal } from 'antd';
import HttpApi from '../../../util/HttpApi';
import { connect } from 'react-redux';
import { Testuri } from '../../../util/HttpApi'

/**
 * 一次record记录中所包含的bugs的详情
 * 位于抽屉界面显示
 * 很重要！！！
 * 
 * bugs数据+采集数据改造
 */
class OneRecordDetialView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            renderData: null,
            imguuid: null,
            imgtitle: null
        }
    }
    componentDidMount() { this.parseData() }
    parseData() {
        const { id, table_name } = this.props.renderData
        const content = JSON.parse(this.props.renderData.content)

        if (content && connect.length > 0) {
            let index = 0
            const fillBugInfo = () => {
                if (index >= content.length) {
                    // fillBugInfo over
                    this.setState({ renderData: { id, table_name, content } })
                } else {
                    let question = content[index]
                    HttpApi.getBugInfo({ id: question.bug_id },
                        res => {
                            if (res.data && res.data.code === 0 && res.data.data && res.data.data.length > 0) {
                                question.bug = res.data.data[0]
                                question.bug.content = JSON.parse(question.bug.content)
                            }
                            index++
                            fillBugInfo()
                        }, err => {
                            index++
                            fillBugInfo()
                        })
                }
            }
            fillBugInfo()
        }
    }
    render() {
        if (!this.state.renderData) { return <></> }
        return <>
            <Descriptions title={this.state.renderData.table_name} column={1} bordered>
                {this.state.renderData.content.map(question => {
                    // type 10 测温 11 测震 2 数字输入框
                    return <Descriptions.Item key={question.key + "1"} span={1} label={question.title_name}>
                        {question.bug && question.bug.content ? <span style={{ color: 'red' }}>
                            {question.bug.content.text}
                            {question.bug.content.imgs.map((img, i) => <Button key={i} type="link" onClick={() => {
                                this.setState({ imguuid: img, imgtitle: '图片' + (i + 1) })
                            }}>图片{i + 1}</Button>)}
                        </span> :
                            ((question.type_id === '10' || question.type_id === '11' || question.type_id === '2') ?
                                `${question.type_id === '11' ? question.value / 1000 : question.value}${question.title_remark}` :
                                <span style={{ color: 'green' }}>正常</span>)}
                    </Descriptions.Item>
                })}
            </Descriptions>
            <Modal visible={this.state.imguuid !== null} destroyOnClose centered
                width={410} bodyStyle={{ textAlign: 'center', padding: 5, margin: 0 }} footer={null} onCancel={() => {
                    this.setState({ imguuid: null })
                }}>
                <img alt='' style={{ width: 400 }} src={Testuri + 'get_jpg?uuid=' + this.state.imguuid} />
            </Modal>
        </>
    }
}

export default OneRecordDetialView;