import { List, InputItem, Radio, Checkbox, TextareaItem, ImagePicker, Button } from 'antd-mobile';
import { Empty } from 'antd'
import React from "react";
const RadioItem = Radio.RadioItem;
const CheckboxItem = Checkbox.CheckboxItem;

// const optionsData = [{ "value": "1", "text": "文本输入框" }, { "value": "2", "text": "数字输入框" }, { "value": "3", "text": "单选" },
// { "value": "4", "text": "多选" }, { "value": "5", "text": "文本域" }, { "value": "6", "text": "图片选择器" }];

/**
 * 记录表渲染器
 */
export default class RecordViewTool {

    static renderTable(allData) {
        var dataSource = allData.tableData;
        let renderInputText = (element) => {
            return <div key={element.key}>
                <List>
                    <InputItem style={{ width: 200 }} key={element.key} value={element.value} >{element.title_name}</InputItem>
                </List>
            </div>
        }
        let renderInputNumber = (element) => {
            return <div key={element.key}>
                <List>
                    <InputItem style={{ width: 200 }} key={element.key} value={element.value} >{element.title_name}</InputItem>
                </List>
            </div>
        }
        let renderRadio = (element) => {
            if (element.default_values === '') {
                return (<div key={element.key}>
                    <span>{element.title_name}</span>
                    <div style={{ textAlign: 'center', fontSize: 20, border: true, color: "#F5232C" }}>请配置选项</div>
                </div>)
            }
            let optionsData = element.default_values.split('/')
            let a = optionsData.map((i, index) => (
                <RadioItem key={i} checked={i === element.value}>
                    {i}
                </RadioItem>
            ))
            return (
                <div key={element.key}>
                    <span>{element.title_name}</span>
                    {a}
                </div>)
        }
        let renderCheckBox = (element) => {
            if (element.default_values === '') {
                return (<div key={element.key}>
                    <span>{element.title_name}</span>
                    <div style={{ textAlign: 'center', fontSize: 20, border: true, color: "#F5232C" }}>请配置选项</div>
                </div>)
            }
            let optionsData = element.default_values.split('/')
            let selectedValues = element.value.split('/')
            let a = optionsData.map((i, index) => (
                <CheckboxItem key={i} checked={selectedValues.indexOf(i) !== -1} >
                    {i}
                </CheckboxItem>
            ))
            return (
                <div key={element.key}>
                    <span>{element.title_name}</span>
                    {a}
                </div>)
        }
        let renderTextArea = (element) => {
            return <div key={element.key}>
                <span>{element.title_name}</span>
                <List>
                    <TextareaItem
                        value={element.value}
                        rows={3}
                    />
                </List>
            </div>
        }
        let renderImagePicker = (element) => {
            let imgsArr = [];
            if (element.value.length > 0) {
                element.value.forEach((element, index) => {
                    imgsArr.push(<img key={index} style={{ marginTop: 20, width: 300, height: 200 }} alt='' src='https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2489492398,1961915359&fm=26&gp=0.jpg' />
                    )
                });
            }
            return <div key={element.key}>
                <span>{element.title_name}</span>
                <List>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {imgsArr.length > 0 ? imgsArr : <Empty />}
                    </div>
                </List>
            </div>
        }
        let renderTitle = (element) => {
            return <div style={{ textAlign: 'center' }} key={element.key} >
                <span style={{ fontSize: 20, border: true, color: element.extra_value ? "#888888" : "#F5232C" }}>
                    {element.extra_value ? element.extra_value : '请选择表单类型'}
                </span>
                <div style={{ marginTop: 30, marginBottom: 20, display: "flex", justifyContent: 'space-between' }} >
                    <span>设备名:{allData.devicename}</span>
                    <span>用户名:{allData.username}</span>
                </div>
            </div>
        }

        // console.log('待渲染数据：', dataSource);
        let viewArr = [];
        if (dataSource.length > 0) {
            dataSource.forEach(element => {
                if (element.type_id === "1") {
                    viewArr.push(renderInputText(element))
                } else if (element.type_id === "2") {
                    viewArr.push(renderInputNumber(element))
                } else if (element.type_id === "3") {
                    viewArr.push(renderRadio(element))
                } else if (element.type_id === "4") {
                    viewArr.push(renderCheckBox(element))
                } else if (element.type_id === "5") {
                    viewArr.push(renderTextArea(element))
                } else if (element.type_id === "6") {
                    viewArr.push(renderImagePicker(element))
                } else if (element.type_id === "7") {
                    viewArr.push(renderTitle(element))
                }
            });
        }
        return <div style={{ width: 400, alignItems: 'center', marginLeft: 20 }}>{viewArr}</div>
    }

}