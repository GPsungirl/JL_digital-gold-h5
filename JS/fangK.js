let vm = new Vue({
    el: '#toFangK',
    data: {
        showLoading: false,
        

        // 定时轮询标志
        timer:null,
        
        // 确定按钮的禁用状态
        isDisabled:true,
        _queryResult:'放款成功',
        showPending:true,
        showError:false,
        showSuccess:false,
        showTimeout:false,
    },
    created() {
        var vm = this;
        var  time = 10 * 60;
        var  timer = setInterval(() => {
            this.myTime = countDown(time--);
            // console.log(show);
            if (time < 0) {
                console.log('倒计时结束！');
                clearInterval(vm.timer)
                clearInterval(timer)
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
                    
                    if(res.data.orderStatus == 1){
                        // orderPayStatus:1已放币
                        if(res.data.orderPayStatus == 1){
                            clearInterval(this.timer)
                            this.isDisabled = false;
                            this.showLoading = false; 

                            // 显示放币成功
                            this.showPending = false;
                            this.showSuccess = true;
                            this.showError = false;
                            this.showTimeout=false;
                        }
                    }else if(res.data.orderPayStatus == 2){ // 失败
                        clearInterval(this.timer)
                        this.isDisabled = false;
                        this.showLoading = false; 
                        this.$toast('放款失败');
                        this.showSuccess = false;
                        this.showPending = false;
                        this.showError = true;
                        this.showTimeout=false;
                    }else{
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