let vm = new Vue({
    el: '#toSellPay',
    data: {
        showLoading: false,
       
        // 姓名 银行名 银行号 支付宝账户
        digit_num:'',
        username:'',
        bankname:'',
        bankcard:'',
        alipay_account:'',
        total_amount:'',//总金额


        // 钱包账号
        account_no:'',
        account_username:'',
        // 手机号
        phone:'',
        
        // 成功加载获取平台账号之后才可以使用该按钮 
        isDisabled:true,

        
        // 订单号
        orderid:'',
        testTime:'x',
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
        // 从缓存取出 数量 总金额 手机号
        this.digit_num = localStorage.getItem('Bnum');
        
        this.total_amount = Math.floor(Number(localStorage.getItem('BtotalNum'))*100);
        this.phone = localStorage.getItem('Bphone');
        // 初始化剪切板
        this.initClipboard();
        // 获取平台账户数据信息 默认取银行卡的
        this.getDigitAccountNO();
        


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
        
    },
    methods: {
        // *操作-切换tab
        changeTabs(name){
            switch(name){
                case 'bank':
                    this.bankImg = this.bankImgs[1];
                    this.alipayImg = this.aplipayImgs[0];
                    this.getPlatformAccountno(0)
                    break;
                case 'alipay':
                    this.bankImg = this.bankImgs[0];
                    this.alipayImg = this.aplipayImgs[1];
                    this.getPlatformAccountno(2)
                    break;
                default:
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
            
        },
        
        // 查询平台数字钱包
        getDigitAccountNO(){
            // console.log(localStorage.getItem('Bbankcard')) 
            let param = {                
                url: commonURL + '/api/user/getDigitAccountNO',
                data: {
                    
                }
            }
            this.showLoading = true;
            myAjax2(param).then(res => {
                
                //成功                  
                if (res.code == '0000') {
                    let _result = res.data.accountInfo;                    
                    // 平台的账号名 账户号                    
                    this.account_no = _result.account_no; 
                    this.account_username = _result.account_username;
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


        // 新增订单
        submitOrder(){ 
            let _orderid = Math.floor(new Date().getTime() / 1000) + '' +this.phone;//订单号(手机号+时间戳)
            // 缓存orderid(轮询会用)
            localStorage.setItem('Borderid',_orderid);
            // 修正银行卡bank:0;ali:2;
            let __type = localStorage.getItem('BaccountType');
            let _AccountType = matcheAccountType(__type)

            let param = {                
                url: commonURL + '/api/order/addOrderInfo',
                data: {
                    // 用户账户信息
                    account_no:localStorage.getItem('Bbankcard') ,
                    account_type:_AccountType,
                    account_username:localStorage.getItem('Busername'),//姓名
                    // 平台账户信息
                    platform_account_name:this.account_username,
                    platform_account_no:this.account_no,
                    platform_account_type:1,
                    amount:Number(localStorage.getItem('Bamount')),//总价
                    digit_num:Number(localStorage.getItem('Bnum')),//数量
                    order_type:1,//卖
                    orderid:_orderid,
                    phone:localStorage.getItem('Bphone'),//手机号
                    pre_single_price:Number(localStorage.getItem('Bpre_single_price')),//预付费单价
                    pre_total_price:Number(localStorage.getItem('Bpre_total_price')),//预付费总价
                    single_price:Number(localStorage.getItem('Bsingle_price')),//单价
                    total_amount:Math.floor(Number(localStorage.getItem('BtotalNum'))*100),//总金额 （费率+总价）
                    type:'2',
                    username:localStorage.getItem('Busername')
                }
            }
            this.showLoading = true;
            myAjax2(param).then(res => {    
                console.log(res)                    
                if (res.code == '0000') {                                      
                    this.showLoading = false; 
                    // 进入放款页面
                    window.location.href= "./fangK.html"
                }else{
                    this.showLoading = false; 
                    this.$toast(res.msg);
                    setTimeout(()=>{
                        window.location.href= "./index.html"
                    },2000)
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
                              
        
        
        // 校验手机号
        validPhone(val){            
            val = Number(val);
            return /^[1][3,4,5,7,8][0-9]{9}$/.test(val);          
        },
       

        
       
        
          
                  
        
    }
})