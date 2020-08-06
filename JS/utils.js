// 初始化移动端控制台(测试)
// this.vconsole = new VConsole();


// 监听键盘的弹出收起事件
var ua = window.navigator.userAgent.toLocaleLowerCase();
var isIOS = /iphone|ipad|ipod/.test(ua);
var isAndroid = /android/.test(ua);

// 监听键盘
function listenerMobileKeybord() {
    // 判断浏览器
    if (isIOS) {
        keyboard_IOS();
    } else if (isAndroid) {
        
        Keyboard_Android();
    }
}


// 处理IOS键盘收放
var isReset = true; //是否归位
function keyboard_IOS() {
    document.body.addEventListener('focusin', focusinHandler);
    document.body.addEventListener('focusout', focusoutHandler);
}

function focusinHandler() {
    //聚焦时键盘弹出，焦点在输入框之间切换时，会先触发上一个输入框的失焦事件，再触发下一个输入框的聚焦事件   
    isReset = false;
    //  处理焦点逻辑
    // $('.posi_b').css('display','none');
    $('.posi_b').css('position','relative');
}

function focusoutHandler() {
    isReset = true;
    setTimeout(() => {
        //当焦点在弹出层的输入框之间切换时先不归位
        if (isReset) {
            //确定延时后没有聚焦下一元素，是由收起键盘引起的失焦，则强制让页面归位
            window.scroll(0, 0);
            // 处理失去焦点逻辑
            // $('.posi_b').css('display','block');
            $('.posi_b').css('position','fixed');
        }
    }, 30);
    // $('.posi_b').css('display','block');
    $('.posi_b').css('position','fixed');
}
// 处理Android键盘收放

function Keyboard_Android() {      
    $(window).resize(resizeHandler) 
    // window.addEventListener('resize', resizeHandler);
}
var viewHeight = window.innerHeight;
function resizeHandler(){
    
    
    var thisHeight = $(this).innerHeight(); 
    var activeElement = document.activeElement;
      if (viewHeight - thisHeight > 50) { 
         
        $('.posi_b').css('position','relative');
        if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {                        
            setTimeout(() => {
                activeElement.scrollIntoView({
                    block: 'center'
                }); //焦点元素滚到可视区域的问题
                // $('.posi_b').css('position','relative');
            }, 0)
        }
      } else {  
          //窗口发生改变(小),故此时键盘收起   
          $('.posi_b').css('position','fixed');
      }

    // var originHeight = document.documentElement.clientHeight || document.body.clientHeight;
    // var resizeHeight = document.documentElement.clientHeight || document.body.clientHeight;
    // var activeElement = document.activeElement;
    // 键盘弹起后逻辑
    // if (resizeHeight < originHeight) {
    //     alert('键盘弹起了1')
    //     $('.posi_b').css('display','none');
    //     if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
    //         alert('键盘弹起了2')
    //         $('.posi_b').css('display','none');
    //         setTimeout(() => {
    //             activeElement.scrollIntoView({
    //                 block: 'center'
    //             }); //焦点元素滚到可视区域的问题
    //             alert('键盘弹起了3')
    //             $('.posi_b').css('display','none');
    //         }, 0)
    //     }
    // } else {
    //     // 键盘收起后逻辑
    //     $('.posi_b').css('display','block');
    // }
}



// 为全局input绑定focus事件
function focusInput(focusClass) {
    // 群去input的历史记录
    var elements = document.getElementsByTagName("input");
    $(elements).attr('autocomplete','off');

    for (var i = 0; i < elements.length; i++) {
        // console.log($(elements[i]).parents('.van-field').attr('class'))
        if (elements[i].type != "button" && elements[i].type != "submit" && elements[i].type != "reset") {
            if (!($(elements[i]).parents('.van-field').is('.readInput'))) {
                elements[i].onfocus = function () {
                    $(this).parents('.van-cell.van-field').addClass(focusClass)
                };
                elements[i].onblur = function () {

                    $(this).parents('.van-cell.van-field').removeClass(focusClass)
                };
            }

        }
    }
}

// 全局事件监听处理
window.onload = function () {
    
    focusInput('focusInput');

    // 处理键盘
    listenerMobileKeybord();
    // 避免消失
    // alert('最新')
    $('.posi_b').css('display','block');
    $('.posi_b').css('position','fixed');
}

// 关闭按钮(暂时不用)
function closeDialog(cls) {
    // $('.'+cls).css('display','none');
    // // console.log(cls)
    // $('.van-overlay').css('display','none')
}

// 存储 日期插件用到的 方法
var getYearMonthDay = function (date) {
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    return {
        year,
        month,
        day
    }
}
// 获取当前 日期
var getDate = function (year, month, day) {
    return new Date(year, month, day)
}

