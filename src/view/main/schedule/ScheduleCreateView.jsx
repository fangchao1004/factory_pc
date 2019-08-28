import React, { Component } from 'react';
import { Table, Button, Row, Col, Tag, Modal, Popover, Icon, Tooltip, Radio, message } from 'antd'
import moment from 'moment';

const content = (
    <div>
        <p>四班三倒,早中晚休都存在且数量等同-对应4个班组</p>
        <p>两班倒,早晚休都存在且数量等同-对应3个班组</p>
        <p>如果存在中班,则视为四班三倒-对应4个班组</p>
    </div>
);
const sampleTags = [{ lab: '早班', val: 1 }, { lab: '早班', val: 1 }, { lab: '夜班', val: 3 }, { lab: '夜班', val: 3 },
{ lab: '休息', val: 0 }, { lab: '中班', val: 2 }, { lab: '中班', val: 2 }, { lab: '休息', val: 0 }].map((item, index) => { item.key = index; return item }) ///四班三倒 模版
const sampleTags2 = [{ lab: '早班', val: 1 }, { lab: '早班', val: 1 }, { lab: '夜班', val: 3 }, { lab: '夜班', val: 3 },
{ lab: '休息', val: 0 }, { lab: '休息', val: 0 }].map((item, index) => { item.key = index; return item }) ///四班三倒 模版
var addTagBeginKey = 8;///添加tag时，key从 7++ 开始累计
var is4 = false;///是否为 四班三倒
var avgLength = 1; /// 一个周期中 每个班有几次重复 
const columns = [
    {
        key: 'time',
        dataIndex: 'time',
        title: '日期',
    },
    {
        key: 'group_1_val',
        dataIndex: 'group_1_lab',
        title: '甲组',
    }, {
        key: 'group_2_val',
        dataIndex: 'group_2_lab',
        title: '乙组',
    }, {
        key: 'group_3_val',
        dataIndex: 'group_3_lab',
        title: '丙组',
    },
    {
        key: 'group_4_val',
        dataIndex: 'group_4_lab',
        title: '丁组',
        render: (text) => {
            let str = '/'
            if (text) { str = text }
            return <div>{str}</div>
        }
    }]
/**
 * 创建排班表界面
 */
