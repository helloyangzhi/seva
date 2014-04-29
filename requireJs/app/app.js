requirejs.config({
    baseUrl: 'js',
    paths: {
        app: 'app'
    }
});

require(["jquery","show","cat"],function($,show,cat){
    //alert($("#tt").val());
    //alert(show);
    alert("go");
});