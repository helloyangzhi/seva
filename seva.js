/*
 *  seva.js
 *  seva framework
 */
;(function(w,u){

    //判断浏览器是遵循W3C标准,或者为IE9+浏览器
    var W3C = w.document.dispatchEvent ? true: false,
        readyList = [];
        class2type = {
            "[object Boolean]" : 'boolean',
            "[object Number]" : 'number',
            "[object String]" : 'string',
            "[object Function]" : 'function',
            "[object Array]" : 'array',
            "[object Date]" : 'date',
            "[object RegExp]" : 'RegExp',
            "[object Object]" : 'object'
        },
        toString = Object.prototype.toString;

    //seva framework core model
    var seva = function(){
        return {
            ready:function(fn){
                if(readyList){
                    readyList.push(fn);
                }else{
                    fn();
                }
            },
            bind: W3C ? function(el,type,fn,isup){
                 el.addEventListener(type,fn,!!isup);
                 return fn;
            }:function(el,type,fn){
                el.attachEvent && el.attachEvent("on" + type,fn);
                return fn;
            },
            extend:function(){
            },
            isFunction:function(obj){
               return seva.type(obj) === 'function';
            },
            isArray: Array.isArray || function(obj){
               return seva.type(obj) === 'array';
            },
            isNaN:function(obj){
                return obj !== null && obj !== obj;
            },
            type: function(obj) {
                    return obj == null ?
                        String( obj ) :
                        class2type[ toString.call(obj) ] || "object";
            },
            noop: function(){},
            require: function(){
                //需要一个require的方法
            }
        };
    }(); 

    var readyFn,ready = W3C ? "DOMContentLoaded" : "readystatechange";

    //firefox低版本不支持readyState,所以自定义一个readyState变量
    if(!document.readyState){
        var readyState = DOC.readyState = "loading";
    }

    function fireReady (){
        for (var i = 0 , fn; fn = readyList[i++];){
            fn();
        }
        readyList = null;
        fireReady = seva.noop; //隋性函数，防止IE9二次调用_checkDeps
    }

    //如果是在domReady之后再加载的方法,那么立刻执行.
    if(document.readyState === "complete"){
        fireReady();
    }else{
        seva.bind(document,ready,readyFn = function(){
            if(W3C || document.readyState == "complete"){
                fireReady();
                if(readyState){
                    document.readyState = "complete";
                }
            }
        });
    }

    //挂载到window下
    window.sv = window.seva =  seva;
})(window,undefined);

