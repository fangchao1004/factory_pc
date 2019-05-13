import { List, InputItem, Radio, Checkbox, TextareaItem, ImagePicker } from 'antd-mobile';
import React from "react";
const RadioItem = Radio.RadioItem;
const CheckboxItem = Checkbox.CheckboxItem;

// const optionsData = [{ "value": "1", "text": "文本输入框" }, { "value": "2", "text": "数字输入框" }, { "value": "3", "text": "单选" },
// { "value": "4", "text": "多选" }, { "value": "5", "text": "文本域" }, { "value": "6", "text": "图片选择器" }];

export default class SampleViewTool {

    static renderTable(dataSource) {
        let renderInput = (element) => {
            return <div key={element.key}>
                <List>
                    <InputItem style={{ width: 200 }} key={element.key} value={element.default_values} >{element.title}</InputItem>
                </List>
            </div>
        }
        let renderInputNumber = (element) => {
            return <div key={element.key}>
                <List>
                    <InputItem style={{ width: 200 }} key={element.key} value={element.default_values} >{element.title}</InputItem>
                </List>
            </div>
        }
        let renderRadio = (element) => {
            if (element.default_values === '') {
                return (<div key={element.key}>
                    <span>{element.title}</span>
                    <div style={{ textAlign: 'center', fontSize: 20, border: true, color: "#F5232C" }}>请配置选项</div>
                </div>)
            }
            let optionsData = element.default_values.split('/')
            let a = optionsData.map((i, index) => (
                <RadioItem key={i} checked={index === 0} onChange={() => { }}>
                    {i}
                </RadioItem>
            ))
            return (
                <div key={element.key}>
                    <span>{element.title}</span>
                    {a}
                </div>)
        }
        let renderCheckBox = (element) => {
            if (element.default_values === '') {
                return (<div key={element.key}>
                    <span>{element.title}</span>
                    <div style={{ textAlign: 'center', fontSize: 20, border: true, color: "#F5232C" }}>请配置选项</div>
                </div>)
            }
            let optionsData = element.default_values.split('/')
            let a = optionsData.map((i, index) => (
                <CheckboxItem key={i} checked={index === 0} onChange={() => { }}>
                    {i}
                </CheckboxItem>
            ))
            return (
                <div key={element.key}>
                    <span>{element.title}</span>
                    {a}
                </div>)
        }
        let renderTextArea = (element) => {
            return <div key={element.key}>
                <span>{element.title}</span>
                <List>
                    <TextareaItem
                        value={element.default_values}
                        rows={3}
                    />
                </List>
            </div>
        }
        let renderImagePicker = (element) => {
            return <div key={element.key}>
                <span>{element.title}</span>
                <List>
                    <ImagePicker
                        onAddImageClick={() => { }}
                    />
                </List>
            </div>
        }
        let renderTitle = (element) => {
            return <div style={{ marginBottom: 40, textAlign: 'center' }} key={element.key} >
                <span style={{ fontSize: 20, border: true, color: element.extra_value ? "#888888" : "#F5232C" }}>
                    {element.extra_value ? element.extra_value : '请选择表单类型'}
                </span>
            </div>
        }

        // console.log('待渲染数据：', dataSource);
        let viewArr = [];
        if (dataSource.length > 0) {
            dataSource.forEach(element => {
                if (element.type_id === "1") {
                    viewArr.push(renderInput(element))
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
        return <div style={{ width: 400, alignItems: 'center' }}>{viewArr}</div>
    }

}