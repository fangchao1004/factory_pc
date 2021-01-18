export const testData = [
    {
        "index": 0,
        "background": "assets/imgs/热控1.png",
        "components": [
            {
                "type": "input",
                "is_no": 1,
                "attribute": {
                    "disabled": true,
                    "value": "",
                    "maxLength": "24",
                    "name": "工作票编号",
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 424,
                        "top": 232,
                        "width": 220,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "type": "number",
                    "min": "0",
                    "name": "附页几张",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0, 1],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 683,
                        "top": 232,
                        "width": 60,
                        "height": 16,
                        "fontSize": 15,
                        "textAlign": "center",
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "name": "1@部门",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0, 1],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 165,
                        "top": 261,
                        "width": 140,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "name": "1@班组",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0, 1],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 342,
                        "top": 261,
                        "width": 130,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "1@工作负责人",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0, 1],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "borderColor": "red",
                        "left": 646,
                        "top": 258,
                        "width": 112,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "textarea",
                "attribute": {
                    "value": "",
                    "name": "2@工作班成员",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0, 1],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 115,
                        "top": 282,
                        "width": 648,
                        "height": 60,
                        "lineHeight": "32px",
                        "fontSize": 15,
                        "textIndent": 220,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "type": "number",
                    "min": "1",
                    "name": "2@共几人",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0, 1],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 686,
                        "top": 325,
                        "width": 60,
                        "height": 16,
                        "fontSize": 15,
                        "textAlign": "center",
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "name": "3@工作地点",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0, 1],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 206,
                        "top": 358,
                        "width": 550,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "textarea",
                "attribute": {
                    "value": "",
                    "name": "4@工作内容",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0, 1],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 114,
                        "top": 381,
                        "width": 648,
                        "height": 60,
                        "lineHeight": "32px",
                        "fontSize": 15,
                        "textIndent": 92,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "daterange",
                "attribute": {
                    "value": "",
                    "name": "5@计划工作时间",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0, 1],
                    "style": {
                        "position": "absolute",
                        "border": "none",
                        "left": 248,
                        "top": 457,
                        "width": 488,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "name": "6@自动装置名称",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0, 1],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 378,
                        "top": 490,
                        "width": 380,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "name": "7@运行人员执行1",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0, 1],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 92,
                        "top": 632,
                        "width": 494,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "checkbox",
                "attribute": {
                    "value": "",
                    "name": "7@运行人员执行1_checkbox",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [3],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 664,
                        "top": 626,
                        "height": 20,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "name": "7@运行人员执行2",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 92,
                        "top": 667,
                        "width": 494,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "checkbox",
                "attribute": {
                    "value": "",
                    "name": "7@运行人员执行2_checkbox",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 664,
                        "top": 661,
                        "height": 20,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "name": "7@运行人员执行3",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 92,
                        "top": 700,
                        "width": 494,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "checkbox",
                "attribute": {
                    "value": "",
                    "name": "7@运行人员执行3_checkbox",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 664,
                        "top": 695,
                        "width": 145,
                        "height": 20,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "name": "7@运行值班人员1",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0, 1],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 92,
                        "top": 768,
                        "width": 494,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "checkbox",
                "attribute": {
                    "value": "",
                    "name": "7@运行值班人员1_checkbox",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [3],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 664,
                        "top": 762,
                        "width": 145,
                        "height": 20,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "name": "7@运行值班人员2",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 92,
                        "top": 802,
                        "width": 494,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "checkbox",
                "attribute": {
                    "value": "",
                    "name": "7@运行值班人员2_checkbox",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 664,
                        "top": 796,
                        "width": 145,
                        "height": 20,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "name": "7@运行值班人员3",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 92,
                        "top": 837,
                        "width": 494,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "checkbox",
                "attribute": {
                    "value": "",
                    "name": "7@运行值班人员3_checkbox",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 664,
                        "top": 830,
                        "width": 145,
                        "height": 20,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "name": "7@工作负责人1",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 92,
                        "top": 905,
                        "width": 494,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "checkbox",
                "attribute": {
                    "value": "",
                    "name": "7@工作负责人1_checkbox",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [3],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 664,
                        "top": 898,
                        "width": 145,
                        "height": 20,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "name": "7@工作负责人2",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 92,
                        "top": 940,
                        "width": 494,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "checkbox",
                "attribute": {
                    "value": "",
                    "name": "7@工作负责人2_checkbox",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 664,
                        "top": 932,
                        "width": 145,
                        "height": 20,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "checkboxgroup",
                "attribute": {
                    "options": [
                        {
                            "label": "动火作业",
                            "value": "动火作业"
                        },
                        {
                            "label": "受限空间作业",
                            "value": "受限空间作业"
                        },
                        {
                            "label": "高处作业",
                            "value": "高处作业"
                        },
                        {
                            "label": "起重吊运作业",
                            "value": "起重吊运作业"
                        },
                        {
                            "label": "动土作业",
                            "value": "动土作业"
                        },
                        {
                            "label": "临时用电作业",
                            "value": "临时用电作业"
                        },
                        {
                            "label": "管线打开作业",
                            "value": "管线打开作业"
                        },
                        {
                            "label": "脚手架拆塔作业",
                            "value": "脚手架拆塔作业"
                        },
                        {
                            "label": "断路作业",
                            "value": "断路作业"
                        },
                        {
                            "label": "无",
                            "value": "无"
                        }
                    ],
                    "value": [],
                    "name": "7@高风险工作票_checkboxgroup",
                    "able_list": [{ "status": 0, "per": [0, 3] }, { "status": 1, "per": [0, 3] }],
                    "no_null_status_list": [0, 1],
                    "style": {
                        "backgroundColor": "#ffffff",
                        "position": "absolute",
                        "border": "none",
                        "left": 100,
                        "top": 984,
                        "width": 645,
                        "height": 40,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "7@工作票签发人",
                    "able_list": [{ "status": 1, "per": [0] }],
                    "no_null_status_list": [1],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 214,
                        "top": 1034,
                        "width": 130,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "datepicker",
                "attribute": {
                    "value": "",
                    "name": "7@签发时间",
                    "able_list": [{ "status": 1, "per": [0] }],
                    "no_null_status_list": [1],
                    "style": {
                        "position": "absolute",
                        "border": "none",
                        "left": 400,
                        "top": 1034,
                        "width": 292,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "7@工作票接收人",
                    "able_list": [{ "status": 2, "per": [1] }],
                    "no_null_status_list": [2],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 214,
                        "top": 1067,
                        "width": 130,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "datepicker",
                "attribute": {
                    "value": "",
                    "name": "7@接收时间",
                    "able_list": [{ "status": 2, "per": [1] }],
                    "no_null_status_list": [2],
                    "style": {
                        "position": "absolute",
                        "border": "none",
                        "left": 400,
                        "top": 1067,
                        "width": 292,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            }
        ]
    },
    {
        "index": 1,
        "background": "assets/imgs/热控2.png",
        "components": [
            {
                "type": "daterange",
                "attribute": {
                    "value": "",
                    "name": "9@批准工作时间",
                    "able_list": [{ "status": 2, "per": [1] }],
                    "no_null_status_list": [2],
                    "style": {
                        "position": "absolute",
                        "border": "none",
                        "left": 240,
                        "top": 86,
                        "width": 434,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "9@值长",
                    "able_list": [{ "status": 2, "per": [1] }],
                    "no_null_status_list": [2],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 296,
                        "top": 120,
                        "width": 120,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "datepicker",
                "attribute": {
                    "value": "",
                    "name": "10@开始工作时间",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [3],
                    "style": {
                        "position": "absolute",
                        "left": 490,
                        "top": 152,
                        "width": 200,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "padding": 0
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "10@运行值班负责人",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [3],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 228,
                        "top": 183,
                        "width": 93,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "10@工作负责人",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [3],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 407,
                        "top": 183,
                        "width": 99,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "10@工作许可人",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [3],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 593,
                        "top": 183,
                        "width": 143,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "textarea",
                "attribute": {
                    "value": "",
                    "name": "10@工作组成员",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [3],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 116,
                        "top": 210,
                        "width": 620,
                        "height": 60,
                        "lineHeight": "32px",
                        "fontSize": 15,
                        "textIndent": 86,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "datepicker",
                "attribute": {
                    "value": "",
                    "name": "11@工作负责人变更时间",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "position": "absolute",
                        "border": "none",
                        "left": 277,
                        "top": 284,
                        "width": 195,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "padding": 0
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "11@变更后工作负责人",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 651,
                        "top": 282,
                        "width": 78,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "11@工作票签发人",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 276,
                        "top": 315,
                        "width": 112,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "11@值班运行负责人",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 510,
                        "top": 315,
                        "width": 130,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "datepicker",
                "attribute": {
                    "value": "",
                    "name": "12@工作票延长",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "position": "absolute",
                        "border": "none",
                        "left": 320,
                        "top": 348,
                        "width": 274,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "12@值长",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 164,
                        "top": 381,
                        "width": 112,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "12@工作许可人",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 370,
                        "top": 381,
                        "width": 107,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "12@工作负责人",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 565,
                        "top": 381,
                        "width": 105,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "datepicker",
                "attribute": {
                    "value": "",
                    "name": "13@允许试运时间_1",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "position": "absolute",
                        "border": "none",
                        "left": 110,
                        "top": 484,
                        "width": 220,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "13@工作许可人_1",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 350,
                        "top": 484,
                        "width": 185,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "textAlign": "center"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "13@工作负责人_1",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 558,
                        "top": 484,
                        "width": 170,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "textAlign": "center"
                    }
                }
            },
            {
                "type": "datepicker",
                "attribute": {
                    "value": "",
                    "name": "13@允许试运时间_2",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "position": "absolute",
                        "border": "none",
                        "left": 110,
                        "top": 518,
                        "width": 220,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "13@工作许可人_2",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 350,
                        "top": 518,
                        "width": 185,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "textAlign": "center"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "13@工作负责人_2",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 558,
                        "top": 518,
                        "width": 170,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "textAlign": "center"
                    }
                }
            },
            {
                "type": "datepicker",
                "attribute": {
                    "value": "",
                    "name": "13@允许试运时间_3",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "position": "absolute",
                        "border": "none",
                        "left": 110,
                        "top": 553,
                        "width": 220,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "13@工作许可人_3",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 350,
                        "top": 553,
                        "width": 185,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "textAlign": "center"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "13@工作负责人_3",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 558,
                        "top": 553,
                        "width": 170,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "textAlign": "center"
                    }
                }
            },
            {
                "type": "datepicker",
                "attribute": {
                    "value": "",
                    "name": "14@允许恢复工作时间_1",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "position": "absolute",
                        "border": "none",
                        "left": 110,
                        "top": 656,
                        "width": 220,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "14@工作许可人_1",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 350,
                        "top": 656,
                        "width": 185,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "textAlign": "center"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "14@工作负责人_1",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 558,
                        "top": 656,
                        "width": 170,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "textAlign": "center"
                    }
                }
            },
            {
                "type": "datepicker",
                "attribute": {
                    "value": "",
                    "name": "14@允许恢复工作时间_2",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "position": "absolute",
                        "border": "none",
                        "left": 110,
                        "top": 689,
                        "width": 220,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "14@工作许可人_2",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 350,
                        "top": 689,
                        "width": 185,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "textAlign": "center"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "14@工作负责人_2",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 558,
                        "top": 689,
                        "width": 170,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "textAlign": "center"
                    }
                }
            },
            {
                "type": "datepicker",
                "attribute": {
                    "value": "",
                    "name": "14@允许恢复工作时间_3",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "position": "absolute",
                        "border": "none",
                        "left": 110,
                        "top": 724,
                        "width": 220,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "14@工作许可人_3",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 350,
                        "top": 724,
                        "width": 185,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "textAlign": "center"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "14@工作负责人_3",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 558,
                        "top": 724,
                        "width": 170,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun",
                        "textAlign": "center"
                    }
                }
            },
            {
                "type": "datepicker",
                "attribute": {
                    "value": "",
                    "name": "15@结束时间",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [3],
                    "style": {
                        "position": "absolute",
                        "border": "none",
                        "left": 549,
                        "top": 758,
                        "width": 210,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "15@工作负责人",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [3],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 196,
                        "top": 820,
                        "width": 104,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "select",
                "attribute": {
                    "value": "",
                    "name": "15@工作许可人",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [3],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 380,
                        "top": 820,
                        "width": 120,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            },
            {
                "type": "input",
                "attribute": {
                    "value": "",
                    "name": "16@备注",
                    "able_list": [{ "status": 3, "per": [1] }],
                    "no_null_status_list": [],
                    "style": {
                        "background": "transparent",
                        "position": "absolute",
                        "border": "none",
                        "left": 187,
                        "top": 858,
                        "width": 570,
                        "height": 16,
                        "fontSize": 15,
                        "fontWeight": 600,
                        "fontFamily": "SimSun"
                    }
                }
            }
        ]
    }
]