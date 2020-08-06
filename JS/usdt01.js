// index对应的js
let vm = new Vue({
    el: '#toBeGuider',
    data: {
        showLoading: false,
        buyActiveImgs:[            
            'IMG/ic_buy_unselected.png',
            'IMG/ic_buy_selected.png',
        ],
        sellActiveImgs:[
            'IMG/ic_sell_unselected.png',
            'IMG/ic_sell_selected.png',
        ],
        buyImg:'IMG/ic_buy_selected.png',
        sellImg:'IMG/ic_sell_unselected.png',

        // 默认买入
        type:'1',
        Btype:'buy',
        // 数量
        usd1Num:'',
        // 实时价格(显示)
        unitPrice:'0.00 CNY',
        
        totalSingle:'',  // 后台=>单价(计算:分)  实时价格+预付费价格
        instancePrice:'',// 后台=>实时价(计算:分)/单价        
        prePrice:'',// 后台=>预付费单价(计算：分)        
        totalNum:'',// 前台=>总价(计算:元)
        
        //totalPrice:'0.00 CNY',// 总价(显示)
        // 手续费
        servePrice:'1%',
        // 单价注释
        unit_command:'因行情可能会发生波动，成交价格若高于最高价，购买将会失败，款项直接退回。',
        testTime:'',
        vconsole:null,
    },
    created() {
        // this.vconsole = new VConsole()
        //FastClick.attach(document.body);
        // 默认买入
        this.getCoinData('1');
        // console.log(this)
        // this.$toast({
        //     message:'提交成功',
        //     duration:5000
        // })

       
    },
    watch:{
        // 监听数量
        phone(val){
            val = trim(val)
            console.log(val)
        }
    },
    computed: {
        
        totalPrice: function () {
            let type = this.Btype;
            let validV = Number(this.usd1Num);            
            let validReg = /^(([1-9]{1}\d*)|(0{1}))(\.\d{1,7})?$/.test(validV);
            let _all;
            if(validReg ){                
                switch(type) {
                    case 'sell':
                        _all = this.totalSingle /100 * this.usd1Num;                        
                       break;
                    case 'buy':
                        _all = this.totalSingle /100 * this.usd1Num * 1.01;                        
                       break;
                    default:
                        _all = this.totalSingle /100 * this.usd1Num * 1.01;
                        
                }                 
                
                this.totalNum = save2num(_all);                
                return  (this.totalNum  + 'CNY')                
            }            
           
        }
    },
    methods: {
        // 获取最新货币信息
        getCoinData(type){
            
            let param = {                
                url: commonURL + '/api/order/getCoinInstancePrice',
                data: {
                    type:type
                }
            }
            this.showLoading = true;
            myAjax2(param).then(res => {
                //成功
                // console.log(res)   
                if (res.code == '0000') {
                    this.resetData();
                    this.showLoading = false;  
                    this.instancePrice = res.data.instancePrice;
                    this.prePrice = res.data.prePrice;
                    this.totalSingle = res.data.totalSingle ;

                    switch(type){
                        case '1':
                            this.unitPrice = this.instancePrice/ 100 + ' CNY';
                            this.unit_command = `因行情可能会发生波动，成交价格最高为¥${this.totalSingle/100}。如价格高于¥${this.totalSingle/100}，购买将会失败，款项直接退回。`
                            break;
                        case '2':
                            this.unitPrice = `${this.instancePrice / 100} CNY - ${this.prePrice/100} CNY(波动预扣款)`;
                            break;
                        default:

                    }
                    
                } else {
                    this.$toast(data.msg);
                }

            }).catch(err => {

            })
        },
        // 计算总价(买入)
        computeTotal(type){
            let validV = Number(this.usd1Num);            
            let validReg = /(^[1-9]\d*$)/.test(validV);
            let _all;
            if(validV > 9 && validReg ){                
                switch(type) {
                    case 'sell':
                        _all = this.totalSingle /100 * this.usd1Num;                        
                       break;
                    case 'buy':
                        _all = this.totalSingle /100 * this.usd1Num * 1.01;                        
                       break;
                    default:
                        _all = this.totalSingle /100 * this.usd1Num * 1.01;
                        
                }                 
                
                this.totalNum = save2num(_all);                
                this.totalPrice =  this.totalNum  + 'CNY';                
            }            
        },
        
        // 校验正数(>0且小数最多七位)
        validator(val){            
            val = Number(val);
            return /^(([1-9]{1}\d*)|(0{1}))(\.\d{1,7})?$/.test(val);       
        },
        onFailed(errorInfo) {
            //console.log('failed', errorInfo);
        },
        // 清空数据
        resetData(){
            this.usd1Num = '';
            this.totalNum = '';
            this.totalPrice = '';            
        },
        
        // 操作-下一步
        onSubmit(val){
            
            localStorage.setItem('Bnum',this.usd1Num+''); //购买数量
            console.log('数量')
            console.log(localStorage.getItem('Bnum'));
            
            localStorage.setItem('BtotalNum',this.totalNum); //应该收的钱 
            localStorage.setItem('Btype',this.Btype);  //类型(买入或者卖出)
            console.log(`应收的钱：${this.totalNum}`)
            console.log(`类型：${ this.Btype }`)
            // 单价=>实时价格 
            localStorage.setItem('Bsingle_price',this.instancePrice)
            console.log('单价：')
            console.log(localStorage.getItem('Bsingle_price'))
            // 预付费单价
            localStorage.setItem('Bpre_single_price',this.prePrice);
            console.log('预付费单价')
            console.log(localStorage.getItem('Bpre_single_price'))
            // 预付费总价
            let _pre_total_price = this.prePrice * this.usd1Num;
            localStorage.setItem('Bpre_total_price',_pre_total_price);
            console.log('预付费总价')
            console.log(localStorage.getItem('Bpre_total_price'));
            // 总价
            let _amount = this.instancePrice  * this.usd1Num;
            localStorage.setItem('Bamount',_amount);
            console.log('总价：');
            console.log(localStorage.getItem('Bamount'))
            
            
            //  调往下一步
            // console.log('hello')
            if(this.Btype == 'buy'){
                window.location.href="./buyUser.html"
            }else{
                window.location.href="./sellUser.html"
            }
            
        },
         
        
        // 提交 数据
        postTravelerInfo() {
            // 校验
            if (this.validTravelerInfo()) {
                // 加载中
                this.showLoading = true;
                // 创建参数对象
                let param = {
                    header_token: header_token,
                    url: commonURL + '/api/travelerInfo/addTravelerInfo',
                    data: {

                    }
                }
                // 异步获取后台日期数据  
                myAjax(param).then(data => {
                    //成功
                    if (data.code == '0000') {
                        this.showLoading = false;
                        this.$toast('提交成功')
                        // 请求 最新数据
                        //this.getTravelerInfo();
                    } else {
                        this.$toast(data.msg);
                    }

                }).catch(err => {

                })
            }

        },   
        // 切换Tab
        tabBuySale(ev){
            if(ev == 0){ //买入
                this.Btype = 'buy';
                this.tabImg('buy');
                this.getCoinData('1');
            }else{
                this.Btype = 'sell';
                this.getCoinData('2');
                this.tabImg('sell');
                var elements = document.getElementsByTagName("input");
                $(elements).attr('autocomplete','off');
            }           
        },             
        
        tabImg(type){
            if(type == 'buy'){
                this.buyImg = this.buyActiveImgs[1];
                this.sellImg= this.sellActiveImgs[0];
            }else{
                this.buyImg = this.buyActiveImgs[0];
                this.sellImg= this.sellActiveImgs[1];
            }
        }

    }
})