let vm = new Vue({
    el: '#toFangB',
    data: {
        showLoading: false,
        

        // 定时轮询标志
        timer:null,
        
        // 确定按钮的禁用状态
        isDisabled:true,
        _queryResult:'放币成功',
        myTime:'',
        showPending:true,
        showError:false,
        showTimeout:false,
        showSuccess:false,
    },
    created() {
        var vm = this;
        var  time = 10 * 60;
        var  timer = setInterval(() => {
            this.myTime = countDown(time--);
            // console.log(show);
            if (time < 0) {
                // 倒计时结束后：
                console.log('倒计时结束！');
                clearInterval(vm.timer);
                clearInterval(timer);
                vm.$toast('请求超时');
                vm.showLoading = false;
                vm.isDisabled = false;

                // 提示超时
                vm.showError = false;
                vm.showPending = false;
                vm.showSuccess = false;
                vm.showTimeout = true;
            }            
        }, 1000);
        
        // 轮询执行
        this.showLoading = true;
        this.timer = setInterval(this.queryPayStatus,8000)
       
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
        // 轮询放币接口
        queryPayStatus(){
            
            let param = {                
                url: commonURL + '/api/order/getOrderPayStatus',
                data: {
                   orderid:localStorage.getItem('Borderid')
                }
            }
            
            myAjax2(param).then(res => {
                //成功  
                            
                if (res.code == '0000') {
                    // orderStatus 1可用
                    if(res.data.orderStatus == 1){
                        // orderPayStatus:1已放币
                        if(res.data.orderPayStatus == 1 ){
                            clearInterval(this.timer)
                            this.isDisabled = false;
                            this.showLoading = false; 
    
                            // 显示放币成功
                            this.showPending = false;
                            this.showError = false;
                            this.showTimeout=false;
                            this.showSuccess = true;

                        }
                    }else if(res.data.orderStatus == 2){ //放币失败
                        clearInterval(this.timer)
                        this.isDisabled = false;
                        this.showLoading = false;
                        this.$toast('放币失败');
                        this.showSuccess = false;
                        this.showPending = false;
                        this.showTimeout=false;
                        this.showError = true;
                    }else{ // 超时
                        clearInterval(this.timer)
                        vm.$toast('请求超时');
                        vm.showLoading = false;
                        vm.isDisabled = false;

                        // 提示超时
                        vm.showError = false;
                        vm.showPending = false;
                        vm.showSuccess = false;
                        vm.showTimeout = true;
                    }
                                                             
                }

            }).catch(err => {})
        },
         
        // 回到首页
        backToIndex(){
            window.location.href = './index.html'
        },


        
                  
        
    }
})