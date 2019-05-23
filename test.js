const Core = require('@alicloud/pop-core');

var client = new Core({
  accessKeyId: 'LTAIKlkSwGRxGUs2',
  accessKeySecret: 'VwwbCrudDp7g2cDmk6vNBtiwcCliyV',
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25'
});

var messageObj = {
  name:"tom",
  title:"抓老鼠",
  time: "2019年05月12日"
}

var params = {
  "PhoneNumbers": "15555105983",
  "SignName": "中节能合肥",
  "TemplateCode": "SMS_166096683",
  "TemplateParam": JSON.stringify(messageObj)
}

var requestOption = {
  method: 'POST'
};

client.request('SendSms', params, requestOption).then((result) => {
  console.log(result);
}, (ex) => {
  console.log(ex);
})