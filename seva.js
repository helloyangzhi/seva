/*
 *  seva.js
 *  seva framework
 */
;(function(w,u){

    //判断浏览器是遵循W3C标准,或者为IE9+浏览器
    var W3C = w.document.dispatchEvent ? true: false,
        readyList = [];

    //seva framework core model
    var seva = function(){
        return {
            //selector
            run:function(selector){

            },
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
                console.log('extend');
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
        //fireReady = $.noop; //隋性函数，防止IE9二次调用_checkDeps
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

    /*isFunction*/
    /*isArray*/
    /*isObject*/
    /*isNaN*/

    //挂载到window下
    window.sv = window.seva =  seva;
})(window,undefined);

