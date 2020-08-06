let vm = new Vue({
    el: '#toSellUser',
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
        showValidDialog:false,
        // 真实姓名
        realname:'',
        // 身份证号
        idcard_encrypt:'',

        // 成功加载获取平台账号之后才可以使用该按钮 
        isDisabled:true,

        
        // 订单号
        orderid:'',
        testTime:'',
        vconsole:null,
        // 卖出数量
        Bnum:'',
       
    },
    created() {
        this.Bnum = localStorage.getItem('Bnum');
    },
    watch:{
        // 侦听手机号
        phone(val){
            val = trim(val)
            if(val.length==11 && validPhone(val)){
                // 先清空
                this.resetData();                                
                this.getUserInfo(val)
            }else{
                this.resetData();
            }
        }
    },
    methods: {
        // *操作-切换tab
        changeTabs(name){
            switch(name){
                case 'bank':
                    this.bankImg = this.bankImgs[1];
                    this.alipayImg = this.aplipayImgs[0];
                    this.activeTab = name;
                    break;
                case 'alipay':
                    this.bankImg = this.bankImgs[0];
                    this.alipayImg = this.aplipayImgs[1];
                    this.activeTab = name;
                    break;
                default:
                    this.bankImg = this.bankImgs[1];
                    this.alipayImg = this.aplipayImgs[0];
                    this.activeTab = 'bank';
                    
            }
            
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

        // 下一步
        nextStep(){
            // **缓存用户账户类型
            localStorage.setItem('BaccountType',this.activeTab);
            localStorage.setItem('Busername',this.username);
            localStorage.setItem('Bphone',this.phone);
            // 判断当前的激活项
            if(this.activeTab == 'bank'){
                Promise.all([
                    this.$refs.userForm.validate('username'),
                    this.$refs.userForm.validate('phone'),
                    this.$refs.bankForm.validate('bankcard'),
                ])
                .then(res=>{                                                           
                    // 先判定银行卡是否正确
                    let param = {                
                        url: commonURL + '/api/user/getBankName',
                        data: {
                            bankCard:this.bankcard
                        }
                    }
                    this.showLoading = true;
                    myAjax2(param).then(res => {
                         
                        if (res.code == '0000') {                    
                            this.bankname = res.data.bankName; 
                            this.showLoading = false;
                            // **缓存银行卡号
                            localStorage.setItem('Bbankcard',this.bankcard);
                            
                            this.addUser()
                        }else{
                            this.$toast('请输入正确的银行卡号')
                            this.showLoading = false;
                        }
        
                    }).catch(err => {})
                    
                })
                .catch(err=>{})
            }else{
                Promise.all([
                    this.$refs.userForm.validate('username'),
                    this.$refs.userForm.validate('phone'),
                    this.$refs.aliForm.validate('alipay_account'),
                ])
                .then(res=>{
                    // **缓存账户信息                     
                    localStorage.setItem('Bbankcard',this.alipay_account);
                    this.addUser();
                })
                .catch(err=>{})
            }
            
        },

        // 新增用户信息
        addUser(){                    
               
            let param = {                
                url: commonURL + '/api/user/addUserInfo',
                data: {
                    alipay_account:this.alipay_account,//支付宝账号
                    bankcard:this.bankcard, //银行卡号
                    bankname:this.bankname, // 银行名                    
                    wechat_account:'',//微信账户
                    digit_account:'',//此处没有数字钱包
                    phone:this.phone,    //**
                    username:this.username, //**
                }
            }
            this.showLoading = true;
            myAjax2(param).then(res => {                                 
                if (res.code == '0000') {                                                       
                    this.showLoading = false;
                    // 跳转到sellPay页面
                    window.location.href= "./sellPay.html"
                } else { 
                    
                    this.showLoading = false; 
                    this.$toast(res.msg);
                }

            }).catch(err => {})
        },
        // 验证身份证号
        API_checkIdentifier(done){
            let param = {                
                url: commonURL + '/api/user/checkIdentifier',
                data: {
                    phone:this.phone,
                    idcard_encrypt:this.idcard_encrypt, 
                    realname:this.realname,
                }
            }
            this.showLoading = true;
            myAjax2(param).then(res => {
                console.log(res)                                
                if (res.code == '0000') { 
                    this.showLoading = false;
                    this.$toast(res.msg);
                    done();                                                         
                } else { 
                    this.showLoading = false;
                    done(false);
                    this.$toast(res.msg);
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
                console.log(res)
                //成功(卖出时先看是否实名认证)                  
                if (res.code == '0000') {                    
                    let _result = res.data.userInfo; 
                    this.username = _result.username;
                    this.bankname = _result.bankname;
                    this.bankcard = _result.bankcard;
                    this.alipay_account = _result.alipay_account;  
                    if(_result.identity_status == 0 && this.Bnum > 100){ //未实名
                        this.showValidDialog = true;
                        this.showLoading = false;
                    }else{
                        this.showValidDialog = false;
                        this.showLoading = false;
                        
                    }  
                    // // 判断用户库存是否充足
                    // if(_result.user_account_remain<localStorage.getItem('Bnum')){
                    //     this.$toast('卖出数量超出账户余额')
                    //     setTimeout(() => {
                    //         window.location.href="./index.html";
                    //     }, 4000);
                       
                    // }
                }else if(res.code == '0002'){//冻结
                    this.showLoading = false;    
                    this.$toast(res.msg);
                    setTimeout(()=>{
                        window.location.href="./index.html"
                    },2000)
                }else{
                    if(this.Bnum > 100){
                        this.showValidDialog = true;
                    }
                    
                    this.showLoading = false;
                }

            }).catch(err => {})
        },
        
        // 查询银行名称
        queryBankName(){
            let param = {                
                url: commonURL + '/api/user/getBankName',
                data: {
                    bankCard:this.bankcard
                }
            }
            
            myAjax2(param).then(res => {
                console.log(res);                
                if (res.code == '0000') {                    
                    this.bankname = res.data.bankName;                                                                                                                                                                                      
                } 

            }).catch(err => {})
        },

        onFailed(errorInfo) {
            console.log('failed', errorInfo);
        },
        // 清空数据
        resetData(){
            this.username = '';
            
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
            let _orderid = this.phone+''+new Date().getTime();//订单号(手机号+时间戳)
            // 缓存orderid
            localStorage.setItem('Borderid',_orderid);

            let param = {                
                url: commonURL + '/api/order/addOrderInfo',
                data: {
                    account_no:localStorage.getItem('Baccount_no'),
                    account_type:1,//数字钱包(此时是买入)
                    account_username:this.username,//姓名
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
                }                 
            }).catch(err => {})
        },
        
        // 校验手机号
        validPhone(val){            
            val = Number(val);
            return /^[1][3,4,5,7,8][0-9]{9}$/.test(val);          
        },
        
        // 提交-验证
        confirm_valid(action,done){
            switch(action){
                case 'cancel':
                    done()
                    break;
                case 'confirm':
                    Promise.all([
                        this.$refs.validForm.validate('realname'),
                        this.$refs.validForm.validate('idcard_encrypt')
                    ]) 
                    .then(res=>{
                        // 身份证校验接口
                        this.API_checkIdentifier(done);                                                
                    })
                    .catch(err=>{ done(false) })                                      
                    break;
                default:
                    done();
            }                                    
        },

       
       
        // 测试300ms延迟事件
        delayms(){
            console.log("点击=" + new Date().getTime())
            // console.log("点击=" + new Date().getTime());
        },
          
                  
        
    }
})