let vm = new Vue({
    el: '#toBuyUser',
    data: {
        showLoading: false,
        // 手机号
        phone:'',
        // 姓名
        username:'',
        // 钱包账户
        digit_account:'',
        showValidBtn:false,
        // 钱包验证弹框
        showValidDialog:false,

        // 是否是未认证
        isUnValid:false,
        // 校验数值
        check_digit_num:'',
        // 订单号
        orderid:'',
        testTime:'',
        vconsole:null,


        showValidDialog2:false,
        showDigitDialog:false,
        isConfirmDigit:false,
        // 真实姓名
        realname:'',
        // 身份证号
        idcard_encrypt:'',


        // 购买数量
        Bnum:'',
    },
    created() {
        
        this.Bnum = localStorage.getItem('Bnum');        
        if(localStorage.getItem('digitaccount')=='undefined'){            
            this.digit_account = ''
        }else{
            this.digit_account = localStorage.getItem('digitaccount')                        
        }
        // 钱包地址                               
         // 测试
        //  this.digit_account = 'xxx001'
         // 测试

    },
    watch:{
        // 侦听手机号
        phone(val){
            val = trim(val)
            if(val.length==11 && validPhone(val)){
                // 先清空
                this.resetData();
                // 获取用户信息
                
                this.getUserInfo(val)
            }else{
                this.resetData();
            }
        }
    },
    methods: {
        
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
                   
                if (res.code == '0000') {//库里有数据
                    let _result = res.data.userInfo;                    
                    this.username = _result.username;
                    // this.digit_account = _result.digit_account;

                    // 钱包认证处理
                    // if(_result.check_status == 0 ){ //老用户 未认证                        
                    //     this.showValidBtn = true;
                    //     this.isUnValid = true;
                    // }else{ //已认证
                    //     this.showValidBtn = false;
                    //     this.isUnValid = false;
                    // }


                    // 实名认证处理 老用户未实名 购买数量>100
                    if(_result.identity_status == 0 && this.Bnum > 100 ){ //未实名
                        this.showValidDialog2 = true;
                        
                    }else{
                        this.showValidDialog2 = false;
                        
                        
                    }
                    this.showLoading = false;                                          
                }else if(res.code == '0002'){//冻结
                    
                    this.showLoading = false;    
                    this.$toast(res.msg);
                    setTimeout(()=>{
                        window.location.href="./index.html"
                    },2000)
                }else { // 库里无数据(需要校验钱包) 新用户 未认证
                    // this.showValidBtn = true;
                    // this.isUnValid = true;
                    this.showLoading = false; 

                    // 新用户必须先身份认证 购买数量>100
                    if( this.Bnum > 100){
                        this.showValidDialog2 = true;
                    }
                    
                    //this.$toast(res.msg);
                }

            }).catch(err => {})
        },
        
        
        

        // 清空数据
        resetData(){
            this.username = '';
            // this.digit_account = ''; 
            this.showValidBtn = false;     
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
                    this.username = this.realname
                    this.$toast(res.msg);
                    done();                                                         
                } else { 
                    this.showLoading = false;
                    done(false);
                    this.$toast(res.msg);
                }

            }).catch(err => {})
        },

        // 钱包地址弹出框
        confirm_digit(action,done){
            switch(action){
                case 'cancel':
                    this.isConfirmDigit = false
                    done()
                    break;
                case 'confirm':
                    this.isConfirmDigit = true
                    done()
                    break;

            }            
        },  

        // 操作-下一步
        onSubmit(val){
            if(!this.digit_account) return this.$toast('钱包地址必填');
            // 先验证钱包地址和内存中的是否一致
            if(!(this.digit_account == localStorage.getItem('digitaccount'))){
                if(!this.isConfirmDigit){
                    this.showDigitDialog = true
                }                               
            }else{
                this.isConfirmDigit = true
            }
            // 先判断用户是否已经验证了
            if(this.isConfirmDigit){//重新做一遍新增用户信息接口
                // **缓存手机号 用户名 数字钱包
                localStorage.setItem('Bphone',this.phone);
                localStorage.setItem('Baccount_no',this.digit_account);
                localStorage.setItem('Busername',this.username);
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
                        console.log('看看总金额'+localStorage.getItem('BtotalNum'))
                        window.location.href="./buyPay.html"
                    } else {                         
                        this.showLoading = false; 
                        this.$toast(res.msg);
                    }
    
                }).catch(err => {})
            }else{
                return 
            }  
            
            // localStorage.setItem('BtotalPrice',this.totalNum);  
            // localStorage.setItem('Btype',this.Btype); 
            // //  调往下一步
            // if(this.Btype == 'buy'){
            //     window.location.href=""
            // }else{

            // }
            // console.log('过来了吗')
        },

        // 提交-验证钱包数值
        confirm_valid(action,done){
            switch(action){
                case 'cancel':
                    done()
                    break;
                case 'confirm':
                    this.$refs.validForm.validate('check_digit_num')
                    .then(res=>{
                        // 验证钱包数额
                        this.API_validDigit(done);                                                
                    })
                    .catch(err=>{ done(false) })
                    break;
                default:
                    done();
            }                                    
        },
        // 提交-验证身份信息
        confirm_valid2(action,done){
            switch(action){
                case 'cancel':
                    done()
                    break;
                case 'confirm':
                    Promise.all([
                        this.$refs.validForm2.validate('realname'),
                        this.$refs.validForm2.validate('idcard_encrypt')
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
        // 验证钱包数额
        API_validDigit(done){
            
            let param = {                
                url: commonURL + '/api/user/checkUserInfo',
                data: {
                    check_digit_num:Number(this.check_digit_num), 

                    phone:this.phone,
                }
            }
            this.showLoading = true;
            myAjax2(param).then(res => {
                console.log(res)                                
                if (res.code == '0000') {
                    this.showLoading = false; 
                    this.$toast(res.msg);
                    // 验证通过后隐藏钱包验证按钮 修改验证状态
                    this.showValidBtn = false;
                    this.isUnValid = false;

                    done();                    
                } else { 
                    done(false);//阻止弹框关闭
                    this.showLoading = false; 
                    this.showValidBtn = true;
                    this.isUnValid = true; // 未认证
                    this.$toast(res.msg);
                
                }

            }).catch(err => {})
        },

        // 新增用户信息
        addUser(){
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
                
                //成功                  
                if (res.code == '0000') {
                    // 成功后打开 验证对话框
                    // 清空校验数值 打开dialog
                    this.check_digit_num = '';                
                    this.showValidDialog = true;
                    this.showLoading = false;    

                } else { 
                    
                    this.showLoading = false; 
                    this.$toast(res.msg);
                }

            }).catch(err => {})
        },
        // 新增订单(能够新增订单的前提是该用户已认证)
        addOrder(){ 
            let param = {                
                url: commonURL + '/api/order/addOrderInfo',
                data: {
                    account_no:this.digit_account,
                    account_type:1,//数字钱包
                    account_username:this.username,//姓名
                    amount:localStorage.getItem('BtotalPrice'),//总价
                    digit_num:localStorage.getItem('Bnum'),//数量
                    order_type:0,//买
                    phone:this.phone,//手机号
                    orderid:this.phone+''+new Date().getTime(),//订单号(手机号+时间戳)

                    phone:phone
                }
            }
            this.showLoading = true;
            myAjax2(param).then(res => {
                //成功                  
                if (res.code == '0000') {//库里有数据
                    let _result = res.data.userInfo;                    
                    this.username = _result.username;
                    this.digit_account = _result.digit_account;
                    if(_result.check_status == 0){ //老用户 未认证                        
                        this.showValidBtn = true;
                        this.isUnValid = false;
                    }else{ //已认证
                        this.showValidBtn = false;
                    }
                    this.showLoading = false;                                          
                } else { // 库里无数据(需要校验钱包) 新用户 未认证
                    this.showValidBtn = true;
                    this.isUnValid = true;
                    this.showLoading = false; 
                    //this.$toast(res.msg);
                }

            }).catch(err => {})
        },
        
        // 校验手机号
        validPhone(val){            
            val = Number(val);
            return /^[1][3,4,5,7,8][0-9]{9}$/.test(val);          
        },
        // 校验姓名(必填) 校验数字钱包(必填)
        validRequire(val){
            val = val.replace(/(^\s*)|(\s*$)/g, "");
            if(val == ''){
                return false;
            }else{
                return true;
            }
            
           
        },
        // 操作-验证钱包按钮
        validDigit(){                        
            Promise.all([
                this.$refs.userForm.validate('phone'),
                this.$refs.userForm.validate('username'),
                this.$refs.userForm.validate('digit_account'),
            ])        
            .then(res=>{
                // 通知接口
                this.smsCheck();
                                              
            })
            .catch(err=>{})
        },

        // 通知后台校验接口
        smsCheck(){
            let param = {                
                url: commonURL + '/api/user/smsCheck',
                data: {                    
                    phone:this.phone,                     
                }
            }
            this.showLoading = true;
            myAjax2(param).then(res => {                                                          
                if (res.code == '0000') {
                    this.showLoading = false;
                    // 新增用户信息接口 
                    this.addUser();  
                } else {                         
                    this.showLoading = false; 
                    this.$toast(res.msg);
                }
                this.showLoading = false; 
            }).catch(err => {})
        },

        // 打印校验失败信息
        onFailed(errorInfo) {
            // console.log('failed', errorInfo);
        },
        onFailed2(errorInfo) {
            // console.log('failed', errorInfo);
        },
          
                  
        
    }
})