// 处理 年月日 格式 YYYY MM DD
var formatDate = function (year, month, day) {
    let y = year;
    // 处理 month
    let m = month + 1;
    m = m < 10 ? '0' + m : m
    // 处理 day
    let d = day < 10 ? '0' + day : day;
    return y + '-' + m + '-' + d
}


// 封装一个 async await 的 异步函数   header_token: token  url:是具体接口地址 commonUrl + apiUrl  data: 参数列表
// eg:token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0Yjc3ZDFlODU4ODk0Y2Y3YWMwZjhlYzM2OWFiNDA0MSJ9.IRinAnnE0e5w5p_lz0g0_E5tKBst4F2Xlm0u3QInCSI'
// url: /api/travelerInfo/selectTrevelerSchedul

// 处理时间字符串为时间戳 date:'2030-05-25 15:14:59'
var getTimeStap = function getTimeStap(date) {
    date = date.replace(/-/g, '/');
    return new Date(date).getTime();
}
// 比较后台时间与当前时间，后台大则显示，后台小则不显示
var showMemberTime = function showMemberTime(dateTime) {
    var currentTime = new Date().getTime();
    if (currentTime > dateTime) {
        return false;
    } else {
        return true;
    }
}

// 格式化日期

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
/**
 * 
 * @param {*} param :header_token url data
 */
function myAjax(param) {
    return new Promise((resolve, reject) => {
        $.ajax({
            headers: {
                token: param.header_token // param 1
            },
            contentType: 'application/json',
            type: 'POST',
            url: param.url, // param 2
            data: param.data ? JSON.stringify(param.data) : null, // param 3
            dataType: 'json',
            success(res) {
                resolve(res)
            },
            error(err) {
                reject(err)
            }
        })
    })
}
// 浏览器充值
function webAjax(param) {
    return new Promise((resolve, reject) => {
        $.ajax({
            headers: {
                reqcustom: param.reqcustom,
            },
            contentType: 'application/json',
            type: 'POST',
            url: param.url, // param 2
            data: param.data ? JSON.stringify(param.data) : null, // param 3
            dataType: 'json',
            success(res) {
                resolve(res)
            },
            error(err) {
                reject(err)
            }
        })
    })
}
// 分享
function myAjax2(param) {
    return new Promise((resolve, reject) => {
        $.ajax({
            contentType: 'application/json',
            type: 'POST',
            url: param.url, // param 2
            data: param.data ? JSON.stringify(param.data) : null, // param 3
            dataType: 'json',
            success(res) {
                resolve(res)
            },
            error(err) {
                reject(err)
            }
        })
    })
}

// 手机号校验
function validPhone(phone) {
    var phoneRule = /^1(3|4|5|6|7|8|9)\d{9}$/;
    return phoneRule.test(phone);
}

// 去空格
function trim(str) { //删除左右两端的空格
    return str.replace(/(^\s*)|(\s*$)/g, "");
}


// 多位数保留两位（多的进一位）
function save2num(val) {
    var val_num = Number(val);
    var val_str = val + '';
    // 判定是否是小数
    var flag1 = val_str.indexOf('.') > -1;
    // 若是小数，判定是否多于两位
    var flag2 = false;
    if (flag1) {
        flag2 = val_str.split('.')[1].length > 2;
    }
    if (flag1 && flag2) { //如果是小数且位数多于两位
        var _val_numf = Number((val_num * 100 + '').split('.')[0]) + 1;
        return _val_numf / 100;
    } else {
        return val_num;
    }
}


// 倒计时
function caculateTime() {
    var show;
    var time = 5 * 60;
    var timer = setInterval(() => {
        show = countDown(time--);
        console.log(show);

        if (time < 0) {
            console.log('倒计时结束！');
            clearInterval(timer);
        }

    }, 1000);
}

function countDown(second) {
    var s = second % 60;
    var m = Math.floor(second / 60);
    var f_m = ('00' + m).slice(-2);
    var f_s = ('00' + s).slice(-2);
    return (f_m + ':' + f_s);
}


// 配对银行卡或者支付宝类型 type:bank 0 ; ali:2
function matcheAccountType(type) {

    if (type == 'bank') {
        return 0;
    } else {
        return 2;
    }

}

// 返回按钮
function onClickLeft(type) {
    switch (type) {
        case '-1':
            window.history.back();
            break;
        default:
            window.location.href = './' + type + '.html';

    }
}






// 公共接口正式
var commonURL = 'http://3.114.17.241:6970'

// var commonURL = 'http://192.168.1.177:6970'