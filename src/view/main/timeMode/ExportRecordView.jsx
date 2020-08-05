import React, { Component } from 'react';
import { Row, Col, DatePicker, Checkbox, Modal, Button, message } from 'antd'
import HttpApi from '../../util/HttpApi'
import ExportJsonExcel from 'js-export-excel'
import moment from 'moment';
import { omitTextLength, substringBrackets } from '../../util/Tool'

const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;
const area0PlainOptions = [];
var area0List = [];
/**
 * 导出巡检记录的界面
 */
class ExportRecordView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            ///导出Excel部分
            timeStampCheckList: [moment().startOf('day').format('YYYY-MM-DD HH:ss:mm'), moment().endOf('day').format('YYYY-MM-DD HH:ss:mm')],/// 时间段区间默认是今日 ['2019-01-01 00:00:00','2019-01-01 23:59:59']
            area0CheckList: [props.id],///['主厂区','渗滤液',...]
            area0CheckAll: false,
            exporting: false,
        }
    }
    componentDidMount() {
        this.init();
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            showModal: nextProps.showModal
        })
    }
    init = async () => {
        area0PlainOptions.length = 0;
        area0List = await this.getArea0List();
        area0List.forEach((item) => {
            area0PlainOptions.push({ label: item.name.length > 31 ? omitTextLength(item.name, 28) : item.name, value: item.id })
        })
    }
    reset = () => {
        this.setState({
            timeStampCheckList: [moment().startOf('day').format('YYYY-MM-DD HH:ss:mm'), moment().endOf('day').format('YYYY-MM-DD HH:ss:mm')],/// 时间段区间默认是今日 ['2019-01-01 00:00:00','2019-01-01 23:59:59']
            area0CheckList: [],///[]
            area0CheckAll: false,
            exporting: false,
        })
    }
    getArea0List = () => {
        let sql = `select id,name from area_0 where effective = 1`
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }

    statusToTxt = (item) => {
        let str = '/';
        switch (item.device_status) {
            case 1:
                str = '正常'
                break;
            case 2:
                str = '故障'
                break;
            case 3:
                str = '待检'
                break;
            default:
                break;
        }
        return str;
    }
    area0ToTxt = (item) => {
        let result = ''
        area0List.forEach((element) => {
            if (element.id === item.area0_id) {
                result = element.name
            }
        })
        return result
    }
    filterContent = (item) => {
        let result = []
        try {
            let contentList = JSON.parse(item.content)
            contentList.forEach((item) => {
                if (parseInt(item.type_id) === 10) {
                    result.push(substringBrackets(item.title_name) + ': ' + item.value + '℃')
                } else if (parseInt(item.type_id) === 11) {
                    result.push(substringBrackets(item.title_name) + ': ' + (item.value / 1000) + 'mm')
                }
            })
        } catch (error) {
            console.error(error)
        }
        if (result.length === 0) { return '' }
        return result.join('/')
    }
    transConstract = (recordList) => {
        let tempList = {};
        recordList.forEach((item) => {
            let tempObj = {};
            tempObj.status = this.statusToTxt(item);
            tempObj.area0_name = this.area0ToTxt(item);
            tempObj.content = this.filterContent(item);
            // tempObj.device_id = String(item.device_id);
            tempObj.device_name = item.device_name;
            tempObj.area = item.area_name;
            tempObj.upload_name = item.upload_name;
            tempObj.checkedAt = item.checkedAt;
            if (tempList[tempObj.area0_name]) { tempList[tempObj.area0_name].push(tempObj) }
            else { tempList[tempObj.area0_name] = [tempObj] }
        })
        let excelOptionList = [];
        for (const key in tempList) {
            excelOptionList.push({
                sheetData: tempList[key],
                sheetName: key.length > 31 ? omitTextLength(key, 28) : key,
                sheetFilter: ['device_name', 'area', 'checkedAt', 'upload_name', 'status', 'content'],
                sheetHeader: ['巡检点', '巡检点位置', '打点时间', '巡检人', '状态', '参数记录'],
                columnWidths: ['20', '20', '10', '5', '5', '40'], // 列宽
            })
        }
        // console.log('excelOptionList:', excelOptionList);
        return excelOptionList;
    }
    exportHandler = async () => {
        let area0list = this.state.area0CheckList;
        if (area0list.length === 0) { message.error('请完善选项'); return }
        this.setState({ exporting: true })
        let recordList = await this.searchRecordByCondition(this.state.timeStampCheckList, this.state.area0CheckList)//area/查询得到对应的records记录
        ///开始对record中的content和device_status,area0_id。进行处理
        if (recordList.length === 0) { message.warn('未查询到符合条件的巡检数据'); this.setState({ exporting: false }); return }
        let data = this.transConstract(recordList);
        // console.log('data:', data)
        // return;
        let option = {};
        option.fileName = '巡检统计表-' + moment().format('YYYY-MM-DD-HH-mm-ss')
        option.datas = data;
        let toExcel = new ExportJsonExcel(option);
        toExcel.saveExcel();
        this.setState({ exporting: false })
        this.props.cancel();
        this.reset();
        message.info('正在导出Excel文件，请从浏览器下载文件夹中查看');
    }

    searchRecordByCondition = (timeList, area0) => {
        let sql = `select records.device_id,devices.name as device_name,devices.area_name,records.checkedAt,users.name as upload_name,records.device_status,records.content,devices.area0_id from records 
        left join (select users.id,users.name from users where effective = 1) users on users.id = records.user_id
        inner join (select devices.id,devices.name,concat_ws('/',area_1.name,area_2.name,area_3.name) as area_name,devices.area0_id from devices 
                    left join (select * from area_3 where effective = 1) area_3 on devices.area_id = area_3.id
                    left join (select * from area_2 where effective = 1) area_2 on area_3.area2_id = area_2.id
                    left join (select * from area_1 where effective = 1) area_1 on area_2.area1_id = area_1.id
                    where devices.effective = 1 and devices.area0_id in (${area0.join(',')})) devices on devices.id = records.device_id
        where
        records.checkedAt>"${timeList[0]}" and records.checkedAt<"${timeList[1]}" and records.effective = 1
        order by devices.name , records.checkedAt`
        return new Promise((resolve, reject) => {
            HttpApi.obs({ sql }, (res) => {
                let result = [];
                if (res.data.code === 0) {
                    result = res.data.data
                }
                resolve(result);
            })
        })
    }
    disabledDate = (current) => {
        return current > moment().endOf('day');
    }
    ///////////////////
    render() {
        return (
            <Modal
                destroyOnClose
                title="导出巡检选项"
                visible={this.state.showModal}
                onCancel={() => { this.props.cancel() }} /// this.setState({ showModal: false })
                footer={[
                    <Button key='cancel' onClick={() => { this.props.cancel() }}>取消</Button>,
                    <Button key='ok' type="primary" loading={this.state.exporting} onClick={this.exportHandler}>确定导出</Button>,
                ]}
                width={520}
            >
                {this.renderExportExcelView()}
            </Modal>
        );
    }
    renderExportExcelView = () => {
        return (
            <div>
                <Row gutter={16}>
                    <Col span={5}>
                        <span>时间段选择:</span>
                    </Col>
                    <Col span={19}>
                        <RangePicker
                            disabledDate={this.disabledDate}
                            ranges={{
                                '今日': [moment(), moment()],
                                '本月': [moment().startOf('month'), moment().endOf('day')],
                                '上月': [moment().add(-1, 'month').startOf('month'), moment().add(-1, 'month').endOf('month')],
                            }}
                            defaultValue={[moment().startOf('day'), moment().endOf('day')]}
                            onChange={(momentArr) => {
                                if (momentArr.length === 2) {
                                    let timeStampCheckList = [momentArr[0].startOf('day').format('YYYY-MM-DD HH:ss:mm'),
                                    momentArr[1].endOf('day').format('YYYY-MM-DD HH:ss:mm')]
                                    this.setState({ timeStampCheckList })
                                }
                            }}
                        />
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 10 }}>
                    <Col span={5}>
                        <span>厂区选择:</span>
                    </Col>
                    <Col span={19}>
                        <CheckboxGroup
                            options={area0PlainOptions}
                            value={this.state.area0CheckList}
                            onChange={(area0CheckList) => {
                                this.setState({
                                    area0CheckList,
                                    area0CheckAll: area0CheckList.length === area0PlainOptions.length,
                                });
                            }}
                        />
                        <Checkbox
                            checked={this.state.area0CheckAll}
                            onChange={(e) => {
                                this.setState({
                                    area0CheckList: e.target.checked ? area0PlainOptions.map((item) => (item.value)) : [],
                                    area0CheckAll: e.target.checked,
                                });
                            }}
                        >
                            全选
                    </Checkbox>
                    </Col>
                </Row>
            </div>
        )
    }

}

export default ExportRecordView;