class ScheduleCreateView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal1: false,
            loopTags: [],///最小的周期轮班数据
            beginTagForJia: null,///甲组今日班次选择
            listOfyear: [],///一年的排班数据
        }
    }
    createTable = () => {
        this.setState({ showModal1: true })
    }
    renderContent = () => {
        return (
            <div>
                <Row>
                    <Col span={6}>
                        <span>常用轮班选项:</span>
                    </Col>
                    <Col span={18}>
                        <Button type='primary' onClick={() => {
                            addTagBeginKey = 8;
                            this.setState({ loopTags: sampleTags, beginTagForJia: null })
                        }}>四班三倒</Button>
                        <Button style={{ marginLeft: 20 }} type='primary' onClick={() => {
                            addTagBeginKey = 8;
                            this.setState({ loopTags: sampleTags2, beginTagForJia: null })
                        }}>两班倒</Button>
                    </Col>
                </Row>
                <Row style={{ marginTop: 20 }}>
                    <Col span={6}>
                        <span>最小轮班周期:</span><br />
                        {this.state.loopTags.length > 0 ?
                            <div>
                                <div>{this.state.loopTags.length}天</div>
                                <Button style={{ marginTop: 10 }} size='small' onClick={() => { addTagBeginKey = 8; this.setState({ loopTags: [], beginTagForJia: null }) }}>清空</Button>
                            </div>
                            : null}
                    </Col>
                    <Col span={18}>
                        <div style={{ borderStyle: 'solid', borderColor: '#dddddd', borderRadius: 10, borderWidth: 1, width: '100%', minHeight: 100, paddingTop: 10, paddingLeft: 10 }}>
                            {this.renderTags()}
                        </div>
                    </Col>
                </Row>
                <Row style={{ marginTop: 20 }}>
                    <Col span={6}>
                        <Tooltip placement="topLeft" title={'点击选项-自行编辑排班表-请严格按照排班规范-各班次数量对等-否则生成的排班数据会有冲突'}>
                            <span>班次添加:</span>
                        </Tooltip>
                    </Col>
                    <Col span={18}>
                        <Tag style={{ cursor: 'pointer' }} color="#87d068" onClick={() => this.addTag(1)}>早班</Tag>
                        <Tag style={{ cursor: 'pointer' }} color="#f50" onClick={() => this.addTag(2)}>中班</Tag>
                        <Tag style={{ cursor: 'pointer' }} color="#2db7f5" onClick={() => this.addTag(3)}>夜班</Tag>
                        <Tag style={{ cursor: 'pointer' }} color="#108ee9" onClick={() => this.addTag(0)}>休息</Tag>
                        <Popover content={content} title="班次周期说明">
                            <Icon type="info-circle" theme="twoTone" style={{ fontSize: 20, marginLeft: 20 }} />
                        </Popover>
                    </Col>
                </Row>
                <Row style={{ marginTop: 20 }}>
                    <Col span={6}>
                        <Tooltip placement="topLeft" title={'固定班组-不可编辑-如果是两班倒-则会无视丁组'}>
                            <span>初始固定班组:</span>
                        </Tooltip>
                    </Col>
                    <Col span={18}>
                        <Tag>甲组</Tag>
                        <Tag>乙组</Tag>
                        <Tag>丙组</Tag>
                        <Tag>丁组</Tag>
                    </Col>
                </Row>
                <Row style={{ marginTop: 20 }}>
                    <Col span={6}>
                        <Tooltip placement="topLeft" title={<div>注意: 甲组今日班次--乙组前推 (最小周期/班组数量) 天-以此类推--形成不冲突的循环</div>}>
                            <span>甲组今日班次:</span>
                        </Tooltip>
                    </Col>
                    <Col span={18}>
                        <Radio.Group buttonStyle="solid" value={this.state.beginTagForJia}>
                            {this.state.loopTags.map((item) => <Radio.Button key={item.key} value={item.key} onClick={() => { this.setState({ beginTagForJia: item.key }) }}>{item.lab}</Radio.Button>)}
                        </Radio.Group>
                    </Col>
                </Row>
            </div >
        )
    }
    renderTags = () => {
        return (
            <div>
                {this.state.loopTags.map((item) => (<Tag
                    color={item.val === 1 ? '#87d068' : (item.val === 2 ? '#f50' : (item.val === 3 ? '#2db7f5' : '#108ee9'))}
                    key={item.key} draggable={true} closable={true} onClose={() => this.deleteTag(item.key)} style={{ marginBottom: 10 }}>{item.lab}</Tag>))}
            </div>
        )
    }
    deleteTag = (removedTagkey) => {
        const loopTags = this.state.loopTags.filter(tag => tag.key !== removedTagkey);
        // console.log(loopTags);
        if (removedTagkey === this.state.beginTagForJia) {
            this.setState({ beginTagForJia: null });
        }
        this.setState({ loopTags });
    }
    addTag = (v) => {
        let loopTags = JSON.parse(JSON.stringify(this.state.loopTags));
        loopTags.push({
            lab: v === 1 ? '早班' : (v === 2 ? '中班' : (v === 3 ? '夜班' : '休息')),
            val: v,
            key: addTagBeginKey,
        })
        // console.log(loopTags);
        this.setState({ loopTags })
        addTagBeginKey++;
    }
    checkData = () => {
        // console.log('loopTag:', this.state.loopTags, 'selectBeginKey:', this.state.beginTagForJia);
        ///检测周期数据是否合理
        let result = this.checkHandler(this.state.loopTags);
        if (!result) { message.error('周期数据不合理，请重新编辑'); return }
        if (this.state.beginTagForJia === null) { message.warn('请选择甲组今日班次'); return }
        ///数据结构合理 开始处理
        let selectIndex = null;
        this.state.loopTags.forEach((item, index) => {
            if (item.key === this.state.beginTagForJia) { selectIndex = index }
        });
        // console.log('selectIndex:', selectIndex)///选择的对象 在数组中的索引
        ///对数组进行重新的 排序 第一位 是所选的对象
        /// 这里将数组 x4 为了方便甲乙丙丁的顺延几位的截取 形成一个新的排班数组循环
        let listx4 = [...this.state.loopTags, ...this.state.loopTags, ...this.state.loopTags, ...this.state.loopTags]
        // console.log('listx4:', listx4);
        let groupA = JSON.parse(JSON.stringify(listx4.slice(selectIndex, selectIndex + this.state.loopTags.length))).map((item) => { item.groupId = 1; return item })
        let groupB = JSON.parse(JSON.stringify(listx4.slice(selectIndex + (this.state.loopTags.length - avgLength), selectIndex + (this.state.loopTags.length - avgLength) + this.state.loopTags.length))).map((item) => { item.groupId = 2; return item })
        let groupC = JSON.parse(JSON.stringify(listx4.slice(selectIndex + 2 * (this.state.loopTags.length - avgLength), selectIndex + 2 * (this.state.loopTags.length - avgLength) + this.state.loopTags.length))).map((item) => { item.groupId = 3; return item })
        let groupD = null
        if (is4) { groupD = JSON.parse(JSON.stringify(listx4.slice(selectIndex + 3 * (this.state.loopTags.length - avgLength), selectIndex + 3 * (this.state.loopTags.length - avgLength) + this.state.loopTags.length))).map((item) => { item.groupId = 4; return item }) }
        // console.log('groupA:', groupA);
        // console.log('groupB:', groupB);
        // console.log('groupC:', groupC);
        // console.log('groupD:', groupD); ///此步 数据是以班组 进行的分组
        ///要对数据进行矩阵转换 以各个数据的索引位置（对应后期的日期）来重新分组
        let matrixResult = this.matrixList([groupA, groupB, groupC, groupD]);
        // console.log('matrixResult:', matrixResult);
        ///开始 复制数组
        let List365 = [];
        for (let index = 0; index < (365 / this.state.loopTags.length); index++) {
            List365 = [...List365, ...matrixResult]
        }
        // console.log(List365);///此步 数据是以班组 进行的分组
        let temp = JSON.parse(JSON.stringify(List365)).map((item, index) => {
            item.key = index;
            item.time = moment().add(+index, 'day').format('YYYY-MM-DD');
            return item
        })
        this.setState({ showModal1: false, listOfyear: temp })
    }
    matrixList = (groups) => {
        /// let index0List = [];
        var vars = {}; //批量定义
        for (var i = 0; i < this.state.loopTags.length; i++) {
            var varName = 'index' + i + 'List';  //动态定义变量名
            vars[varName] = [];  //动态赋值
        }
        groups.forEach((oneGroup) => {
            if (oneGroup) {
                oneGroup.forEach((element, i) => {
                    let varname = 'index' + i + 'List';
                    vars[varname].push(element);
                });
            }
        });
        let matrix2list = [];
        for (const key in vars) {
            // console.log('vars[key]:',vars[key]); /// [{…}, {…}, {…}]  {lab: "夜班", val: 3, key: 3, groupId: 1}
            let list = vars[key];
            let obj = {};
            list.forEach((item) => {
                let varname = 'group_' + item.groupId;
                obj[varname + '_val'] = item.val;
                obj[varname + '_lab'] = item.lab;
            })
            matrix2list.push(obj);
        }
        return matrix2list
    }
    checkHandler = (loopTags) => {
        let result = false;
        is4 = false;
        let length1 = 0;
        let length2 = 0;
        let length3 = 0;
        let length0 = 0;
        if (loopTags.length > 0 && (loopTags.length % 3 === 0 || loopTags.length % 4 === 0)) {
            loopTags.forEach(element => {
                if (element.val === 1) { length1 = length1 + 1 }
                else if (element.val === 2) { length2 = length2 + 1; is4 = true } ///包含中班 就认为是 四班三倒
                else if (element.val === 3) { length3 = length3 + 1 }
                else if (element.val === 0) { length0 = length0 + 1 }
            });
            ///判断各个数值的长度是否相等
            if (is4) {
                avgLength = (length1 + length2 + length3 + length0) / 4
                if (length1 === avgLength && length2 === avgLength && length3 === avgLength && length0 === avgLength) {
                    result = true;
                }
            } else {
                avgLength = (length1 + length3 + length0) / 3
                if (length1 === avgLength && length3 === avgLength && length0 === avgLength) {
                    result = true;
                }
            }
        }
        return result;
    }

    render() {
        return (
            <div>
                <Row>
                    <Col span={6}>
                        <Button onClick={this.createTable} type="primary" style={{ marginBottom: 16 }}>创建表单</Button>
                    </Col>
                </Row>
                ScheduleCreateView 页面
                <Modal
                    width={570}
                    title='生产部轮值排班表'
                    visible={this.state.showModal1}
                    onOk={this.checkData}
                    onCancel={() => { this.setState({ showModal1: false }) }}
                >
                    {this.renderContent()}
                </Modal>
                <Table
                    bordered
                    dataSource={this.state.listOfyear}
                    columns={columns}
                />
            </div>
        );
    }
}

export default ScheduleCreateView;