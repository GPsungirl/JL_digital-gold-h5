let vm = new Vue({
    el: '#toBuyPay',
    data: {
        showLoading: false,
        // 图片激活
        bankImgs:[
            'IMG/bank_un.png',
            'IMG/bank_active.png'
        ],
        bankImg:'IMG/bank_active.png',
        aplipayImgs:[
            'IMG/alipay_un.png',
            'IMG/alipay_active.png'
        ],
        alipayImg:'IMG/alipay_un.png',
        // 姓名 银行名 银行号 支付宝账户
        username:'',
        bankname:'',
        bankcard:'',
        alipay_account:'',
        total_amount:'',//总金额

        // 手机号
        phone:'',
        activeTab:'bank',
        // 成功加载获取平台账号之后才可以使用该按钮 
        isDisabled:true,

        
        // 订单号
        orderid:'',
        testTime:'',
        vconsole:null,


        // 计时统计
        myTime:'05:00',
       
    },
    created() {
        // 计时统计
        var vm = this;
        var  time = 5 * 60;
        var  timer = setInterval(() => {
            this.myTime = countDown(time--);
            // console.log(show);
            if (time < 0) {
                console.log('倒计时结束！');
                clearInterval(timer);
            }            
        }, 1000);

        // 从缓存取出总金额 手机号
        this.total_amount = localStorage.getItem('BtotalNum');
        this.phone = localStorage.getItem('Bphone');
        // 初始化剪切板
        this.initClipboard();
        // 获取平台账户数据信息 默认取银行卡的
        this.getPlatformAccountno(0);
        
        //FastClick.attach(document.body);
        // 默认买入
        // this.getUserInfo('1');
        // console.log(this)
        // this.$toast({
        //     message:'提交成功',
        //     duration:5000
        // })

       
    },
    watch:{
        // 侦听手机号
        // phone(val){
        //     val = trim(val)
        //     if(val.length==11 && validPhone(val)){
        //         // 先清空
        //         this.resetData();
        //         // 获取用户信息
        //         console.log('获取用户信息')
        //         this.getUserInfo(val)
        //     }else{
        //         this.resetData();
        //     }
        // }
    },
    methods: {
        // *操作-切换tab
        changeTabs(name){
            switch(name){
                case 'bank':
                    this.activeTab = 'bank';
                    this.bankImg = this.bankImgs[1];
                    this.alipayImg = this.aplipayImgs[0];
                    this.getPlatformAccountno(0)
                    break;
                case 'alipay':
                    this.activeTab = 'alipay';
                    this.bankImg = this.bankImgs[0];
                    this.alipayImg = this.aplipayImgs[1];
                    this.getPlatformAccountno(2)
                    break;
                default:
                    this.activeTab = 'bank';
                    this.bankImg = this.bankImgs[1];
                    this.alipayImg = this.aplipayImgs[0];
                    this.getPlatformAccountno(0)
            }
            
        },
        // *初始化剪切板
        initClipboard(){
            let that = this
            var clipboard_bank = new ClipboardJS('.copyData_bank');
            
            clipboard_bank.on('success', function(e) {
                // console.info('Action:', e.action);
                // console.info('Text:', e.text);
                // console.info('Trigger:', e.trigger);
            
                e.clearSelection();
                that.$toast('复制成功')
            });
            
            clipboard_bank.on('error', function(e) {
                // console.error('Action:', e.action);
                // console.error('Trigger:', e.trigger);
            });
            var clipboard_ali = new ClipboardJS('.copyData_ali');
            clipboard_ali.on('success', function(e) {
                // console.info('Action:', e.action);
                // console.info('Text:', e.text);
                // console.info('Trigger:', e.trigger);
            
                e.clearSelection();
                that.$toast('复制成功')
            });
            
            clipboard_ali.on('error', function(e) {
                // console.error('Action:', e.action);
                // console.error('Trigger:', e.trigger);
            });
        },
        // *获取平台账户数据信息 type:账户类别 0银行卡 1数字账号 2支付宝账号 3微信账号
        getPlatformAccountno(type){ 
            let param = {                
                url: commonURL + '/api/order/getPlatformAccountno',
                data: {
                    payAmount:Number(this.total_amount)* 100,
                    accountType:type
                }
            }
            this.showLoading = true;
            myAjax2(param).then(res => {
                
                //成功                  
                if (res.code == '0000') {
                    
                    let _result = res.data.accountInfo; 
                    // ocnsole.log(_result)                   
                    // 姓名 银行卡名 银行卡号 支付宝号
                    this.username = _result.account_username;                                     
                    this.bankname = _result.card_bank;
                    this.bankcard = _result.account_no; 
                    this.alipay_account = _result.account_no;
                                                                             
                    this.isDisabled = false;
                    this.showLoading = false;                                          
                } 

            }).catch(err => {})
        },

        // 获取用户数据
        getUserInfo(phone){
            
            let param = {                
                url: commonURL + '/api/user/selectUserInfo',
                data: {
                    phone:phone
                }
            }
            this.showLoading = true;
            myAjax2(param).then(res => {
                //成功                  
                if (res.code == '0000') {
                    let _result = res.data.userInfo;                    
                    // 姓名 银行卡名 银行卡号 支付宝号
                    this.username = _result.username;
                    this.bankname = _result.bankname;
                    this.bankcard = _result.bankcard;
                    this.alipay_account = _result.alipay_account;
                                        
                    
                    this.showLoading = false;                                          
                } 

            }).catch(err => {})
        },
                              
        onFailed(errorInfo) {
            console.log('failed', errorInfo);
        },
        // 清空数据
        resetData(){
            this.username = '';
            this.digit_account = ''; 
            this.showValidBtn = false;     
        },

        // 操作-下一步
        onSubmit(val){
            
            // 先判断用户是否已经验证了
            if(!this.isUnValid){//重新做一遍新增用户信息接口
                // 缓存手机号  
                localStorage.setItem('Bphone',this.phone);
                let param = {                
                    url: commonURL + '/api/user/addUserInfo',
                    data: {
                        alipay_account:'',//支付宝账号
                        bankcard:'', //银行卡号
                        bankname:'', // 银行名                    
                        wechat_account:'',//微信账户
                        digit_account:this.digit_account,
                        phone:this.phone,    //**
                        username:this.username, //**
                    }
                }
                this.showLoading = true;
                myAjax2(param).then(res => {                                                          
                    if (res.code == '0000') {
                        // 跳转下一页
                        window.location.href="./"
                    } else {                         
                        this.showLoading = false; 
                        this.$toast(res.msg);
                    }
    
                }).catch(err => {})
            }else{
                this.$toast('请完成钱包验证')
            }           
            localStorage.setItem('Bnum',this.usd1Num);
            localStorage.setItem('BtotalPrice',this.totalNum);  
            localStorage.setItem('Btype',this.Btype); 
            //  调往下一步
            if(this.Btype == 'buy'){
                window.location.href=""
            }else{

            }
            
        },
                              
        // 新增订单
        submitOrder(){ 
            let _orderid = Math.floor(new Date().getTime() / 1000) + '' +this.phone;//订单号(手机号+时间戳)
            // **缓存orderid
            localStorage.setItem('Borderid',_orderid);

            // 判断当前平台账户激活类型：bank:0  alipay:2
            let _platform_account_type = this.activeTab == 'bank'? 0 : 2;
            // console.log(localStorage.getItem('BtotalNum'))
            let param = {                
                url: commonURL + '/api/order/addOrderInfo',
                data: {
                    // 用户的账户信息
                    account_no:localStorage.getItem('Baccount_no'),
                    account_type:1,//数字钱包类型(此时是买入)
                    account_username:localStorage.getItem('Busername'),//用户姓名
                    // 平台的账户信息
                    platform_account_name:this.username,
                    platform_account_no:this.bankcard,
                    platform_account_type:_platform_account_type,
                    // 订单信息
                    amount:Number(localStorage.getItem('Bamount')),//总价
                    digit_num:Number(localStorage.getItem('Bnum')),//数量
                    order_type:0,//买
                    orderid:_orderid,
                    phone:this.phone,//手机号
                    pre_single_price:Number(localStorage.getItem('Bpre_single_price')),//预付费单价
                    pre_total_price:Number(localStorage.getItem('Bpre_total_price')),//预付费总价
                    single_price:Number(localStorage.getItem('Bsingle_price')),//单价
                    total_amount:Math.floor(Number(localStorage.getItem('BtotalNum'))*100),//总金额 （费率+总价）
                    type:'1',
                    username:localStorage.getItem('Busername')
                }
            }
            this.showLoading = true;
            myAjax2(param).then(res => {    
                                          
                if (res.code == '0000') {                                      
                    this.showLoading = false; 
                    // 进入放币页面
                   window.location.href= "./fangB.html"
                }else{                    
                    this.showLoading = false; 
                    this.$toast(res.msg);
                    setTimeout(()=>{
                        window.location.href= "./index.html"
                    },2000)
                }              
            }).catch(err => {})
        },
        
        // 校验手机号
        validPhone(val){            
            val = Number(val);
            return /^[1][3,4,5,7,8][0-9]{9}$/.test(val);          
        },
       

       
       
        // 测试300ms延迟事件
        delayms(){
            console.log("点击=" + new Date().getTime())
            // console.log("点击=" + new Date().getTime());
        },
          
                  
        
    }
})