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
                    <InputItem style={{ width: 200 }} key={element.key} value={element.default_value} >{element.title}</InputItem>
                </List>
            </div>
        }
        let renderInputNumber = (element) => {
            return <div key={element.key}>
                <List>
                    <InputItem style={{ width: 200 }} key={element.key} value={element.default_value} >{element.title}</InputItem>
                </List>
            </div>
        }
        let renderRadio = (element) => {
            let optionsData = element.default_value.split('/')
            let a = optionsData.map((i, index) => (
                <RadioItem key={i} checked={index === 0} onChange={() => { }}>
                    {i}
                </RadioItem>
            ))
            return (
                <div>
                    <span>{element.title}</span>
                    {a}
                </div>)
        }
        let renderCheckBox = (element) => {
            let optionsData = element.default_value.split('/')
            let a = optionsData.map((i, index) => (
                <CheckboxItem key={i} checked={index === 0 || index === 1} onChange={() => { }}>
                    {i}
                </CheckboxItem>
            ))
            return (
                <div>
                    <span>{element.title}</span>
                    {a}
                </div>)
        }
        let renderTextArea = (element) => {
            return <div key={element.key}>
                <span>{element.title}</span>
                <List>
                    <TextareaItem
                        value={element.default_value}
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
                    onAddImageClick={()=>{}}
                    />
                </List>
            </div>
        }

        console.log('待渲染数据：', dataSource);
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
                }
            });
        }
        return <div style={{ width: 400, alignItems: 'center' }}>{viewArr}</div>
    }

}