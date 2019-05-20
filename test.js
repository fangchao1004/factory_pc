const Core = require('@alicloud/pop-core');

var client = new Core({
  accessKeyId: 'LTAIKlkSwGRxGUs2',
  accessKeySecret: 'VwwbCrudDp7g2cDmk6vNBtiwcCliyV',
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25'
});

var params = {
  "PhoneNumbers": "18119645092",
  "SignName": "大鱼测试",
  "TemplateCode": "SMS_165413828",
  "TemplateParam": "{\"status\":\"abc\",\"remark\":\"ccc\"}"
}

var requestOption = {
  method: 'POST'
};

client.request('SendSms', params, requestOption).then((result) => {
  console.log(result);
}, (ex) => {
  console.log(ex);
})