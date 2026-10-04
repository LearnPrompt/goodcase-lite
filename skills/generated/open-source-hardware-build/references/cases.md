# Case evidence

This workflow is derived from 9 published Cases across 9 creators.

## Operating rule

Choose one evidence card below as the anchor before drafting. Inspect its finished media, then state which traits will be preserved, replaced, and avoided. A title match alone is not evidence.

### E1 · Autonomous Lamp 开源桌面机械台灯

- Creator: 黄阿猫
- Evidence: [GoodCase](https://goodcase.ai/cases/autonomous-lamp-164de3169918) · [finished media](https://media.goodcase.ai/cases/86f9b2297304.mp4) · [poster](https://media.goodcase.ai/cases/c6062f7f05d8.jpeg) · [original source](https://www.douyin.com/video/7675704067657600306)
- Summary: 开源桌面机械台灯 Autonomous Lamp：奶白机械骨架 + 环形灯带，无屏幕，靠多轴机械转头、摇晃与光影变化与人互动，作者称其“完全开源可拓展”。
- Prompt excerpt:

> 一款超有意思的皮皮灯 谁能拒绝一盏像皮克斯动画里一样“活过来”的桌面台灯？Autonomous Lamp 凭借独特的奶白机械骨架和环形灯带设计，直接把桌面美学拉满！它不需要任何屏幕，而是通过多轴机械结构的转头、摇晃和光影变化来与你完成互动，同时还拥有完全开源的拓展能力。

### E2 · LeKiwi低成本移动机械臂

- Creator: SIGRobotics-UIUC
- Evidence: [GoodCase](https://goodcase.ai/cases/lekiwi) · [finished media](https://media.goodcase.ai/cases/201acf0cc829.jpg) · [original source](https://github.com/SIGRobotics-UIUC/LeKiwi)
- Summary: 三轮全向底盘配SO-ARM101机械臂的低成本移动机械臂，配合LeRobot库做遥操作和数据采集，整机12V版约482美元、5V版约499美元。
- Prompt excerpt:

> 这是什么：
> LeKiwi是伊利诺伊大学香槟分校SIGRobotics社团做的低成本移动操作平台，用三轮全向（Kiwi drive）底盘配上SO-ARM101机械臂，是后来XLeRobot等项目直接复用的移动底盘方案。
>
> 硬件清单与大致成本：
> 1只SO-ARM101机械臂、三轮全向轮底盘、树莓派5、workspace和wrist两个RGB相机，电源分12V锂电池版和5V笔记本充电宝版。官方BOM显示整机12V版约482美元、5V版约499美元，只买底盘（不含机械臂）5V版约248美元、12V版约251.5美元（均不含3D打印和工具）。
>
> 复刻步骤概览：
> 1. 按BOM.md采购机械臂、底盘、树莓派和相机等全部零件
> 2. 按3DPrinting.md打印底盘和安装结构件
> 3. 按Assembly.md组装整机
> 4. 参考LeRobot官方教程接入软件栈，跑通遥操作
> 5. 用手柄、键盘或主臂控制车体加机械臂联动
> 6. 采集workspace/wrist相机数据，为模仿学习攒数据集
>
> 上手建议：
> 第一次搭建建议选5V笔记本充电宝版本，官方原文写明这个版本组装难度更低，12V版本适合有经验、需要更大负载能力的人再上。

### E3 · 5美元芯片AI助手MimiClaw

- Creator: memovai
- Evidence: [GoodCase](https://goodcase.ai/cases/mimiclaw) · [finished media](https://media.goodcase.ai/media/image/mimiclaw.jpg) · [original source](https://github.com/memovai/mimiclaw)
- Summary: 跑在5美元ESP32-S3芯片上的AI助手，不装Linux不装Node.js纯C实现，靠Telegram对话调用Claude或GPT完成任务并跨重启记住历史。
- Prompt excerpt:

> 这是什么：
> MimiClaw把一整套AI Agent能力（思考、调工具、读写记忆）塞进一颗不跑Linux的ESP32-S3芯片，用纯C实现，通过Telegram收发消息，支持切换Anthropic Claude或OpenAI GPT作为模型提供方，所有数据存在本地flash里。
>
> 硬件清单与大致成本：
> 一块16MB flash+8MB PSRAM的ESP32-S3开发板（如Xiaozhi AI board，约10美元）、一根USB Type-C数据线，外加一个Telegram Bot Token和一个Anthropic或OpenAI的API Key。芯片本身约5美元，整套硬件成本远低于一般消费电子。
>
> 复刻步骤概览：
> 1. 安装ESP-IDF v5.5及以上版本开发环境
> 2. clone仓库，执行idf.py set-target esp32s3
> 3. 复制main/mimi_secrets.h.example为mimi_secrets.h，填入WiFi、Telegram Token、API Key和模型提供方
> 4. 执行idf.py fullclean && idf.py build编译固件
> 5. 用idf.py -p PORT flash monitor把固件刷进开发板并看串口日志
> 6. 在Telegram里找到你的机器人发消息，触发它执行任务
>
> 上手建议：
> 只要改过mimi_secrets.h，必须先fullclean再build，官方原文专门加粗提醒这一步，漏掉的话新配置不会生效。

### E4 · 迷你BDX机器鸭

- Creator: apirrone
- Evidence: [GoodCase](https://goodcase.ai/cases/open-duck-mini) · [finished media](https://media.goodcase.ai/cases/b21e76147f23.png) · [original source](https://github.com/apirrone/Open_Duck_Mini)
- Summary: 复刻迪士尼BDX机器人的桌面迷你版，42厘米高，强化学习步态已经sim2real上真机，BOM成本官方标注约400美元以内。
- Prompt excerpt:

> 这是什么：
> Open Duck Mini v2是对迪士尼BDX droid的迷你复刻，双足站立42厘米高，作者形容这个仓库是“还在推进中的工作仓库”，很多脚本没写文档，会持续整理。
>
> 硬件清单与大致成本：
> 主要靠3D打印结构件搭骨架，机载计算用树莓派Zero 2W跑训练好的行走策略，具体舵机/电控型号在README里没有列全，完整BOM在官方Google表格链接里（含中文版飞书文档）。官方原文写明全套BOM成本控制在400美元以内。
>
> 复刻步骤概览：
> 1. 打开官方BOM表格采购全部零件
> 2. 按print_guide把结构件3D打印出来
> 3. 按assembly_guide组装（官方自己标注这份指南还不完整）
> 4. 直接用官方放出的两个已训练onnx行走策略试跑，或用MuJoCo Playground自己重新训练
> 5. 通过Open_Duck_Mini_Runtime仓库把策略部署到树莓派Zero 2W上跑sim2real
> 6. 想训练自己的策略可参考sim2real.md文档
>
> 上手建议：
> 装配指南官方自己标注为不完整，遇到卡点建议直接进Discord社区问，别死磕文档。

### E5 · NASA开源火星车

- Creator: nasa-jpl
- Evidence: [GoodCase](https://goodcase.ai/cases/open-source-rover) · [finished media](https://media.goodcase.ai/media/image/open-source-rover.jpg) · [original source](https://github.com/nasa-jpl/open-source-rover)
- Summary: JPL放出的6轮火星车全套硬件设计，摇臂-转向架悬挂加差速枢轴让每个轮子都贴地爬坡，树莓派做大脑，全套约1600美元。
- Prompt excerpt:

> 这是什么：
> NASA JPL放出的开源火星车硬件项目，等比缩小复刻JPL用于火星探测的6轮车设计，全部用消费级现货件（COTS）拼出来，从2017年做到现在，官方拿到了OSHW开源硬件认证。
>
> 硬件清单与大致成本：
> 10个电机驱动6轮，铝制车体结构，GoBilda现货件为主，树莓派做控制大脑，7.2Ah电池可跑约3小时。官方给出的整机成本约1600美元（不含运费和工具）。
>
> 复刻步骤概览：
> 1. 按parts_list清单在GoBilda等渠道下单全部零件
> 2. 先做电缆线束，再焊装PCB电路板
> 3. 组装车体、两组摇臂转向架和驱动/转向电机总成
> 4. 把电缆和电子部分集成进机械结构
> 5. 按osr-rover-code仓库教程给树莓派配置控制软件
> 6. 全部装好后跑通驱动测试，再按需要加装传感器扩展
>
> 上手建议：
> 官方估计整机搭建至少需要100人时，涉及金属切削、焊接布线和基础Linux/ROS/Python知识，建议先看Slack社区里的经验贴，别低估工作量。

### E6 · OpenCat四足机器人框架

- Creator: PetoiCamp
- Evidence: [GoodCase](https://goodcase.ai/cases/opencat) · [finished media](https://media.goodcase.ai/cases/1ee187a66c0d.gif) · [original source](https://github.com/PetoiCamp/OpenCat-Quadruped-Robot)
- Summary: Petoi做的四足机器人开源框架，同一套代码同时驱动Bittle机器狗和Nybble机器猫，处理步态协调、舵机控制和IMU姿态融合。
- Prompt excerpt:

> 这是什么：
> OpenCat是Petoi公司维护的Arduino+树莓派四足机器人开源框架，创始人Rongzhong Li 2016年在Wake Forest大学宿舍里开始做，目标是把敏捷四足机器人的门槛降到研究者、教育者和爱好者都能上手的程度，现在同时驱动Bittle机器狗和Nybble机器猫两条产品线。
>
> 硬件清单与大致成本：
> 核心是基于ATmega328P的NyBoard主控板，最多协调12颗舵机完成走、跑、跳跃甚至后空翻，可选加装传感器包、摄像头模块，或接树莓派/Jetson Nano做AI协处理器。整机通常以Bittle/Nybble成品套件形式购买，具体到手价以Petoi官网当前售价为准，本仓库README未给出统一整机报价。
>
> 复刻步骤概览：
> 1. clone仓库，去掉文件夹名里的-main/分支名后缀
> 2. 打开OpenCat.ino，选择机型（BITTLE/NYBBLE）和板子版本（NyBoard_V1_0等）
> 3. 注释掉MAIN_SKETCH进入配置模式，上传固件
> 4. 串口监视器设为无行结束符、115200波特率，按提示做关节归零和IMU校准（机身放平桌面）
> 5. 校准完成后取消注释MAIN_SKETCH，切回主程序模式重新上传
> 6. 用红外遥控、Petoi App、Python或串口指令开始控制机器人动作
>
> 上手建议：
> 这个仓库对应的是老款NyBoard硬件（ATmega328P），新一代ESP32/BiBoard硬件要去OpenCatESP32仓库，买错板子代码会对不上。
>
> 注：成本档为编辑估算，官方未公布整机总价。

### E7 · reMarkable墨水日记本Riddle

- Creator: MaximeRivest
- Evidence: [GoodCase](https://goodcase.ai/cases/riddle) · [finished media](https://media.goodcase.ai/media/image/riddle.jpg) · [original source](https://github.com/MaximeRivest/riddle)
- Summary: reMarkable Paper Pro上的AI日记应用，笔尖写字停顿后页面吸走墨迹，AI再用手写体一笔一划写回复，零屏幕UI纯靠触感交互。
- Prompt excerpt:

> 这是什么：
> riddle是一款跑在reMarkable Paper Pro电子纸平板上的AI日记应用：用笔写字，停顿后页面“喝掉”你的墨迹，思考片刻后AI用一手流畅字迹把回复逐笔写回纸面，然后淡出，全程没有屏幕UI、没有键盘、没有聊天窗口。
>
> 硬件清单与大致成本：
> 需要一台reMarkable Paper Pro（开发者模式+xovi/AppLoad启动器，仅在ferrari/aarch64机型、OS 3.26-3.27上测试过），加一个OpenAI兼容的API Key（支持OpenAI、OpenRouter、Groq或自建本地服务）。本项目软件本身免费，硬件成本主要是平板本身。
>
> 复刻步骤概览：
> 1. 用配套工具remagic给reMarkable开启开发者模式并装好xovi+AppLoad
> 2. 执行remagic install riddle一键安装，或从release下载压缩包用scp传进设备
> 3. 复制oracle.env.example为oracle.env，填入RIDDLE_OPENAI_KEY等参数
> 4. 在AppLoad里点开The Diary启动应用（会接管整个屏幕）
> 5. 用笔写字，停顿约2.8秒后页面自动提交给AI处理
> 6. 五指同时点屏可退出接管模式，系统自带UI会自动恢复
>
> 上手建议：
> 官方原文明确警告这是takeover模式，会以root权限接管整个reMarkable系统，操作前务必确认SSH能连通，以防系统卡死变砖。
>
> 注：成本档为编辑估算，官方未公布整机总价。

### E8 · SO-101开源机械臂

- Creator: TheRobotStudio
- Evidence: [GoodCase](https://goodcase.ai/cases/so-arm100) · [finished media](https://media.goodcase.ai/media/image/so-arm100.jpg) · [original source](https://github.com/TheRobotStudio/SO-ARM100)
- Summary: 低成本机械臂标准件，主从两只臂配合LeRobot库做遥操作和模仿学习采集，全套网购加3D打印就能装，双臂约230美元。
- Prompt excerpt:

> 这是什么：
> RobotStudio联合Hugging Face LeRobot团队做的标准开源机械臂SO-101，是SO-100的下一代，改进了走线并且不用拆齿轮就能装配，专为配合LeRobot开源库做遥操作和模仿学习设计。
>
> 硬件清单与大致成本：
> 主从两只臂共用STS3215舵机（从臂6颗、主臂6颗，型号略有差异），配Waveshare电机控制板和3D打印结构件。官方BOM显示双臂（一主一从）合计约229.88美元，只做单只从臂约121.94美元（均不含3D打印、税费和运费）。
>
> 复刻步骤概览：
> 1. 按Sourcing Parts清单在美/欧/中/日任一地区采购舵机和电控板
> 2. 用PLA+材料3D打印主从臂结构件，0.4mm喷嘴、0.2mm层高，或按官方推荐设置打印
> 3. 打印前先用Gauge量规文件校验打印机精度
> 4. 按官方Assembly Guide组装主从两只臂
> 5. 用Feetech软件或直接用LeRobot库配置舵机
> 6. 跟着LeRobot官方教程跑通遥操作，采集示教数据
>
> 上手建议：
> STS3215舵机有7.4V和12V两个版本，别买混——12V力矩更大但需要配12V电源，从臂力矩要求高时才建议换12V版本。

## Evidence index

| Case | Creator | GoodCase evidence | Finished media | Original source | Card |
| --- | --- | --- | --- | --- | --- |
| Autonomous Lamp 开源桌面机械台灯 | 黄阿猫 | [GoodCase](https://goodcase.ai/cases/autonomous-lamp-164de3169918) | [Media](https://media.goodcase.ai/cases/86f9b2297304.mp4) | [Original](https://www.douyin.com/video/7675704067657600306) | E1 |
| LeKiwi低成本移动机械臂 | SIGRobotics-UIUC | [GoodCase](https://goodcase.ai/cases/lekiwi) | [Media](https://media.goodcase.ai/cases/201acf0cc829.jpg) | [Original](https://github.com/SIGRobotics-UIUC/LeKiwi) | E2 |
| 5美元芯片AI助手MimiClaw | memovai | [GoodCase](https://goodcase.ai/cases/mimiclaw) | [Media](https://media.goodcase.ai/media/image/mimiclaw.jpg) | [Original](https://github.com/memovai/mimiclaw) | E3 |
| 迷你BDX机器鸭 | apirrone | [GoodCase](https://goodcase.ai/cases/open-duck-mini) | [Media](https://media.goodcase.ai/cases/b21e76147f23.png) | [Original](https://github.com/apirrone/Open_Duck_Mini) | E4 |
| NASA开源火星车 | nasa-jpl | [GoodCase](https://goodcase.ai/cases/open-source-rover) | [Media](https://media.goodcase.ai/media/image/open-source-rover.jpg) | [Original](https://github.com/nasa-jpl/open-source-rover) | E5 |
| OpenCat四足机器人框架 | PetoiCamp | [GoodCase](https://goodcase.ai/cases/opencat) | [Media](https://media.goodcase.ai/cases/1ee187a66c0d.gif) | [Original](https://github.com/PetoiCamp/OpenCat-Quadruped-Robot) | E6 |
| reMarkable墨水日记本Riddle | MaximeRivest | [GoodCase](https://goodcase.ai/cases/riddle) | [Media](https://media.goodcase.ai/media/image/riddle.jpg) | [Original](https://github.com/MaximeRivest/riddle) | E7 |
| SO-101开源机械臂 | TheRobotStudio | [GoodCase](https://goodcase.ai/cases/so-arm100) | [Media](https://media.goodcase.ai/media/image/so-arm100.jpg) | [Original](https://github.com/TheRobotStudio/SO-ARM100) | E8 |
| Watchy开源电子墨水表 | sqfmi | [GoodCase](https://goodcase.ai/cases/watchy) | [Media](https://media.goodcase.ai/cases/c494980d28a8.png) | [Original](https://github.com/sqfmi/watchy) | E— |

## Derivation boundary

- Inclusion means the published Case matched the method pattern; it does not prove the creator used this exact synthesized workflow.
- Popularity is not part of the Skill threshold.
- Treat GoodCase summaries as editorial evidence and the linked original source as primary evidence.
